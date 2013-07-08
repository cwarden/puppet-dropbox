# Puppet module for installing dropbox

Install dropbox:

````
include dropbox
````

Install dropbox and automatically link it to your account:

````
class { 'dropbox::config':
	user     => 'user@example.com',
	password => 'password',
        create_user => true,
        dx_uid => 'dropbox_user',
        dx_gid => 'dropbox_user',
        dx_gid => '/home/dropbox_user',
}
include dropbox
````
