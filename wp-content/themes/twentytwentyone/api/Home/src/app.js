import Vue from "vue";
import { ClientTable, Event } from "vue-tables-2";
import vSelect from "vue-select";
import axios from "axios";
import Loading from 'vue-loading-overlay';
import VueSweetalert2 from 'vue-sweetalert2';


axios.defaults.baseURL = "http://api-praxis.test/wp-json";
window.axios = axios;

// Components
import App from "./App.vue";

// Styles
import "./assets/css/style.css";
import 'vue-select/dist/vue-select.css';
import 'vue-loading-overlay/dist/vue-loading.css';
import 'sweetalert2/dist/sweetalert2.min.css';

// Vue use
Vue.use(VueSweetalert2);
Vue.use(Loading, {
    backgroundColor: "#ffffff50",
    color: "#2962FF",
    loader: "dots"
})
Vue.use(ClientTable, [{

}]);

// Vue Components
Vue.component("v-select", vSelect);

window.onload = () => {
    new Vue({
        el: "#app",
        render(h){
            return h(App);
        }
    });
}