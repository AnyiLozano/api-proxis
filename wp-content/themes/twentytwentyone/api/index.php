<?php

namespace Api\Api;

require get_template_directory() . "/api/vendor/autoload.php";

require get_template_directory() . "/api/Config/app.php";

use Api\Config;

class Api {
    public function __construct()
    {
        new Config();
    }
}