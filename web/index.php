<?php

include('head.php');

$folder = movies_folder;
chdir($folder);
$movies = glob_recursive('*.{avi,mkv,mp4,iso}', GLOB_BRACE, false);
chdir($folder);
$movies_dir = glob_recursive('*.{avi,mkv,mp4,iso}', GLOB_BRACE, true);
sort($movies);
sort($movies_dir);
?>

<div class="wrapper-left-content">
<p class="total-movies">Total : <?php echo count($movies); ?> movies</p>
<?php
$count = 0;
foreach($movies as $key => $movie) {
	$count++;
	$title = $movie;
	$explode = explode(".",$movie);
	$format = $explode[count($explode)-1];
	$title = setTitle($title, $format);
	$xml = metas_folder.$title.'.xml';
	if(file_exists($xml))
	$xml = XmlToJson::Parse(metas_folder.$title.'.xml');
	
	?>
	<div class="movie" id="movie-<?php echo $count; ?>">
	<input type="hidden" id="local-url" value="<?php echo $folder.$movies_dir[$key]; ?>">
	<input type="hidden" id="file" value="<?php echo $movie; ?>">
		
			<p>
			<input type="text" class="movie-title" value="<?php echo $title; ?>">
			<span class="format">Format : <?php display_format($format); ?></span> | 
				<a class="play-movie" href="file://<?php echo $folder.$movies_dir[$key]; ?>">Open movie</a></span>
				| <a class="get-metadata" href="#" onclick="return false;">Get metadata</a></span>
			</p>
		</div>
	
	<?php
	
}

?>

</div>
<?php include('sidebar.php'); ?>
<?php include('footer.php'); ?>

<script type="text/javascript">
 jQuery(document).ready(function(){
 	var config;
 	$.ajax({ url : "functions.php",
         data: {action: 'get_tmdb_config'},
         type: 'post',
         dataType: "json",
         success: function(response) {
         config = response;
         console.log(response);
         }
       }, function () {
       	console.log(config);
       });
 	
 	$('.get-metadata').click(function() {
 		if(config != "") {
 		var parent = $(this).parent().parent().attr('id');
 		var title = $(this).parent().find('.movie-title').val();
 		 $.ajax({ url : "functions.php",
         data: {action: 'get_tmdb_data', title : title},
         type: 'post',
         dataType: "json",
         success: function(response) {
                      var results = response;
                      
                      $(".result-movies", "#"+parent).remove();
                      
                      $("#"+parent).append('<div class="result-movies"></div>').fadeIn('slow', function() { 
                      
                      var div = $('.result-movies', this);
                      	 $.each(results, function(key, movies) {
                      	 $.each(movies, function(key, movie) {
                      		 
                      		 console.log(movie);
                      		 $(div).append("<div class='result-wrapper'>");
                      		 
                      		 $(div).append("<div class='result-poster'>" + "<img  id='"+movie['id'] + "' class='set-meta' src='" + config['images']['base_url']+config['images']['poster_sizes'][0]+movie['poster_path'] +"' />" + "</div>");
                      		 
                      		 $(div).append("<div class='result-informations'><a href='#' class='set-meta' onclick='javascript:return false;' id='"+movie['id'] + "'>" + movie['title']+"</a><br>"+
                      		 "<span style='font-size: 10px;'>Original title : " + movie['original_title']+
                      		 "</span><br>Release : "+movie['release_date']+"</div>");
                      		 
                      		 $(div).append("</div>");
                      		 $(div).append("<div style='clear:both'>");
                      		 $(div).fadeIn('slow');
                      	});
                      	
                      	});
                      	
                      	});
                      
                  }
                  
          });
         
        } else alert('TMDB configuration is not ready');
 		
 		
 	});
 	var movies = new Array();
 	$(document).on('click', '.set-meta', function() {
 		 var element = $(this);
 		 var id = $(this).attr('id');
 		 var local = $(element).parent().parent().parent().children('#local-url').val(); 
 		 var file = $(element).parent().parent().parent().children('#file').val();
 		 var title = $(element).parent().parent().parent().find('.movie-title').val(); 
 		 var send = setmeta(id, local, file, title);
 		 
 		 movies.push(new Array({id: id, local : local, file : file, title : title}));
 		 
 		 $("#status").show().fadeIn('3000');
 		 
	$.each($("#status").children('p'), function(key, value){
	if($(this).text() == title)
	
	$(this).fadeOut('2000', function() {
		$(this).remove();
	});
	
});
 		 
 });
 
 function setmeta(id, local, file, title) {
 	 
 	 
 	 $.ajax({ url : "functions.php",
         data: {action: 'set_tmdb_meta', id : id, local : local, file : file, title : title},
         type: 'post',
         async: false,
         success: function(response) {
         if(response == 0)
         $("#status").append('<p>'+title+' ... fait.</p>');
         else if(response == 4){
         	$("#status").append('<p>'+title+' ... erreur : impossible de renomer le fichier.</p>');
         }
         
 	}
 	
 	});
 }
 

});
  
</script>


