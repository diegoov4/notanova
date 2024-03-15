import { createI18n } from 'vue-i18n'
import es from 'vuetify/lib/locale/es'

const messages = {
  es: {
    ...es,
    // Añadir o sobrescribir traducciones
  },
}

const i18n = createI18n({
  locale: 'es', // set locale Español
  messages,
})

export default i18n
