<?php session_start(); ?>
<?php
include 'gdata.php';
$httpClient = getAuthSubHttpClient();
if (isset($_GET['logout'])) {
	Zend_Gdata_AuthSub::AuthSubRevokeToken($_SESSION['sessionToken']);
    unset($_SESSION['sessionToken']);
    header('Location: http://www.redditplayer.com');
    exit();
}
//add to fav
if ($httpClient != null && isset($_GET['v'])) {
	$developerKey = "AI39si7ko4YO0TDQUyHRjwtJ1f2dnkGH-pVzKSE56Exdk7Hji0aeYFfnpCi5HiEwD1oQMp8n0EAX6gZvQm3LtIG0jus01LUx5w";
	$yt = new Zend_Gdata_YouTube($httpClient, "redditplayer", null, $developerKey);
	$videoEntry = $yt->getVideoEntry($_GET['v']);
	$favoritesFeed = $yt->getUserFavorites("default");
	$yt->insertEntry($videoEntry, $favoritesFeed->getSelfLink()->href);
	return;
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<title>RedditPlayer</title>
    <link rel="Stylesheet" href="css/ui-lightness/jquery-ui-1.8.14.custom.css" />
	<link href='http://fonts.googleapis.com/css?family=Comfortaa' rel='stylesheet' type='text/css'>
	<link rel="Stylesheet" href="css/site.css" />
	<link rel="icon" type="image/gif" href="img/icon.gif">
    <script type="text/javascript" src="js/jquery-1.5.1.min.js"></script>
    <script type="text/javascript" src="js/jquery-ui-1.8.14.custom.min.js"></script>
    <script type="text/javascript" src="js/swfobject.js"></script>
    <script type="text/javascript" src="js/site.js"></script>
	<script type="text/javascript" src="js/cookie.js"></script>
<script type="text/javascript">
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-25353558-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>
</head>
<body>
	<img src="img/header2.png"/><br/>
	
	<div id="mainContainer" class="ui-corner-all">
		<div id="col1">
				<div id="controller">
					<div id="controllerBar"></div>
					<button id="controllerTimer" disabled="true">00:00</button>
					<span id="controllerToolbar" class="ui-corner-all">
						<button id="controllerPlay">play</button>
						<button id="controllerPrev">prev</button>
						<button id="controllerNext">next</button>
						<input type="checkbox" id="controllerMute" /><label for="controllerMute" id="controllerMuteLabel">Mute</label>
						<input type="checkbox" id="controllerShuffle" /><label for="controllerShuffle">Shuffle</label>
					</span>
				</div>
				<div id="controllerFloat">
					<button id="controllerStatus" disabled="true"></button>
				</div>
				<br />
				
				<div id="feedTabs">
					<ul>
						<li><button id="add_tab">Add Tab</button></li>
					</ul>
					<div id="tabs-1">
					</div>
				</div>
		</div>
		<div id="col2">
			<h1>Playlist</h1>
			<div id="playlistContainer">
				<ol id="playlist">
				</ol>
			</div>
			<button id="clear_playlist">Clear Playlist</button>
			<div id="container"><div id="playerDiv"></div></div>
			<button id="togglePlayer">Hide Player</button>
			<?php
			if ($httpClient == null) {
				echo "<a href='".getAuthSubRequestUrl()."' id='loginWithYouTube'>Login with YouTube</a>";
			}
			else {
				echo "<button id='addToFavourites'>Add song to Favourites</button>\n";
				echo "<a href='?logout=1' id='revokeToken'>Logout</a>";
			}
			?>
			<a href="#" id="goToYouTube">Follow link</a>
		</div>
	</div>
	<div id="credits">made by Jørgen Bøe Svendsen</div>
	<!--invisible-->
    <div id="debug" style="visibility: hidden"></div>
	<div id="dialog" title="Tab data">
		<form>
			<label for="tab_title">Type name of subreddit</label>
			<input type="text" name="tab_title" id="tab_title" value="" class="ui-widget-content ui-corner-all" />
			<label for="subredditSet">Or chose from below:</label>
			<div id="subredditSet" />
		</form>
	</div>
<script type="text/javascript">
	<?php
	if ($httpClient == null) { ?>
		$('#loginWithYouTube').button({
			icons: {
				primary: "youtube"
			}
		});;
	<?php
	}
	else { ?>
		$('#addToFavourites').button({
			icons: {
				primary: "youtube"
			}
		})
		.click(function() {
			$.ajax({
				url: "?v="+getYouTubeVideoID(items[pointer]),
				success: function() {
					$("#addToFavourites").button("option","icons",{primary: 'youtube-star'});
				}
			})
		});
		$("#revokeToken").button({
			icons: {
				primary: "youtube"
			}
		});
	<?php
	}
	?>
</script>
</body>
</html>