var devKey = "AI39si7ko4YO0TDQUyHRjwtJ1f2dnkGH-pVzKSE56Exdk7Hji0aeYFfnpCi5HiEwD1oQMp8n0EAX6gZvQm3LtIG0jus01LUx5w";
var items = [];
var feedItems = [];
var pointer = -1;
var progress;
var dragFrom;
var subreddits = ["hiphopheads","electronicmusic","listentothis","minimal", "dubstep","trance","jazz","psytrance"];
var token = null;

$(document).ready(function () {
	var params = {
		allowScriptAccess: "always",
	};
	var atts = {
		id: "player" 
	};
	swfobject.embedSWF("http://www.youtube.com/apiplayer?enablejsapi=1&version=3",
			   "playerDiv", "100%", "275px", "8", null, null, params, atts);
	var $url = window.location.href;
	if (window.location.href.indexOf("?token") > 0) {
		token = $url.substring($url.indexOf("?token")+7);
	}
});

function debug(msg) {
	$("#debug").append(msg+"\n");
}

function updateVideoStatus(data) {
	$("#controllerStatus .ui-button-text").html(data.entry["title"].$t);
	$("#container object").click(function() { window.location.href = items[pointer].url });
}

function loadSubReddit(sub,tab) {
	debug("loading: " + sub);
	var tabCookie = $.cookie("rp_tb") || "";
	if (tabCookie != "") tabCookie += "|"
	$.cookie("rp_tb",tabCookie+sub);
	sub = "proxy.php?url=http://www.reddit.com/r/"+sub+"/.rss";
	//sub = "rss.xml";
	$("#feed",$(tab)).selectable();
	$.ajax({
		type: "GET",
		url: sub,
		dataType: "xml",
		success: function (xml) {
			$(xml).find('item').each(function () {
				var title = $(this).find('title').text();
				var link = $(this).find('link').text();
				var content = $(this).find('description').text();

				//parse link
				var x = content.indexOf("a href", content.indexOf("reddit.com/user/")) + 8;
				var url = content.substring(x, content.indexOf("\">", x));
				var type = "NOLINK";
				if (url.indexOf("youtube") >= 0) type = "youtube";
				else if (url.indexOf("soundcloud") >= 0) type = "soundcloud";
				else if (url.indexOf("grooveshark") >= 0) type = "grooveshark";
				
				if (type == "youtube") {
					var o = { "title": title, "link": link, "url": url, "type": type }
					addToTab(o,tab);
				}
			});
		}
	});
}

function addToTab(item,which) {
	feedItems[feedItems.length] = item;
	$("#feed",which).append("<li class='ui-widget-content' id='"+(feedItems.length-1)+"'>"+item.title+"</li>");
}

function addToPlaylist(item) {
	items[items.length] = item;
	$("#playlist").append("<li class=\"ui-widget-content\" id='" + (items.length-1) + "' title='" + item.title + "'>"
		+ "<span class=\"ui-icon ui-icon-circle-triangle-e\" style=\"float: left;\"></span>" 
		+ "<span class=\"ui-icon ui-icon-circle-close\" style=\"float: right;\"></span>" + item.title + "</li>");
	$.cookie("rp_pl",JSON.stringify(items),{expires: 7});
}

function removeFromPlaylist(item) {
	var index = items.indexOf(item);
	items.splice(index,1);
	$($("#playlist li")[index]).remove();
	if (pointer == index && index != -1) {
		if (pointer == items.length) pointer--;
		pointer--;
	}
	$.cookie("rp_pl",JSON.stringify(items),{expires: 7});
}

function nextSong() {
	if (pointer + 1 < items.length) {
		pointer++;
		var id = getYouTubeVideoID(items[pointer]);
		player.cueVideoById(id);

		updateHighLightedSong();
		return true;
	}
	return false;
}

function prevSong() {
	if (pointer != 0) {
		pointer--;
		var id = getYouTubeVideoID(items[pointer]);
		player.cueVideoById(id);

		updateHighLightedSong();
		return true;
	}
	return false;
}

function updateHighLightedSong() {
	$(".ui-selected",$("#playlist")).removeClass("ui-selected");
	$($("#playlist li")[pointer]).addClass("ui-selected");
	if (typeof $("#addToFavourites") == "object")  
		$("#addToFavourites").button("option","icons",{primary: 'youtube'});
}

function onYouTubePlayerReady() {
	player.addEventListener("onError","onYTError");
	player.addEventListener("onStateChange","onYTStateChange");
//            player.cueVideoById(getYouTubeVideoID(items[0]));
	controllerTrackProgress(true);
	$(document).bind("keyup",function(event) {
		if (event.keyCode === 32) {
			if (player.getPlayerState() == 2) {
				player.playVideo();
			}
			else {
				player.pauseVideo();
			}
		}
		else if (event.keyCode === 37) {
			prevSong();
		}
		else if (event.keyCode === 39) {
			nextSong();
		}
	});
}

function onYTStateChange(state) {
	$("#debug").append(state);
	switch (state) {
		case 0: //stopped
			nextSong();
			break;
		case 1: //playing
			options = {
				label: "pause",
				icons: {
					primary: "ui-icon-pause"
				}
			};
			$("#controllerPlay").button("option",options);
			break;
		case 2: //paused
			options = {
				label: "play",
				icons: {
					primary: "ui-icon-play"
				}
			};
			$("#controllerPlay").button("option",options);
			break;
		case 3: //buffering
			options = {
				label: "pause",
				icons: {
					primary: "ui-icon-pause"
				}
			};
			$("#controllerPlay").button("option",options);
			break;
		case 5: //queued
			player.playVideo();
			options = {
				label: "pause",
				icons: {
					primary: "ui-icon-pause"
				}
			};
			$("#controllerPlay").button("option",options);
			$.getScript( 'http://gdata.youtube.com/feeds/api/videos/' + getYouTubeVideoID( items[pointer] ) + '?v=2&alt=json-in-script&callback=updateVideoStatus' );
			$("#goToYouTube")[0].href = items[pointer].url;
			break;
	}
}

function onYTError(error) {
	debug("Youtube: " + error);
}

function getYouTubeVideoID(item) {
	if (item.type != "youtube") return false;
	var a = item.url.indexOf("watch?v=") + 8;
	var b = item.url.indexOf("&", a);
	return b != -1 ? item.url.substring(a, b) : item.url.substring(a);
}


//
// setup youtube-controller
//
$(function() {
	$("#controllerPlay").button({
		text: false,
		icons: {
			primary: "ui-icon-play"
		}
	})
	.click(function() {
		var options;
		if ($(this).text() === "play") {
			var state = player.getPlayerState();
			if (state == 2 || state == 5 || state == 3)
				player.playVideo();
			else nextSong();
		} 
		else {
			player.pauseVideo();
			options = {
				label: "play",
				icons: {
					primary: "ui-icon-play"
				}
			};
		}
		$(this).button("option",options);
	});

	$("#controllerPrev").button({
		text: false,
		icons: {
			primary: "ui-icon-seek-prev"
		}
	})
	.click(function() {
		prevSong();
	});

	$("#controllerNext").button({
		text: false,
		icons: {
			primary: "ui-icon-seek-next"
		}
	})
	.click(function() {
		nextSong();
	});

	$("#controllerMute").button({
		text: false,
		icons: {
			primary: "ui-icon-volume-on"
		}
	})
	.click(function() {
		if (!player.isMuted()) {
			player.mute();
			$(this).button("option","icons",{primary:'ui-icon-volume-off'});
		}
		else {
			player.unMute();
			$(this).button("option","icons",{primary:"ui-icon-volume-on"});
		}
		//player.isMuted() ? player.unMute() : player.mute();
	});
	
	$("#controllerShuffle").button({
		text: false,
		icons: {
			primary: "ui-icon-shuffle"
		}
	})
	.click(function() {
		items.sort(function() {return 0.5 - Math.random()});
		$("#playlist").empty();
		var newPlaylist = items;
		items = [];
		for (i in newPlaylist) {
			addToPlaylist(newPlaylist[i]);
		}
		pointer = -1;
	});

	$("#controllerBar").slider({
		range: "min",
		value: 0,
		min: 0,
		max: 99,
		stop: function(event, ui) {
			theEvent = event;
			var perc = ui.value / $(this).slider("option","max");
			var val = player.getDuration() * perc;
			player.seekTo(val,true);
			controllerTrackProgress(true);
		},
		slide: function(event, ui) {
			controllerTrackProgress(false);
			var perc = ui.value / $(this).slider("option","max");
			var curr = player.getCurrentTime();
			var seconds = parseInt(curr % 60);
			var minutes = parseInt((curr - seconds)/60);
			$("#controllerTimerLabel").html(minutes + ":" + seconds);
		}
	});
	
	$("#controllerTimer").button();
	$("#controllerStatus").button();
});

function controllerTrackProgress(turnOn) {
	if (turnOn) {
		progress = setInterval(function() {
			try {
				var curr = player.getCurrentTime();
			} catch (Exception) {
				return;
			}
			var seconds = parseInt(curr % 60);
			var minutes = parseInt((curr - seconds)/60);
			if (seconds < 10) seconds = "0" + seconds;
			if (minutes < 10) minutes = "0" + minutes;
			$("#controllerTimer").html(minutes + ":" + seconds);
			var progress = (curr / player.getDuration()) * $("#controllerBar").slider("option","max");
			$("#controllerBar").slider("option","value",progress);
		},20);
	} 
	else {
		clearInterval(progress);
		progress = null;
	}
}

//
// setup playlist
//
$(function() {
	$("#playlist").sortable({
		start: function(event, ui) {
			dragFrom = $("#playlist li").index(ui.item);
		},
		stop: function(event, ui) {
			var index = $("#playlist li").index(ui.item);
			var temp = items[dragFrom];
			items[dragFrom] = items[index];
			items[index] = temp;
			pointer = $("#playlist li").index($("#playlist .ui-selected"))
		}
	});
	$("#playlist .ui-icon-circle-triangle-e").live('click',function() {
		var index = $("#playlist li").index(this.parentElement);
		pointer = index;
		player.cueVideoById(getYouTubeVideoID(items[index]));
		updateHighLightedSong();
	});
	$("#playlist .ui-icon-circle-close").live('click',function() {
		var index = $("#playlist li").index(this.parentElement);
		removeFromPlaylist(items[index]);
	});

	
	$("#playlist").disableSelection();
	$("#goToYouTube").button();
	$("#clear_playlist").button()
	.click(function() {
		items = [];
		$("#playlist").empty();
		$.cookie("rp_pl",null);
		pointer = -1;
	});
	
	$("#togglePlayer").button()
	.click(function() {
		if ($(this).text() == "Hide Player") {
			$("#container object").css("margin-left",-9999);
			$("#container").height(20);
			$(this).text("Show Player");
		}
		else {
			$("#container").height(275);
			$("#container object").css("margin-left",1);
			$(this).text("Hide Player");
		}
	});
});

//
// setup tabs
//
$(function() {
	$("#feedTabs").tabs();
	var $tab_title_input = $( "#tab_title"),
	$tab_content_input = $( "#tab_content" );
	var tab_counter = 1;

	// tabs init with a custom tab template and an "add" callback filling in the content
	var $tabs = $( "#feedTabs").tabs({
		tabTemplate: "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close'>Remove Tab</span></li>",
		spinner: "Fetching music...",
		add: function( event, ui ) {
			$(ui.panel).append("<button id='addItemsToPlaylist'>Add selected to playlist</button>"
				+"<button id='addAllItemsToPlaylist'>Add all to playlist</button><br /><ol id='feed'></ol>");
			
			$("#addItemsToPlaylist",$(ui.panel)).button()
			.click(function() {
				$("#feed .ui-selected",$(ui.panel)).each(function() {
					addToPlaylist(feedItems[this.id]);
				});
			});

			$("#addAllItemsToPlaylist",$(ui.panel)).button()
			.click(function() {
				$("#feed li",$(ui.panel)).each(function() {
					addToPlaylist(feedItems[this.id]);
				});
			});

			loadSubReddit($tab_title_input.val(),$(ui.panel));
		},
		remove: function(event, ui) {
			$("#debug").append("remove: " + ui.tab.innerText);
			var c = $.cookie("rp_tb").replace(ui.tab.innerText,"");
			//cleanup
			if (c.charAt(0) == "|") c = c.substring(1,c.length);
			if (c.charAt(c.length-1) == "|") c = c.substring(0,c.length-2);
			c = c.replace("||","|");
			$.cookie("rp_tb",c);
		}
	});
	
	// modal dialog init: custom buttons and a "close" callback reseting the form inside
	var $dialog = $( "#dialog" ).dialog({
		autoOpen: false,
		title: "Add subreddit",
		minWidth: 450,
		modal: true,
		buttons: {
			Add: function() {
				subs = [];
				var $checkboxes = $("#subredditSet input");;
				for (i in $checkboxes) {
					if ($checkboxes[i].checked) subs[subs.length] = subreddits[i];
				}
				addTab(subs);
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		open: function() {
			$tab_title_input.focus();
		},
		close: function() {
			$("form",this)[0].reset();
		}
	});

	// actual addTab function: adds new tab using the title input from the form above
	function addTab(subs) {
		var tab_title = $tab_title_input.val();
		debug("addTab() tab_title="+tab_title);
		//title first
		if (tab_title != "") {
			debug("ehh...");
			$tabs.tabs( "add", "#tabs-" + tab_counter, tab_title );
			tab_counter++;
		}

		for (i in subs) {
			debug("addTab() adding sub: "+subs[i]);
			$tab_title_input[0].value = subs[i];
			$tabs.tabs( "add", "#tabs-" + tab_counter, subs[i]);
			$tab_title_input[0].value = "";
			tab_counter++;
		}
	}
	// addTab button: just opens the dialog
	$( "#add_tab" )
		.button()
		.click(function() {
			$dialog.dialog( "open" );
			
			//unbind enter key to post submit
			$("form",$dialog).bind("submit",false
				//$(":button:contains('Add')")[1].click();
			);
			//rebind enter-key
			$("form",$dialog).bind("keyup",function(e) {
				if (e.keyCode == 13)
					$(":button:contains('Add')")[1].click();
			});
		});
	
	$( "#feedTabs span.ui-icon-close" ).live( "click", function() {
		var index = $( "li", $tabs ).index( $( this ).parent() );
		$tabs.tabs( "remove", index - 1 );
	});
	
	//add cookie playlist
	if ($.cookie("rp_pl") !== null) {
		storedItems = JSON.parse($.cookie("rp_pl"));
		for (i in storedItems)
			addToPlaylist(storedItems[i]);
	}
	//add cookie tabs
	if ($.cookie("rp_tb") != null && $.cookie("rp_tb") != "") {
		storedTabs = $.cookie("rp_tb").split("|");
		debug("storedTabs: "+storedTabs[0]);
		$.cookie("rp_tb",null);
		addTab(storedTabs);
	}
});

//init addtab-dialog
$(function() {
	for (i in subreddits) 
		$("#subredditSet").append('<input type="checkbox" id="check'+i+'" /><label for="check'+i+'">'+subreddits[i]+'</label>');
	$("#subredditSet").buttonset();
});