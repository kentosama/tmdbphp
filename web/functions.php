<?php 

require('config.php');

if ( ! function_exists('glob_recursive'))
{
    // Does not support flag GLOB_BRACE        
   function glob_recursive($pattern, $flags = 0, $mode = false)
   {
     $files = glob($pattern, $flags);
     foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR|GLOB_NOSORT) as $dir)
     {
       if($mode == false) {	
       	chdir($dir);	
       	$files = array_merge($files, glob_recursive(basename($pattern), $flags));
	   }
	   else {
	   	$files = array_merge($files, glob_recursive($dir.'/'.basename($pattern), $flags));
	   } 
     }
  return $files;
  }
}

if ( ! function_exists('display_format')) {
	function display_format($format = "unknow") {
		$formats = array('avi', 'mp4', 'mkv', 'iso', 'img', 'mov');
		
		foreach($formats as $single) {
			if($format == $single)
			$value = $format;
		}
		
		if(!$value) $value = "unknow";
		echo $value; 
	}
}

if (!function_exists('the_title')) {
	function the_title() {
		echo 'TMDBPHP';
	}
}

function get_tmbd_configuration() {
	$config = json_decode(file_get_contents("http://api.themoviedb.org/3/configuration?api_key=cca24708186f61a93e6b698ce185a2a4"), true);
	return $config;
}

function ajax_get_tmdb_data() {
	$title = $_POST['title'];
	$title = strtolower($title);
	$title = str_replace(" ", "%20", $title);
	$data = json_decode(file_get_contents('http://api.themoviedb.org/3/search/movie?language=fr&query='.$title.'&api_key='.tmdbkey), true);
	$config = get_tmbd_configuration();
	echo json_encode($data);
}

function get_tmdb_actors($id) {
	$config = get_tmbd_configuration();
	$data = json_decode(file_get_contents('http://api.themoviedb.org/3/movie/'.$id.'/casts?language=fr&api_key='.tmdbkey), true);
	foreach($data['cast'] as $key => $value) {
		$actors[] = $value['name'];
	}
	
	return $actors;
}

function ajax_set_tmdb_meta() {
	// load configuration of tmdb	
	$config = get_tmbd_configuration();	
	
	// get post data of jquery action
	$id = $_POST['id'];
	$url = $_POST['local'];
	$file = $_POST['file'];
	$ffmpeg = null;
	$file_title = $_POST['title'];
	$extension = get_extension($file);
	$file_title = str_replace(':', ' ', $file_title);
	$new_file = $file_title.'.'.$extension;
	$reponse = 0;
	$folder = str_replace($file, '', $url);
	
	// get datas of movie
	$data = json_decode(file_get_contents('http://api.themoviedb.org/3/movie/'.$id.'?language=fr&api_key='.tmdbkey), true);
	if(!$data) {
		$reponse = 1; 	
	}
	
	// set data into variable
	$title = $data['title'];
	$release = $data['release_date'];
	$year = strtotime($release);
	$release = date('Y', $year);
	$overview = $data['overview'];
	$adult_content = $data['adult'];
	$original_title = $data['original_title'];
	
	// empty variable for array
	$studio = null;
	$actors = null;
	$genres = null;
	$countries = null;
	
	// set valid genre for best translatation
	$valid_genre = array(	'Action', 'Drame', 'Aventure', 'Comédie', 'Arts Martiaux', 'Policier', 'Guerre', 'Documentaire', 'Horreur', 'Thriller', 'Animation',
							'Fantastique', 'Science-fiction', 'Historique');
	
	// get only name of collection
	$collection = $data['belongs_to_collection']['name'];
	$collection = str_replace(' Collection', '', $collection);
	$collection = str_replace(' (Collection)', '', $collection);
	
	// set countries
	if($data['production_countries']) {
		foreach($data['production_countries'] as $country) {
			if($country != '') {
				$countries[] = translate_country($country['name']);
			}
		}
	}
	
	// set genres
	if($data['genres']) {
		foreach($data['genres'] as $genre) {
			if($genre != '' && in_array($genre['name'], $valid_genre))		
			$genres[] = $genre['name'];
		}
	}
	
	// set production companies
	if($data['production_companies']) {
		foreach($data['production_companies'] as $compagnies) {
			if($compagnies != '')		
			$studio[] = $compagnies['name'];
		}
	}
	
	// set actors
	$actors = get_tmdb_actors($id);
	
	// set poster
	$poster = file_get_contents($config['images']['base_url'].$config['images']['poster_sizes'][3].$data['poster_path']);
	$poster = str_replace('//', '/', $poster);
	
	// set datas of movie in array
	$file_array = array(	'title' => $title, 'original_title' => $original_title, 'collection' => $collection, 
							'genres' => $genres, 'release_date' => $release,  'countries' => $countries, 'studios' => $studio, 
							'overview' => $overview, 'adult' => $adult_content, 'actors' => $actors);
	
	// create a xml file
	$xml = new SimpleXMLElement('<movie/>');
	foreach($file_array as $key => $value){
		if(is_array($value)) {
			$key = $xml->addchild($key);
			$key->addChild('number', count($value));
			foreach($value as $single){	
				$key->addChild('name', $single);
			}
		} else $key = $xml->addchild($key, $value);
	}
	
	$xml = $xml->saveXML();
	$dom = new DOMDocument();
	$dom->loadXML($xml);
	$dom->formatOutput = true;
	$dom->encoding = 'utf-8';
	$formattedXML = $dom->saveXML();
	$file_no = substr($file, 0, strrpos( $file, '.' ));
	$file_img = $file_title.'.jpg';
	$file_xml = $file_title.'.xml';
	
	
	// save the poster
	file_put_contents(posters_folder.$file_img, $poster);
	file_put_contents('posters/'.$file_img, $poster);
	
	// save the xml file
	if(!file_put_contents(metas_folder.$file_xml, $formattedXML))
	$reponse = 3;
	
	//rename the file
	sleep(1); 
	if($url != $folder.$new_file || strstr($url, ':')) {
		if(rename($url, $folder.$new_file));
		$response = 4;
	}
	
	// save data array in txt file
	//foreach($file_array as $key => $single) {
		//file_put_contents(metas_folder.$title.'.nfo', $key.' : '.$single.PHP_EOL, FILE_APPEND);
	//}
	
	$url = $_POST['local'];
	
	if($studio != '')
		$studio = ' -metadata copyright="'.$studio.'"';
	else $studio = '';
	
	$folder = substr($url, strrpos( $url, 'Films/'));
	
	if($ffmpeg)
		ffmpeg($url, $title, $genre);
	
	echo $reponse;
		
	die();
}

function ffmpeg($url, $title, $genre) {
		//$ffmpeg = system('ffmpeg -i '.$url.' -metadata title="'.$title.'" -metadata genre="'.$genre.'" '.$studio.' -metadata comment="'.$country.'" -c copy -y '.tmp_folder.$file.' && ffmpeg -i '.tmp_folder.$file.' -c copy -y '.$url.' > /dev/tty < /dev/tty');
	
}

function translate_country($country) {
	$countries = array(	'Japan' => 'Japon', 'China' => 'Chine', 'United States of America' => 'USA', 'Germany' => 'Allemagne', 'United Kingdom' => 'Royaume Unis', 'Czech Republic' => 'République Tchèque',
						'South Korea' => 'Corée du Sud', 'Korea, Republic of' => 'Corée du Sud', 'Brazil' => 'Brésil', 'Russia' => 'Russie');
	foreach($countries as $key => $value) {
		if($key == $country)
		$country = $value;	
	}
	return $country;
}

function setTitle($title, $format) {
	$title = str_replace('.'.$format, '', $title);
	$exclude_from_title = unserialize(exclude_from_title);
	foreach($exclude_from_title as $exclude) {
		$title = str_replace($exclude, ' ', $title);	
		$title = str_replace(strtolower($exclude), ' ', $title);
		$title = str_replace(strtoupper($exclude), ' ', $title);
	}
	$title = str_replace('   ', '', $title);
	return $title;
}

function get_extension($file){
	$explode = explode(".",$file);
	$extension = $explode[count($explode)-1];
	return $extension;
}

function ajax_get_tmdb_config() {
	$config = get_tmbd_configuration();
	echo json_encode($config);
}
$action = '';
$action = $_POST['action'];
if($action != '') {
	$function = 'ajax_'.$action;
	$function();
}

?>