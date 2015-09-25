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

#--Packages---

package { "git":
   ensure => present,
}

package { "ssh":
   ensure => present,
}

package { "python-pip":
   ensure => present,
}
