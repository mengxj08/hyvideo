<?php
// $cookie_value = file_get_contents("php://input");
// $cookie_name = $_POST['name'];
// $cookie_value = $_POST['data'];
// setcookie($cookie_name, $cookie_value, time() + (86400 * 7), "/");

session_start();
$session_name = $_POST['name'];
$session_value = $_POST['data'];

if($session_name == 'clear'){
	session_unset();
}
else{
	$_SESSION[$session_name] = $session_value;
}

echo 'save data to cookies';
?>