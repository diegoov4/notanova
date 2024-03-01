// src/plugins/vuetify.js
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import colors from 'vuetify/util/colors'

export default createVuetify({
  theme: {
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#007651',
          // primary: colors.teal.lighten3,
          secondary: '#998402',
          // secondary: colors.amber.accent3,
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
