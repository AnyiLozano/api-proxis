<?php
//
//namespace Api;
//
//require dirname(__DIR__, 1) . "/Controllers/Controller.php";
//
//use Api\Controllers\Controller;
//
//class Home
//{
//    public ?Controller $controller = null;
//
//    /**
//     * This function is the constructor of the Home's class.
//     * @return void with the results of petitions.
//     */
//    public function __construct()
//    {
//        $this->controller = new Controller();
//        add_action("admin_enqueue_scripts", function () {
//            wp_enqueue_script(
//                "home_content_admin",
//                get_template_directory_uri() . "/api/Home/public/js/app.js"
//            );
//        });
//
//        add_action("rest_api_init", array($this, "configRoutes"));
//    }
//
//    /**
//     * This function is used from add settings of rest's api.
//     * @return void with the configutation the routes of the rest's api.
//     */
//    public function configRoutes()
//    {
//        register_rest_route("admin/home", "get-home-content", array(
//            "methods" => "GET",
//            "callback" => array($this, "getHomeContent")
//        ));
//
//        register_rest_route("admin/general", "get-content-types", array(
//            "methods" => "GET",
//            "callback" => array($this, "getContentTypes")
//        ));
//
//        register_rest_route("admin/home", "set-content", array(
//            "methods" => "POST",
//            "callback" => array($this, "setContent")
//        ));
//
//        register_rest_route("admin/home", "edit-content", array(
//            "methods" => "POST",
//            "callback" => array($this, "editContent"),
//        ));
//
//        register_rest_route("admin/home", "change-status-content", array(
//            "methods" => "POST",
//            "callback" => array($this, "changeStatusContent"),
//        ));
//
//        register_rest_route("admin/home", "delete-content", array(
//            "methods" => "DELETE",
//            "callback" => array($this, "deleteContent"),
//        ));
//    }
//
//    public function getHomeContent()
//    {
//        global $wpdb;
//        $sql = "SELECT wcp.id, wp.name as page, wct.name as type, wcp.content_type_id, wcp.content, wcp.position_in_page, ws.name as status, ws.color_status FROM wp_content_pages wcp
//                INNER JOIN wp_content_types wct ON wct.id = wcp.content_type_id
//                INNER JOIN wp_statuses ws ON ws.id = wcp.status_id
//                INNER JOIN wp_pages wp ON wp.id = wcp.page_id";
//
//        $results = $wpdb->get_results($sql);
//
//        return $this->controller->response(true, array("type" => "success", "content" => "Done."), $results);
//    }
//
//    public function getContentTypes()
//    {
//        global $wpdb;
//
//        $sql = "SELECT * FROM wp_content_types WHERE status_id = 1";
//        $prepare = $wpdb->prepare($sql);
//        $types = $wpdb->get_results($prepare);
//
//        return $this->controller->response(true, array("type" => "success", "content" => "Done."), $types);
//    }
//
//    public function setContent()
//    {
//        global $wpdb;
//        $status = false;
//        $result = null;
//        $wpdb->query('START TRANSACTION');
//        try {
//            if ($_POST["type"] == 2) {
//
//                $url = $this->controller->uploadImages($_FILES["content"]);
//
//                $sql = "INSERT INTO wp_content_pages (page_id, content_type_id, content, position_in_page, status_id)
//                            VALUES (%s, %s, %s, %s, 1)";
//
//                $prepare = $wpdb->prepare($sql, $_POST["page"], $_POST["type"], $url, $_POST["position"]);
//
//            } else {
//                $sql = "INSERT INTO wp_content_pages (page_id, content_type_id, content, position_in_page, status_id)
//                            VALUES (%s, %s, %s, %s, 1)";
//
//                $prepare = $wpdb->prepare($sql, $_POST["page"], $_POST["type"], $_POST["content"], $_POST["position"]);
//
//            }
//            $wpdb->query($prepare);
//
//            $status = true;
//            $wpdb->query("COMMIT");
//        } catch (\Throwable $th) {
//            $result = $th->getMessage();
//            $wpdb->query("ROLLBACK");
//        }
//        if ($status) {
//            return $this->controller->response($status, array("type" => "success", "content" => "Done."), []);
//        } else {
//            return $this->controller->response($status, array("type" => "error", "content" => "Ocurrio un problema al momento de crear el contenido"), $result);
//        }
//    }
//
//    /**
//     * This function is used from edit the row information of the content of the page
//     * @param int '$_POST["position"]' with the position that we edit the row.
//     * @param string | 'File' '$_POST["type"]' with the content that we edit the row.
//     * @param int '$_POST["type"]' with the type id that we edit the row.
//     * @param int '$_POST["page"]' with the page id that we edit the row.
//     * @return void with the solved request.
//     */
//    public function editContent()
//    {
//        global $wpdb;
//        $status = false;
//        $result = null;
//        $wpdb->query("START TRANSACTION");
//        try {
//            if($_POST["type"] == 2){
//                if($_FILES["content"]){
//                    $url = $this->controller->uploadImages($_FILES["content"]);
//
//                    $sql = "UPDATE wp_content_pages SET
//                            page_id = %s,
//                            content_type_id = %s,
//                            content = %s,
//                            position_in_page = %s,
//                            status_id = 1";
//
//                    $prepare = $wpdb->prepare($sql, intval($_POST["page"]), intval($_POST["type"]), $url, $_POST["position"], intval($_POST["id"]));
//                    $wpdb->query($prepare);
//                }
//            }else{
//                $sql = "UPDATE wp_content_pages SET
//                        page_id = %s,
//                        content_type_id = %s,
//                        content = %s,
//                        position_in_page = %s,
//                        status_id = 1
//                        WHERE id = %s";
//                $prepare = $wpdb->prepare($sql, intval($_POST["page"]), intval($_POST["type"]), $_POST["content"], $_POST["position"], intval($_POST["id"]));
//                $wpdb->query($prepare);
//            }
//
//            $status = true;
//            $wpdb->query("COMMIT");
//        } catch (\Throwable $th) {
//            $result = $th->getMessage();
//            $wpdb->query("ROLLBACK");
//        }
//        if ($status) {
//            return $this->controller->response($status, array("type" => "success", "content" => "Done."), []);
//        } else {
//            return $this->controller->response($status, array("type" => "error", "content" => "Ocurrio un problema al momento de crear el contenido"), $result);
//        }
//    }
//
//    public function HomeView()
//    {
//        $html = "<!DOCTYPE html>";
//        $html .= "<html lang='es'>";
//        $html .= "<head>
//            <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css' integrity='sha384-zCbKRCUGaJDkqS1kPbPd7TveP5iyJE0EjAuZQTgFLD2ylzuqKfdKlfG/eSrtxUkn' crossorigin='anonymous'>
//        </head>";
//        $html .= "<body>";
//        $html .= "<div id='app'></div>";
//        $html .= "<script src='https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js' integrity='sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj' crossorigin='anonymous'></script>
//                  <script src='https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js' integrity='sha384-fQybjgWLrvvRgtW6bFlB7jaZrFsaBXjsOMm/tB9LTS58ONXgqbR9W8oWht/amnpF' crossorigin='anonymous'></script>";
//        $html .= "</body>";
//        $html .= "</html>";
//        echo $html;
//    }
//}