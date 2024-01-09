import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App';
import router from './router';

// Importar estilo global
import './assets/global.css';

const app = createApp(App);

app.use(createPinia()); // Usa Pinia para el estado global
app.use(router); // Usa Vue Router para la navegación

app.mount('#app');