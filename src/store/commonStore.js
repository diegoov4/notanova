import { defineStore } from 'pinia';
import { supabase } from '@/services/supabase';

export const useCommonStore = defineStore('common', {
    state: () => ({
        showNewComandaDialog: false,
        userLocal: null,
    }),
    persist: {
        paths: ['userLocal'],
      },
    getters: {
        isNewComandaDialogVisible: (state) => !!state.showNewComandaDialog,
        getUserLocal: (state) => state.userLocal,
    },
    actions: {
        setShowNewComandaDialog(value) {
            this.showNewComandaDialog = value;
        },
        setUserLocal(user_local) {
            this.userLocal = user_local;
        },
        clearData() {
            this.showNewComandaDialog = false;
            this.userLocal = null;
        },

        /* ************* */
        /*      GET      */
        /* ************* */
        async fetchLocalByEmail(email) {
            if (!email) {
                console.error('Email is not provided or is null');
                throw new Error('EMAIL is required');
            }

            const { data, error } = await supabase
                .from('locales_master')
                .select('*')
                .eq('email', email);

            if (error) console.error('[STORE]Error. No se ha podido cargar el Local:', error);
            else { 
                this.setUserLocal(data);
                console.log('[STORE]LOCAL_USER: ', data) 
            }
        },
    },
})