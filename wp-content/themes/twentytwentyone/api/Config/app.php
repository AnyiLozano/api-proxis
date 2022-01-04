<?php

namespace Api;

require get_template_directory() . "/api/Admin/index.php";

use Api\Admin\ContentAdmin;

class Config
{
    public function __construct()
    {
        add_action('admin_menu', array($this, "menuBar"));
    }

    public function menuBar()
    {
        add_menu_page(
            "Administrador de contenido | Api Praxis",
            "Administrador de contenido",
            "manage_options",
            "content_admin",
            array($this, "admin_menu"),
            "dashicons-cover-image",
            6
        );
    }

    public function admin_menu()
    {
        new ContentAdmin();
    }
}