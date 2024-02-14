import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import '@fortawesome/fontawesome-free/css/all.css'; // Importa todo Font Awesome
import App from './App';
import router from './router';

// Importar estilo global
import './assets/global.css';

const app = createApp(App);

// Usa Pinia para el estado global
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia);
app.use(router);

app.mount('#app');