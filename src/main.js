import { createApp } from 'vue';
import App from './App';
import router from './router';

// Pinia
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
// Font Awesome - all
import '@fortawesome/fontawesome-free/css/all.css';
// Vue Select (beta)
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

// Importar estilo global
import './assets/global.css';
// Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App);
app.use(pinia);
app.use(router);
app.component("v-select", vSelect);

app.mount('#app');