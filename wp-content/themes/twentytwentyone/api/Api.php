<?php

namespace Api;

require dirname(__DIR__) . "/api/routes/api.php";
require dirname(__DIR__) . "/api/bootstrap/bootstrap.php";

class Api {
    /**
     * @var ?Routes
     */
    public ?Routes $routes = null;

    public function __construct()
    {
        add_action("admin_menu", array($this, "configMenuBar"));
        $this->routes = new Routes();
    }

    public function configMenuBar()
    {
        add_menu_page(
            "Administrador de contenido | Api Praxis",
            "Administrador de contenido",
            "manage_links",
            "content_admin",
        );

//        add_submenu_page(
//            "content_admin",
//            "Home - Administrador de contenido | Api Praxis",
//            "Home",
//            "manage_options",
//            "home_content_admin",
//            array($this->home, "HomeView"),
//            1
//        );
    }
}