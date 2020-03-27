<?php
class SlackClient {
    private $token;

    function __construct(string $token) {
        $this->token = $token;
    }

    private function get_query(string $url, array $data) {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url.'?'.http_build_query($data));
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        $data = curl_exec($curl);
        curl_close($curl);
        return $data;
    }

    private function post_query_json(string $url, array $data) {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Authorization: Bearer '.$this->token
        ));
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
        $data = curl_exec($curl);
        curl_close($curl);
        return $data;
    }

    private function error(string $method, string $message) {
        if (!file_exists("./logs/")) {
            mkdir("./logs/",0777,true);
        }
        file_put_contents("./logs/api.log", date("d-m-Y_h:i:s")."-- Error in method ".$method." : ".$message."\r\n", FILE_APPEND);
    }

    function users_list() {
        $cursor = "first";
        $users = array();
        while(!empty($cursor)) {
            $data = array();
            $data["token"] = $this->token;
            if($cursor !== "first") {
                $data["cursor"] = $cursor;
            }

            $response = $this->get_query("https://slack.com/api/users.list", $data);
            $response = json_decode($response, true);

            if(!isset($response["ok"]) || !$response["ok"]) {
                $message = "[BLANK]";
                if(isset($response["error"])) {
                    $message = $response["error"];
                }
                $this->error("users_list", $message);
                break;
            }

            foreach($response["members"] as $member) {
                $users[] = array(
                    "id"=>$member["id"],
                    "name"=>$member["name"],
                    "real_name"=>$member["profile"]["real_name"],
                    "display_name"=>$member["profile"]["display_name"],
                    "image"=>$member["profile"]["image_512"]
                );
            }

            if(
                isset($response["response_metadata"])
                && isset($response["response_metadata"]["next_cursor"])
            ) {
                $cursor = $response["response_metadata"]["next_cursor"];
            } else {
                $cursor = "";
            }
        }
        return $users;
    }

    function user_info(string $id) {
        $data = array(
            "token" => $this->token,
            "user" => $id
        );
        $response = $this->get_query("https://slack.com/api/users.info", $data);
        $response = json_decode($response, true);

        if(!isset($response["ok"]) || !$response["ok"]) {
            $message = "[BLANK]";
            if(isset($response["error"])) {
                $message = $response["error"];
            }
            $this->error("user_info", $message);
            return null;
        }

        $member = $response["user"];
        return array(
            "id"=>$member["id"],
            "name"=>$member["name"],
            "real_name"=>$member["profile"]["real_name"],
            "display_name"=>$member["profile"]["display_name"],
            "image"=>$member["profile"]["image_512"]
        );   
    }

    function channels_list() {
        $cursor = "first";
        $channels = array();
        while(!empty($cursor)) {
            $data = array();
            $data["token"] = $this->token;
            if($cursor !== "first") {
                $data["cursor"] = $cursor;
            }
            $data["exclude_archived"] = true;
            $data["types"] = "public_channel";

            $response = $this->get_query("https://slack.com/api/conversations.list", $data);
            $response = json_decode($response, true);

            if(!isset($response["ok"]) || !$response["ok"]) {
                $message = "[BLANK]";
                if(isset($response["error"])) {
                    $message = $response["error"];
                }
                $this->error("channels_list", $message);
                break;
            }

            foreach($response["channels"] as $channel) {
                $channels[] = array(
                    "id"=>$channel["id"],
                    "name"=>$channel["name"]
                );
            }

            if(
                isset($response["response_metadata"])
                && isset($response["response_metadata"]["next_cursor"])
            ) {
                $cursor = $response["response_metadata"]["next_cursor"];
            } else {
                $cursor = "";
            }
        }
        return $channels;
    }

    function chat_postMessage(string $channel, string $text, string $icon_url, string $username) {
        $data = array(
            "channel" => $channel,
            "text" => $text,
            "icon_url" => $icon_url,
            "username" => $username
        );
        $response = $this->post_query_json("https://slack.com/api/chat.postMessage", $data);
        $response = json_decode($response, true);

        if(!isset($response["ok"]) || !$response["ok"]) {
            $message = "[BLANK]";
            if(isset($response["error"])) {
                $message = $response["error"];
            }
            $this->error("chat_postMessage", $response["error"]);
            return false;
        }

        return true;
    }
}
?>
