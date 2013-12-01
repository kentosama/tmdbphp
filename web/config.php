<?php


$KEY = 'cca24708186f61a93e6b698ce185a2a4';
$MOVIES_FOLDER = '/mnt/HD/HD_a2/videos/films/';
$POSTERS_FOLDER = $MOVIES_FOLDER.'.posters/';
$METAS_FOLDER = $MOVIES_FOLDER.'.metas/';
$TMP_FOLDER = $MOVIES_FOLDER.'.tmp/';
$EXCLUDE_FROM_TITLE = serialize(array('.', 'DVDRIP', 'VOSTFR');

define('tmdbkey', $KEY);
define('movies_folder', $MOVIES_FOLDER);
define('posters_folder', $POSTERS_FOLDER);
define('metas_folder', $METAS_FOLDER);
define('tmp_folder', $TMP_FOLDER);
define('exclude_from_title', $EXCLUDE_FROM_TITLE);    
?>