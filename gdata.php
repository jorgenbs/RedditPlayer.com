<?php
require_once 'Zend/Loader.php'; // the Zend dir must be in your include_path
Zend_Loader::loadClass('Zend_Gdata_YouTube');
Zend_Loader::loadClass('Zend_Gdata_AuthSub');

function getAuthSubRequestUrl()
{
    $next = 'http://www.redditplayer.com';
    $scope = 'http://gdata.youtube.com';
    $secure = false;
    $session = true;
    return Zend_Gdata_AuthSub::getAuthSubTokenUri($next, $scope, $secure, $session);
}

function getAuthSubHttpClient()
{
    if (!isset($_SESSION['sessionToken']) && !isset($_GET['token']) ){
        return null;
    } else if (!isset($_SESSION['sessionToken']) && isset($_GET['token'])) {
      $_SESSION['sessionToken'] = Zend_Gdata_AuthSub::getAuthSubSessionToken($_GET['token']);
    }

    $httpClient = Zend_Gdata_AuthSub::getHttpClient($_SESSION['sessionToken']);
    return $httpClient;
}
?>