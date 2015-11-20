#-Global Execution params----

Exec {
          path => "/usr/bin:/usr/sbin:/bin:/usr/local/bin:/usr/local/sbin:/sbin:/bin/sh",
          user => root,
		  #logoutput => true,
}

#--apt-update Triggers-----

exec { "apt-update":
    command => "sudo apt-get update -y",
}

Exec["apt-update"] -> Package <| |> #This means that an apt-update command has to be triggered before any package is installed

#--Hadoop configuration constants----

$hconfig1 = '<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
<property>
  <name>fs.default.name</name>
  <value>hdfs://localhost:9000</value>
</property>
<property>
  <name>hadoop.tmp.dir</name>
  <value>/usr/local/hadoop/data</value>
</property>
</configuration>'

$hconfig2 = '<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
 
<configuration>
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
</configuration>'

$hconfig3 = '<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
 
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>3</value>
    </property>
</configuration>'

$hconfig4 = '<?xml version="1.0"?>
<configuration>
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
    <property>
        <name>yarn.nodemanager.aux-services.mapreduce_shuffle.class</name>
        <value>org.apache.hadoop.mapred.ShuffleHandler</value>
    </property>
    <property>
        <name>yarn.resourcemanager.resource-tracker.address</name>
        <value>localhost:8025</value>
    </property>
    <property>
        <name>yarn.resourcemanager.scheduler.address</name>
        <value>localhost:8030</value>
    </property>
    <property>
        <name>yarn.resourcemanager.address</name>
        <value>localhost:8050</value>
    </property>
</configuration>'

#--Miscellaneous Execs-----

exec {"fix guest addition issues": #presumed to be necessary because of a vagrant bug regarding auto-mounting
     #command => "ln -s /opt/VBoxGuestAdditions-4.3.10/lib/VBoxGuestAdditions /usr/lib/VBoxGuestAdditions",
	 command => 'echo "#!/bin/sh -e" | tee /etc/rc.local && echo "mount -t vboxsf -o rw,uid=1000,gid=1000 vagrant /vagrant" | tee -a /etc/rc.local && echo "exit 0" | tee -a /etc/rc.local',
	 refreshonly => true,
	 #notify => Exec["restart system"]
}


#exec {"restart system":
#     command => "shutdown -r now",
#	 refreshonly => true,
#}

exec {"set hadoop permissions":
     command => "chown -R vagrant /usr/local/hadoop/",
     user => root,
 	 #require => User["hduser"],
     subscribe => Exec["install hadoop"],
     refreshonly => true,
}

exec {"set kafka permissions":
     command => "chown -R vagrant /usr/local/kafka/",
     user => root,
 	 #require => User["hduser"],
     subscribe => Exec["install kafka"],
     refreshonly => true,
}

exec {"set hadoop env":
     environment => 'HOME=/home/vagrant',
     command => 'echo "export HADOOP_HOME=/usr/local/hadoop" | tee -a .bashrc && echo "export JAVA_HOME=/usr" | tee -a .bashrc && echo "export HADOOP_OPTS=\"$HADOOP_OPTS -Djava.library.path=/usr/local/hadoop/lib/native\"" | tee -a .bashrc && echo "export HADOOP_COMMON_LIB_NATIVE_DIR=\"/usr/local/hadoop/lib/native\"" | tee -a .bashrc',
     require => Package["default-jdk"],
	 user => vagrant,
     subscribe => Exec["install hadoop"],
     refreshonly => true,
}

exec {"configure hadoop  1":
     command => 'sed -i \'s/${JAVA_HOME}/\/usr/\' /usr/local/hadoop/etc/hadoop/hadoop-env.sh && sed -i \'/^export HADOOP_OPTS/ s/.$/ -Djava.library.path=$HADOOP_PREFIX\/lib"/\' /usr/local/hadoop/etc/hadoop/hadoop-env.sh && echo \'export HADOOP_COMMON_LIB_NATIVE_DIR=${HADOOP_PREFIX}/lib/native\' | tee -a /usr/local/hadoop/etc/hadoop/hadoop-env.sh',
     subscribe => Exec["install hadoop"],
     refreshonly => true,
}

exec {"configure hadoop 2":
      command => 'echo \'export HADOOP_CONF_LIB_NATIVE_DIR=${HADOOP_PREFIX:-"/lib/native"}\' | tee -a /usr/local/hadoop/etc/hadoop/yarn-env.sh && echo \'export HADOOP_OPTS="-Djava.library.path=$HADOOP_PREFIX/lib"\' | tee -a /usr/local/hadoop/etc/hadoop/yarn-env.sh',
      subscribe => Exec["install hadoop"],
      refreshonly => true,
}

exec {"configure hadoop 3":
      command => "echo \'${hconfig1}\' | tee /usr/local/hadoop/etc/hadoop/core-site.xml && echo '${hconfig2}' | tee /usr/local/hadoop/etc/hadoop/mapred-site.xml && echo '${hconfig3}' | tee /usr/local/hadoop/etc/hadoop/hdfs-site.xml && echo '${hconfig4}' | tee /usr/local/hadoop/etc/hadoop/yarn-site.xml",
      subscribe => Exec["install hadoop"],
      refreshonly => true,
}
#exec {"configure hadoop 4" :
#      command => "sudo rm -rf /usr/local/hadoop/data && /usr/local/hadoop/bin/hadoop namenode -format",
#      subscribe => Exec["install hadoop"],
#      refreshonly => true,
#}

exec {"configure localhost ssh":
      command => "cat /dev/zero | ssh-keygen -q -N \"\" && cat /home/vagrant/.ssh/id_rsa.pub >> /home/vagrant/.ssh/authorized_keys && chmod og-wx /home/vagrant/.ssh/authorized_keys",
      user => vagrant,
      refreshonly => true,
}

exec {"configure spark logs":
      command => "sed -i 's/INFO, console/WARN, console/g' /usr/local/spark/conf/log4j.properties.template && mv /usr/local/spark/conf/log4j.properties.template /usr/local/spark/conf/log4j.properties",
      subscribe => Exec["install spark"],
      refreshonly => true,
}

exec {"configure cassandra":
      command => 'sudo sed -i \'s/MAX_HEAP_SIZE=\"\${max_heap_size_in_mb}M\"/MAX_HEAP_SIZE=\"256M\"/g\' /etc/cassandra/cassandra-env.sh',
      subscribe => Exec["install cassandra"],
      refreshonly => true,
}

exec {"install boto":
      command => "pip install boto",
      subscribe => Package["python-pip"],
      refreshonly => true,
}

#--Disabling IPv6 (for Hadoop)---

exec {"disable ipv6":
     command => "echo 'net.ipv6.conf.all.disable_ipv6 = 1' | tee -a /etc/sysctl.conf && echo 'net.ipv6.conf.default.disable_ipv6 = 1' | tee -a /etc/sysctl.conf && echo 'net.ipv6.conf.lo.disable_ipv6 = 1' | tee -a /etc/sysctl.conf",
      subscribe => Exec["install hadoop"],
      refreshonly => true,
}

#--Users and Groups---------------

#vagrant already preconfigs a user called 'vagrant'. However, you can add your own users as shown below. Refer to the puppet type reference documentation (docs.puppetlabs.com/references/latest/type.html) for additional details.
#user { "student":
#     name => "student",
#     ensure => present,
#     groups => ["sudo"]	 
#}

#--Hadoop Installation-----------
 
exec { "install hadoop":
    command => "wget http://perso.uclouvain.be/marco.canini/ingi2145/hadoop-2.6.0.tar.gz && tar -xzf hadoop-2.6.0.tar.gz && mv hadoop-2.6.0/ /usr/local && cd /usr/local && ln -s hadoop-2.6.0/ hadoop",
	#command => "wget http://blog.woopi.org/wordpress/files/hadoop-2.4.0-64bit.tar.gz && tar -xzf hadoop-2.4.0-64bit.tar.gz && mv hadoop-2.4.0/ /usr/local && cd /usr/local && ln -s hadoop-2.4.0/ hadoop",
    creates => "/usr/local/hadoop",
    require => Package["default-jdk"],
    timeout => 600,
    tries => 3,
    try_sleep => 60,
}

#--Kafka Installation------------
#Change the permissions to the /usr/local/kafka?
exec { "install kafka":
    command => "wget http://perso.uclouvain.be/marco.canini/ingi2145/kafka_2.8.0-0.8.1.1.tgz && tar -xzf kafka_2.8.0-0.8.1.1.tgz && sudo mv kafka_2.8.0-0.8.1.1/ /usr/local && cd /usr/local && sudo ln -s kafka_2.8.0-0.8.1.1/ kafka",
    creates => "/usr/local/kafka",
    require => Package["default-jdk"],
    timeout => 600,
    tries => 3,
    try_sleep => 60,
}

#--Apache Spark Installation-----

exec { "install spark":
    command => "wget http://perso.uclouvain.be/marco.canini/ingi2145/spark-1.4.1-bin-hadoop2.6.tgz && tar -xzf spark-1.4.1-bin-hadoop2.6.tgz && mv spark-1.4.1-bin-hadoop2.6/ /usr/local && cd /usr/local && ln -s spark-1.4.1-bin-hadoop2.6/ spark",
    creates => "/usr/local/spark",
    require => Package["default-jdk"],
    timeout => 600,
    tries => 3,
    try_sleep => 60,
}

#--Cassandra Installation-----

exec { "install cassandra":
    command => 'echo "deb http://debian.datastax.com/community stable main" | sudo tee -a /etc/apt/sources.list.d/cassandra.sources.list && curl -L http://debian.datastax.com/debian/repo_key | sudo apt-key add - && sudo apt-get update && sudo apt-get install dsc20=2.0.11-1 cassandra=2.0.11 -y && sudo service cassandra stop && sudo rm -rf /var/lib/cassandra/data/system/* && sudo service cassandra start',
    creates => "/etc/cassandra",
    require => Package["default-jdk"],
    timeout => 600,
    tries => 3,
    try_sleep => 60,
}

#--Packages----

package { "lubuntu-desktop":
  ensure => present,
  notify => Exec["fix guest addition issues"],
  install_options => ['--no-install-recommends'],
}

package { "git":
   ensure => present,
}

package { "ssh":
   ensure => present,
}

package { "eclipse":
   ensure => present,
}

package { "maven2":
   ensure => present,
   require => Package["default-jdk"],
}

package { "python-pip":
   ensure => present,
}

package { "awscli":
   ensure => present
}

package { ["nodejs", "npm"]:
   ensure => present
}

package { "default-jdk":
   ensure => present,
}

package { "memcached":
   ensure => present
}

package { "mongodb":
   ensure => purged
   #ensure => absent #If purged does not work
}

