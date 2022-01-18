<?php

namespace App\Http\Controllers;

class ContactController extends Controller
{
    public function __construct()
    {
        add_action(
            "phpmailer_init",
            array($this, "mailerConfig")
        );
    }

    /**
     * This function is used from sent the contact email.
     * @param $request object with the body of the contact.
     * @return array with the email status.
     */
    public function sentContact(object $request): array
    {
        $name = $request['name'];
        $email = $request['email'];
        $message = $request['message'];

        $email = wp_mail(
            "anyi.lozano2119@gmail.com",
            "Contacto De Praxis",
            "La Sr(a) $name con correo electronico $email, llenó el formulario de contacto y envio el siguiente mensaje: $message",
            "Contacto Praxis"
        );

        if($email){
            return $this->response(true, array("type" => "success", "content" => "Done."), array());
        }else{
            return $this->response(false, array("type" => "error", "content" => "Ocurrio un problema al momento de envio del formulario de contacto."), array());
        }
    }
}