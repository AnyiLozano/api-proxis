<?php

namespace Api;

class Home
{
    public function __construct()
    {
        add_action("admin_enqueue_scripts", function(){
            wp_enqueue_script(
                "home_content_admin",
                get_template_directory_uri() . "/api/Home/public/js/app.js"
            );
        });
    }

    public function HomeView()
    {
        $html = "<!DOCTYPE html>";
        $html .= "<html lang='es'>";
        $html .= "<head>
            <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css' integrity='sha384-zCbKRCUGaJDkqS1kPbPd7TveP5iyJE0EjAuZQTgFLD2ylzuqKfdKlfG/eSrtxUkn' crossorigin='anonymous'>
        </head>";
        $html .= "<body>";
        $html .= "<div id='app'></div>";
        $html .= "<script src='https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js' integrity='sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj' crossorigin='anonymous'></script>
                  <script src='https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js' integrity='sha384-fQybjgWLrvvRgtW6bFlB7jaZrFsaBXjsOMm/tB9LTS58ONXgqbR9W8oWht/amnpF' crossorigin='anonymous'></script>";
        $html .= "</body>";
        $html .= "</html>";
        echo $html;
    }
}