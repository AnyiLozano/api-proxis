<?php

namespace Api;

require dirname(__DIR__) . "/app/Http/Controllers/HomeController.php";
require dirname(__DIR__) . "/app/Http/Controllers/ContactController.php";

use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;

class Routes
{
    /**
     * @var ?HomeController
     */
    public ?HomeController $home = null;

    /**
     * @var ?ContactController
     */
    public ?ContactController $contact = null;

    /**}
     *
     *
     * This function is the routes constructor.
     * @return void with the settings of the class
     */
    public function __construct()
    {
        $this->initControllers();
        add_action(
            "rest_api_init",
            array($this, "configRoutes")
        );
    }

    /**
     * This function is used from init the controllers.
     * @return void
     */
    public function initControllers()
    {
        $this->home = new HomeController();
        $this->contact = new ContactController();
    }

    /**
     * This function is used from add configuration of the endpoints of the rest's api.
     * @return void with the routes' list.
     */
    public function configRoutes()
    {
        $this->homeRoutes();
        $this->contactRoutes();
    }

    /**
     * This function is used from add configuration of the endpoint in the home.
     * @return void with the home's endpoints.
     */
    public function homeRoutes()
    {
        register_rest_route('admin/home', 'get-content', array(
            "methods" => "GET",
            "callback" => array($this->home, "getHomeContent")
        ));

        register_rest_route('admin/home', 'create-content', array(
            "methods" => "POST",
            "callback" => array($this->home, "createContent")
        ));
    }

    /**
     * This function is used from add configuration of the endpoint in the home.
     * @return void with the home's endpoints.
     */
    public function contactRoutes()
    {
        register_rest_route('/contact', 'send-contact', array(
            "methods" => "POST",
            "callback" => array($this->contact, "sentContact")
        ));
    }
}