import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Pinia
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// Vuetify
import vuetify from './plugins/vuetify'
// i18n - ES
import i18n from './i18n'

// Importar estilo global
import './assets/global.css'
// Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(router)
app.use(pinia)
app.use(vuetify)
app.use(i18n)

app.mount('#app')
