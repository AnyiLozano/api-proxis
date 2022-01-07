import Vue from "vue";
import { ClientTable, Event } from "vue-tables-2";

// Components
import App from "./App.vue";

// Vue use
Vue.use(ClientTable, [{

}]);

window.onload = () => {
    new Vue({
        el: "#app",
        render(h){
            return h(App);
        }
    });
}