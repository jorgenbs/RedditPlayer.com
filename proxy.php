<?php
$post_data = $HTTP_RAW_POST_DATA;
$header[] = "Content-type: text/xml";
$header[] = "Content-length ".strlen($post_data);
$url = $_GET['url'];
//$valid = preg_match('/^http\:\/\/w{3}\.reddit\.com\/r\/.+\.rss$/',$xml);
if (strrpos($url,"http://www.reddit.com/r/") == 0) {
  $url = urldecode($url);
  header('Content-Type: text/xml');
  echo(file_get_contents($url));
} else {
  print 'invalid url';
}
?>
