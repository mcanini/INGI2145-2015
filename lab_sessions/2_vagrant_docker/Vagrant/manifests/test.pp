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

#--Users and Groups---------------
#user { "student":
#     name => "student",
#     ensure => present,
#     groups => ["sudo"]	 
#}

#--Packages----
package { "git":
   ensure => present,
}
package { "ssh":
   ensure => present,
}
package { "python-pip":
   ensure => present,
}

