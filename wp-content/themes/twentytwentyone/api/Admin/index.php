<?php

namespace Api\Admin;

require get_template_directory() . "/api/Admin/views/table.php";

use Api\Admin\Views\Table;

class ContentAdmin
{
    public function __construct()
    {
        $this->admin_content();
    }

    public function admin_content()
    {
        $table = new Table();
        return  $table->TableAdmin();
    }
}