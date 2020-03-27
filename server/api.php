<?php

function error_out(string $message) {
    http_response_code(400);
    die($message);
}

if($_SERVER['REQUEST_METHOD'] != 'POST') {
    error_out("Error: invalid request");
}

if(getallheaders()["Content-Type"] !== "application/json") {
    error_out("Error: invalid request");
}

session_start();

$postdata = json_decode(file_get_contents('php://input'), true);

if(!isset($_SESSION["csrf-token"]) || !isset($postdata["csrf-token"]) || $postdata["csrf-token"] !== $_SESSION["csrf-token"]) {
    error_out("Error: invalid token");
}

if(!isset($_SESSION["slack-token"])) {
    error_out("Error: not authed");
}

if(!isset($postdata["method"])) {
    error_out("Error: invalid method");
}

require_once 'slack-client.php';

$client = new SlackClient($_SESSION["slack-token"]);

switch($postdata["method"]) {
    case "list_users":
        echo(json_encode($client->users_list()));
    break;
    case "single_user":
        if(!isset($postdata["id"])) {
            error_out("Error: invalid parameters");
        }
        $info = $client->user_info($postdata["id"]);
        if($info === null) {
            error_out("Error: invalid parameters");
        }
        echo(json_encode($info));
    break;
    case "list_channels":
        echo(json_encode($client->channels_list()));
    break;
    case "post_message":
        if(
            !isset($postdata["channel"])
            || !isset($postdata["text"])
            || !isset($postdata["icon_url"])
            || !isset($postdata["username"])
        ) {
            error_out("Error: invalid parameters");
        }
        $result = $client->chat_postMessage($postdata["channel"], $postdata["text"], $postdata["icon_url"], $postdata["username"]);
        if($result === true) {
            echo(json_encode(array("ok" => true)));
        } else {
            http_response_code(500);
            die("Error: api error");
        }
    break;
    default:
        error_out("Error: invalid method");
    break;
}

?>
