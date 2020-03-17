<html>
<body>
<?php
session_start();

require_once 'vars.php';

$TOKEN_LOCAL_STORAGE_KEY = "slack-token";

$SLACK_OAUTH_REDIRECT = "https://slack.com/oauth/v2/authorize";

$SLACK_SCOPES = "chat:write,chat:write.customize,chat:write.public,users:read";

$SLACK_TOKEN_EXCHANGE_URL = "https://slack.com/api/oauth.v2.access";


function writeToLog($string, $log) {
	if (!file_exists("./logs/")) {
		mkdir("./logs/",0777,true);
	}
	file_put_contents("./logs/".$log.".log", date("d-m-Y_h:i:s")."-- ".$string."\r\n", FILE_APPEND);
}

function getTokenFromVerificationCode($code) {
    global $client_id, $client_secret, $SLACK_TOKEN_EXCHANGE_URL;

    $data = array(
        "code"=>$code
    );

    $ch = curl_init($SLACK_TOKEN_EXCHANGE_URL);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_USERPWD, $client_id.":".$client_secret);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	$result = curl_exec($ch);
    curl_close($ch);
    
	return json_decode($result, true);
}

function redirectToLogin() {
	global $client_id, $redirect_url, $SLACK_OAUTH_REDIRECT, $SLACK_SCOPES;
    $_SESSION["oauth_state"] = bin2hex(openssl_random_pseudo_bytes(8));

    $data = array(
        "scope" => $SLACK_SCOPES,
        "client_id" => $client_id,
        "state" => $_SESSION["oauth_state"],
        "redirect_uri" => $auth_url
    );

    $url = $SLACK_OAUTH_REDIRECT . "?" . http_build_query($data);
	header('Location: '.$url);
	exit();
}

function copy_token_to_client() {
    global $TOKEN_LOCAL_STORAGE_KEY;
    echo(
        '<script>
            localStorage.setItem("'.$TOKEN_LOCAL_STORAGE_KEY.'", "'.$_SESSION["token"].'");
            window.location.replace("'.$_SESSION["auth_done_redirect"].'");
        </script>'
    );
}

if(isset($_GET["redirect"])) {
    $_SESSION["auth_done_redirect"] = $_GET["redirect"];
}

if(isset($_SESSION["token"])) {
    copy_token_to_client();
} elseif(isset($_GET["code"]) && isset($_GET["state"]) && isset($_SESSION["oauth_state"]) && $_GET["state"] === $_SESSION["oauth_state"]) {
    unset($_SESSION["oauth_state"]);
    $tokendata = getTokenFromVerificationCode($_GET["code"]);

    if(!(isset($tokendata["ok"]) && $tokendata["ok"])) {
		if(isset($tokendata["error"])) {
			writeToLog("Token exchange failed with error: ".$tokendata["error"], "oauth");
			redirectToLogin();
		} else {
			writeToLog("Token exchange failed", "oauth");
			redirectToLogin();
		}
    }
    

    $token = $tokendata["access_token"];

    $_SESSION["token"] = $token;

    copy_token_to_client();

} else {
    redirectToLogin();
}

?>
</body>
</html>
