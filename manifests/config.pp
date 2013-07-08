class dropbox::config(
  $user = undef,
  $password = undef,
  $dx_uid   = $dropbox::params::dx_uid,
  $dx_gid   = $dropbox::params::dx_gid,
  $dx_home  = $dropbox::params::dx_home,
  $create_user = false,
  ) inherits dropbox::params {

}
