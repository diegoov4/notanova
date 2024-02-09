import { defineStore } from 'pinia';
import { supabase } from '@/services/supabase';

export const useMesaStore = defineStore('mesa', {
    state: () => ({
        mesas: [],
    }),
    getters: {
        getMesas: (state) => state.mesas,
    },
    actions: {

        /* ************* */
        /*      GET      */
        /* ************* */
        async fetchMesas(id_local) {
            if (!id_local) {
                console.error('id_local is not provided or is null');
                throw new Error('Local ID is required');
            }

            const { data, error } = await supabase
                .from('mesas')
                .select('*')
                .eq('id_local', id_local);

            if (error) console.error('Error al cargar las mesas:', error);
            else {
                this.mesas = data;
                console.log('MESAS[fetchMesas_IN]', data);
            }
        },

        /* ************* */
        /*      POST     */
        /* ************* */
        async createMesa(nombreMesa, id_local) {
            if (!id_local) {
                console.error('id_local is not provided or is null');
                throw new Error('Local ID is required');
            }

            const {error } = await supabase
                .from('mesas')
                .insert([{ nombre_mesa: nombreMesa, id_local: id_local }]);

            if (error) {
                console.error('Error al crear la mesa[STORE]:', error);
                throw error;
            } else {
                console.log('MESA[STORE]: ', nombreMesa, ' CREADA');
            }
        },

        /* ************* */
        /*      PUT      */
        /* ************* */
        async updateMesa(nombreMesa, id_local) {
            if (!id_local) {
                console.error('id_local is not provided or is null');
                throw new Error('Local ID is required');
            }
            //TO-DO
        },

        /* ************* */
        /*    DELETE     */
        /* ************* */
        async deleteMesa(id_mesa) {
            const { error } = await supabase
                .from('mesas')
                .delete()
                .eq('id', id_mesa);

            if (error) {
                console.error('[STORE]Error al eliminar la mesa:', error);
                return false;
            }
            return true;
        },
    },
})