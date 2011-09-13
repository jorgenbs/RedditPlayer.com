<?php
require_once 'Zend/Loader.php';
Zend_Loader::loadClass('Zend_Gdata_YouTube');
$yt = new Zend_Gdata_YouTube();
Zend_Loader::loadClass('Zend_Gdata_AuthSub');
?>