#--Global Execution params----

Exec {
          path => "/usr/bin:/usr/sbin:/bin:/usr/local/bin:/usr/local/sbin:/sbin:/bin/sh",
          user => root,
		  #logoutput => true,
}

#--apt-update Triggers-----

exec { "apt-update":
    command => "sudo apt-get update",
}

Exec["apt-update"] -> Package <| |> #This means that an apt-update command has to be triggered before any package is installed


#--Miscellaneous Execs-----

exec {"fix guest addition issues": #presumed to be necessary because of a vagrant bug regarding auto-mounting
     #command => "ln -s /opt/VBoxGuestAdditions-4.3.10/lib/VBoxGuestAdditions /usr/lib/VBoxGuestAdditions",
	 command => 'echo "#!/bin/sh -e" | tee /etc/rc.local && echo "mount -t vboxsf -o rw,uid=1000,gid=1000 vagrant /vagrant" | tee -a /etc/rc.local && echo "exit 0" | tee -a /etc/rc.local',
	 refreshonly => true,
	 notify => Exec["restart system"]
}

exec {"restart system":
     command => "shutdown -r now",
	 refreshonly => true,
}

#--Users and Groups---------------

#vagrant already preconfigs a user called 'vagrant'. However, you can add your own users as shown below. Refer to the puppet type reference documentation (docs.puppetlabs.com/references/latest/type.html) for additional details.
#user { "student":
#     name => "student",
#     ensure => present,
#     groups => ["sudo"]	 
#}


#--Packages----

package { "ubuntu-desktop":
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

package { "python-pip":
   ensure => present,
}

