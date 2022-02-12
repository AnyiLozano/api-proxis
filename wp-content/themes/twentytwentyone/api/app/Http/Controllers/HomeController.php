<?php

namespace App\Http\Controllers;

require dirname(__DIR__, 3) . "/vendor/autoload.php";
require dirname(__DIR__) . "/Controllers/Controller.php";
require dirname(__DIR__, 2) . "/Models/AssetsByContent.php";
require dirname(__DIR__, 2) . "/Models/ContentPage.php";

use App\Models\AssetsByContent;
use App\Models\ContentPage;

class HomeController extends Controller
{
    /**
     * This function is used from get all content of the home.
     * @return array with the data obtained in the request.
     */
    public function getHomeContent()
    {
        $contents = ContentPage::with(["content_type", "status", "page", "assets_by_content"])->get();
        return $this->response(true, array("type" => "success", "content" => "Done."), $contents);
    }

    public function createContent($request)
    {
        global $wpdb;
        $status = false;
        $result = null;
        $wpdb->query('START TRANSACTION');
        try {
            if(isset($request["is_parent"])){
                $contentPage = new ContentPage();
                $contentPage->page_id = $request["page"];
                $contentPage->content_type_id = $request["type"];
                $contentPage->status_id = $this->activeStatus;
                $contentPage->save();

                $assets = new AssetsByContent();
                foreach($request["assets"] as $key => $value){
                    if($value->hasFile("content$key")){
                        $assets->content_page_id = $contentPage->id;
                        $assets->content = $this->uploadImages($value->file("content$key"));
                        $assets->status_id = $this->activeStatus;
                        $assets->save();
                    }else{
                        $assets->content_page_id = $contentPage->id;
                        $assets->content = $value["content$key"];
                        $assets->status_id = $this->activeStatus;
                        $assets->save();
                    }
                }
            }else{
                $contentPage = new ContentPage();
                $contentPage->page_id = $request["page"];
                $contentPage->content_type_id = $request["type"];
                if(count($request->get_file_params("content")) != 0){
                    $contentPage->content = $this->uploadImages($request->get_file_params("content")["content"]);
                }else{
                    $contentPage->content = $request["content"];
                }
                $contentPage->status_id = $this->activeStatus;
                $contentPage->save();
            }

            $status = true;
            $wpdb->query("COMMIT");
        } catch (\Throwable $th) {
            $result = $th->getMessage();
            $wpdb->query("ROLLBACK");
        }
        if ($status) {
            return $this->response($status, array("type" => "success", "content" => "Done."), $contentPage);
        } else {
            return $this->response($status, array("type" => "error", "content" => "Ocurrio un problema intentando crear el contenido, intentalo otra vez mas tarde."), $result);
        }
    }
}