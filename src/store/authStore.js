import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    auth_user: null,
    userMasterData: null,
  }),
  persist: {
    paths: ['auth_user', 'userMasterData'],
  },
  getters: {
    isAuthenticated: state => !!state.auth_user,
    getUserMasterData: state => state.userMasterData,
  },
  actions: {
    setUser(userData) {
      this.auth_user = userData
    },
    setUserMasterData(user) {
      this.userMasterData = user
    },
    clearUser() {
      this.auth_user = null
      this.userMasterData = null
    },

    /* ************* */
    /*      GET      */
    /* ************* */
    async fetchUserMasterData(email) {
      if (!email) {
        console.error('Email is not provided or is null')
        throw new Error('EMAIL is required')
      }

      const { data, error } = await supabase
        .from('auth_users')
        .select('*, master:id_master(nombre)')
        .eq('email', email)
        .single()

      if (error) {
        console.error('[STORE]Error. No se ha podido cargar Master Data:', error)
        return false
      } else {
        this.setUserMasterData(data)
        console.info('[STORE] AUTH_USER_MASTER_DATA: ', data)
        return true
      }
    },
  },
})
