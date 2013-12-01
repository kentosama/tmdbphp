// Default MediaTomb import script.
// see MediaTomb scripting documentation for more information

/*MT_F*
    
    MediaTomb - http://www.mediatomb.cc/
    
    import.js - this file is part of MediaTomb.
    
    Copyright (C) 2006-2010 Gena Batyan <bgeradz@mediatomb.cc>,
                            Sergey 'Jin' Bostandzhyan <jin@mediatomb.cc>,
                            Leonhard Wimmer <leo@mediatomb.cc>
    
    This file is free software; the copyright owners give unlimited permission
    to copy and/or redistribute it; with or without modifications, as long as
    this notice is preserved.
    
    This file is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
    
    $Id: import.js 2081 2010-03-23 20:18:00Z lww $
*/

function addAudio(obj)
{
 
    var desc = '';
    var artist_full;
    var album_full;
    
    // first gather data
    var title = obj.meta[M_TITLE];
    if (!title) title = obj.title;
    
    var artist = obj.meta[M_ARTIST];
    if (!artist) 
    {
        artist = 'Unknown';
        artist_full = null;
    }
    else
    {
        artist_full = artist;
        desc = artist;
    }
    
    var album = obj.meta[M_ALBUM];
    if (!album) 
    {
        album = 'Unknown';
        album_full = null;
    }
    else
    {
        desc = desc + ', ' + album;
        album_full = album;
    }
    
    if (desc)
        desc = desc + ', ';
    
    desc = desc + title;
    
    var date = obj.meta[M_DATE];
    if (!date)
    {
        date = 'Unknown';
    }
    else
    {
        date = getYear(date);
        desc = desc + ', ' + date;
    }
    
    var genre = obj.meta[M_GENRE];
    if (!genre)
    {
        genre = 'Unknown';
    }
    else
    {
        desc = desc + ', ' + genre;
    }
    
    var description = obj.meta[M_DESCRIPTION];
    if (!description) 
    {
        obj.meta[M_DESCRIPTION] = desc;
    }

// uncomment this if you want to have track numbers in front of the title
// in album view
    
/*    
    var track = obj.meta[M_TRACKNUMBER];
    if (!track)
        track = '';
    else
    {
        if (track.length == 1)
        {
            track = '0' + track;
        }
        track = track + ' ';
    }
*/
    // comment the following line out if you uncomment the stuff above  :)
    var track = '';

    var chain = new Array('Audio', 'All Audio');
    obj.title = title;
    addCdsObject(obj, createContainerChain(chain));
    
    chain = new Array('Audio', 'Artists', artist, 'All Songs');
    addCdsObject(obj, createContainerChain(chain));
    
    chain = new Array('Audio', 'All - full name');
    var temp = '';
    if (artist_full)
        temp = artist_full;
    
    if (album_full)
        temp = temp + ' - ' + album_full + ' - ';
    else
        temp = temp + ' - ';
   
    obj.title = temp + title;
    addCdsObject(obj, createContainerChain(chain));
    
    chain = new Array('Audio', 'Artists', artist, 'All - full name');
    addCdsObject(obj, createContainerChain(chain));
    
    chain = new Array('Audio', 'Artists', artist, album);
    obj.title = track + title;
    addCdsObject(obj, createContainerChain(chain), UPNP_CLASS_CONTAINER_MUSIC_ALBUM);
    
    chain = new Array('Audio', 'Albums', album);
    obj.title = track + title; 
    addCdsObject(obj, createContainerChain(chain), UPNP_CLASS_CONTAINER_MUSIC_ALBUM);
    
    chain = new Array('Audio', 'Genres', genre);
    addCdsObject(obj, createContainerChain(chain), UPNP_CLASS_CONTAINER_MUSIC_GENRE);
    
    chain = new Array('Audio', 'Year', date);
    addCdsObject(obj, createContainerChain(chain));
}


function get_xml_file(file) {
	var file_array = new File(file);
	if (file_array.exists){
		file_array.open('read', 'text');
		var xml_array = file_array.readAll();
		if(xml_array)
		return xml_array;
	} else {
		print('Error : The file "'+ file +'" doesnt exist !');
		return null;
	}
}


function parse_xml(xml_array) {
	var movie = new Object();
	movie.studios = new Array();
	movie.actors = new Array();
	movie.genres = new Array();
	movie.countries = new Array();
	for(i = 2; i < xml_array.length; i++) {
	
		// if the xml tag is empty, myArray is empty :
		tag = xml_array[i].match(/(<[^>]+>)([^<]+)(<[^>]+>)/);
		// if tag is empty, maybe it's a multiple sub-tags case :
		if (!tag) tag = xml_array[i].match(/\s+<(\w+)>$/);
		if (!tag) continue;
		switch (tag[1])
		{
		case '<title>':
			movie.title= tag[2];
			break;
		case '<original_title>':
			movie.original_title = tag[2];
			break;
		case '<collection>':
			movie.collection = tag[2];
		break;
		
		case 'genres':
			i++;
			tag = xml_array[i].match(/(<[^>]+>)([^<]+)(<[^>]+>)/);
			
			if('<number>' == tag[1]) var number = tag[2];
			number = parseInt(number);
			
			for(a = 0; a < number ; a++){
				if ('<name>' == tag[1]) name = tag[2];
				i++;
				tag = xml_array[i].match(/(<[^>]+>)([^<]+)(<[^>]+>)/);
				if ('<name>' == tag[1]) name = tag[2];
				movie.genres.push(name);
			}
		break;
		case '<release_date>':
			movie.release_date = tag[2];
			break;
		case 'countries':
				i++;
			tag = xml_array[i].match(/(<[^>]+>)([^<]+)(<[^>]+>)/);
			
			if('<number>' == tag[1]) var number = tag[2];
			number = parseInt(number);
			
			for(a = 0; a < number ; a++){
				if ('<name>' == tag[1]) name = tag[2];
				i++;
				tag = xml_array[i].match(/(<[^>]+>)([^<]+)(<[^>]+>)/);
				if ('<name>' == tag[1]) name = tag[2];
				movie.countries.push(name);
			}
			break;
		
		case 'studios':
			i++;
			tag = xml_array[i].match(/(<[^>]+>)([^<]+)(<[^>]+>)/);
			if('<number>' == tag[1]) var number = tag[2];
			number = parseInt(number);
			for(a = 0; a < number ; a++){
				if ('<name>' == tag[1]) name = tag[2];
				i++;
				tag = xml_array[i].match(/(<[^>]+>)([^<]+)(<[^>]+>)/);
				if ('<name>' == tag[1]) name = tag[2];
				movie.studios.push(name);print(name);
			}
			break;
		
		case '<adult>':
			movie.adult = tag[2];
			break;
		
		case 'actors':
		var number = 0;
		i++;
			tag = xml_array[i].match(/(<[^>]+>)([^<]+)(<[^>]+>)/);
			if('<number>' == tag[1]) var number = tag[2];
			number = parseInt(number);
		for(a = 0; a < number; a++) {
			i++;
			tag = xml_array[i].match(/(<[^>]+>)([^<]+)(<[^>]+>)/);
			if(tag){
			if ('<name>' == tag[1]) var name = tag[2];
			
			movie.actors.push(name);
			}
		}
			break;
	
		default:
			break;
		}
	}
	return movie;
}


function addVideo(obj)
{   
    
    var dir = getRootPath(object_root_path, obj.location);
    var location = obj.location;
    
    var folder = location.substring(0, location.lastIndexOf('/'));
    var nfo = location.substring(0, location.lastIndexOf('.'));
   
    nfo = nfo+'.xml';
    var file = nfo.replace(folder, '/mnt/HD/HD_a2/videos/films/.metas');
    var xml = get_xml_file(file);
	
	if(xml != null)
	var movie = parse_xml(xml);
    var movies = 'Films';
    if(movie) {
    	
    	if(movie.title) {
    		obj.meta[M_TITLE] = movie.title;
    		obj.title = movie.title;
    		print('Title: '+movie.title);
    		chain = new Array(movies);
    		addCdsObject(obj, createContainerChain(chain));
    	} 
    	
    	if(movie.original_title){
    		obj.title = movie.original_title;
    		print('Original title: '+movie.original_title);
    		chain = new Array(movies, 'Titres originaux');
    		addCdsObject(obj, createContainerChain(chain));
    		obj.title = movie.title;
    	}
    	
    	if(movie.collection){
    		print('Collection: '+movie.collection);
    		chain = new Array(movies, 'Collections');
    		chain = chain.concat(movie.collection);
    		addCdsObject(obj, createContainerChain(chain));
    	}
    	
    	if(movie.genres) { 
    		obj.meta[M_GENRE] = movie.genres[0];
    		print('Genre:');   	
    		for(i = 0; i < movie.genres.length; i++) {
    			
    			var genre = movie.genres[i];
    			
    			print(genre);
    			
    			chain = new Array(movies, 'Genres');
    			chain = chain.concat(genre);
    			addCdsObject(obj, createContainerChain(chain));
    			
    			}
    	} else {
    		chain = new Array(movies, 'Genres');
    			chain = chain.concat('Divers');
    			addCdsObject(obj, createContainerChain(chain));
    	}
    	
    	if(movie.release_date){
    		obj.meta[M_DATE] = movie.release_date;
    		print('Year: '+movie.release_date);
    		chain = new Array(movies, 'Année');
    		chain = chain.concat(movie.release_date);
    		addCdsObject(obj, createContainerChain(chain));
    	}
    	
    	if(movie.countries) {    	
    		for(i = 0; i < movie.countries.length; i++) {
    			var country = movie.countries[i];
    			print(country);
    			
    			chain = new Array(movies, 'Origine');
    			chain = chain.concat(country);
    			addCdsObject(obj, createContainerChain(chain));
    			
    			}
    	}
    	
		
		if(movie.studios) {
			obj.meta[M_PUBLISHER] = movie.studios[0];    	
    		for(i = 0; i < movie.studios.length; i++) {
    			var studio = movie.studios[i];
    			print(studio);
    			
    			chain = new Array(movies, 'Studios');
    			chain = chain.concat(studio);
    			addCdsObject(obj, createContainerChain(chain));
    			
    			}
    	}
    	
    	
    	if(movie.actors) {    	
    		for(i = 0; i < movie.actors.length; i++) {
    			var actor = movie.actors[i];
    			print(actor);
    			
    			chain = new Array(movies, 'Acteurs');
    			chain = chain.concat(actor);
    			addCdsObject(obj, createContainerChain(chain));
    			
    			}
    	}
    		
    } else if (obj.meta[M_TITLE]) {
    	obj.title = obj.meta[M_TITLE];
    	
    } else {
    	
    	chain = new Array(movies, 'Inconnus');
        addCdsObject(obj, createContainerChain(chain));
    	
    }
   
    if (dir.length > 0)
    {
        
        chain = new Array(movies, 'Répertoires');
        if(dir != movies){
        	chain = chain.concat(dir);
        }
        
        addCdsObject(obj, createContainerChain(chain));
    }
}

function addWeborama(obj)
{
    var req_name = obj.aux[WEBORAMA_AUXDATA_REQUEST_NAME];
    if (req_name)
    {
        var chain = new Array('Online Services', 'Weborama', req_name);
        addCdsObject(obj, createContainerChain(chain), UPNP_CLASS_PLAYLIST_CONTAINER);
    }
}

function addImage(obj)
{
    var chain = new Array('Photos', 'All Photos');
    addCdsObject(obj, createContainerChain(chain), UPNP_CLASS_CONTAINER);

    var date = obj.meta[M_DATE];
    if (date)
    {
        var dateParts = date.split('-');
        if (dateParts.length > 1)
        {
            var year = dateParts[0];
            var month = dateParts[1];

            chain = new Array('Photos', 'Year', year, month);
            addCdsObject(obj, createContainerChain(chain), UPNP_CLASS_CONTAINER);
        }

        chain = new Array('Photos', 'Date', date);
        addCdsObject(obj, createContainerChain(chain), UPNP_CLASS_CONTAINER);
    }

    var dir = getRootPath(object_root_path, obj.location);

    if (dir.length > 0)
    {
        chain = new Array('Photos', 'Directories');
        chain = chain.concat(dir);

        addCdsObject(obj, createContainerChain(chain));
    }
}


function addYouTube(obj)
{
    var chain;

    var temp = parseInt(obj.aux[YOUTUBE_AUXDATA_AVG_RATING], 10);
    if (temp != Number.NaN)
    {
        temp = Math.round(temp);
        if (temp > 3)
        {
            chain = new Array('Online Services', 'YouTube', 'Rating', 
                                  temp.toString());
            addCdsObject(obj, createContainerChain(chain));
        }
    }

    temp = obj.aux[YOUTUBE_AUXDATA_REQUEST];
    if (temp)
    {
        var subName = (obj.aux[YOUTUBE_AUXDATA_SUBREQUEST_NAME]);
        var feedName = (obj.aux[YOUTUBE_AUXDATA_FEED]);
        var region = (obj.aux[YOUTUBE_AUXDATA_REGION]);

            
        chain = new Array('Online Services', 'YouTube', temp);

        if (subName)
            chain.push(subName);

        if (feedName)
            chain.push(feedName);

        if (region)
            chain.push(region);

        addCdsObject(obj, createContainerChain(chain));
    }
}

function addTrailer(obj)
{
    var chain;

    chain = new Array('Online Services', 'Apple Trailers', 'All Trailers');
    addCdsObject(obj, createContainerChain(chain));

    var genre = obj.meta[M_GENRE];
    if (genre)
    {
        genres = genre.split(', ');
        for (var i = 0; i < genres.length; i++)
        {
            chain = new Array('Online Services', 'Apple Trailers', 'Genres',
                              genres[i]);
            addCdsObject(obj, createContainerChain(chain));
        }
    }

    var reldate = obj.meta[M_DATE];
    if ((reldate) && (reldate.length >= 7))
    {
        chain = new Array('Online Services', 'Apple Trailers', 'Release Date',
                          reldate.slice(0, 7));
        addCdsObject(obj, createContainerChain(chain));
    }

    var postdate = obj.aux[APPLE_TRAILERS_AUXDATA_POST_DATE];
    if ((postdate) && (postdate.length >= 7))
    {
        chain = new Array('Online Services', 'Apple Trailers', 'Post Date',
                          postdate.slice(0, 7));
        addCdsObject(obj, createContainerChain(chain));
    }
}

// main script part

if (getPlaylistType(orig.mimetype) == '')
{
    var arr = orig.mimetype.split('/');
    var mime = arr[0];
    
    // var obj = copyObject(orig);
    
    var obj = orig; 
    obj.refID = orig.id;
    
    if (mime == 'audio')
    {
        if (obj.onlineservice == ONLINE_SERVICE_WEBORAMA)
            addWeborama(obj);
        else
            addAudio(obj);
    }
    
    if (mime == 'video')
    {
        if (obj.onlineservice == ONLINE_SERVICE_YOUTUBE)
            addYouTube(obj);
        else if (obj.onlineservice == ONLINE_SERVICE_APPLE_TRAILERS)
            addTrailer(obj);
        else
            addVideo(obj);
    }
    
    if (mime == 'image')
    {
        addImage(obj);
    }

    if (orig.mimetype == 'application/ogg')
    {
        if (orig.theora == 1)
            addVideo(obj);
        else
            addAudio(obj);
    }
}
