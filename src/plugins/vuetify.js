// src/plugins/vuetify.js
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import colors from 'vuetify/util/colors'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
// import DateFnsAdapter from '@date-io/date-fns'
import es from 'date-fns/locale/es'

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  date: {
    // adapter: DateFnsAdapter,
    locale: {
      es,
    },
  },
  theme: {
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#007651',
          secondary: '#998402',
          success: colors.lightGreen.lighten1,
          warning: colors.yellow.lighten1,
          error: '#da2911',
          // error: colors.red.accent2,
          // info: colors.blueGrey.darken4,
          info: colors.lightBlue.lighten4,
        },
      },
    },
  },
})
