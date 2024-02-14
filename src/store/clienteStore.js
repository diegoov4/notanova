import { defineStore } from 'pinia';
import { supabase } from '@/services/supabase';

export const useClientStore = defineStore('cliente', {
    state: () => ({
        clientes: [],
    }),
    getters: {
        getClients: (state) => state.clientes,
    },
    actions: {

        /* ************* */
        /*      GET      */
        /* ************* */
        async fetchClients(id_master) {
            if (!id_master) {
                console.error('id_master is not provided or is null');
                throw new Error('Master ID is required');
            }

            const { data, error } = await supabase
                .from('clientes')
                .select('*')
                .eq('id_master', id_master)
                .order('id', { ascending: false });

            if (error) console.error('Error al cargar clientes:', error);
            else {
                this.clientes = data;
                console.log('CLIENTES[fetchClients_IN]', data);
            }
        },

        /* ************* */
        /*      POST     */
        /* ************* */
        async createClient(clientName, id_master) {
            if (!id_master) {
                console.error('id_master is not provided or is null');
                throw new Error('Master ID is required');
            }

            if (!clientName) throw new Error('No Client Name');

            //Capitalizamos el cliente
            const capitalizeClientName = clientName.charAt(0).toUpperCase() + clientName.slice(1).toLowerCase();

            const {error } = await supabase
                .from('clientes')
                .insert([{ nombre: capitalizeClientName, id_master: id_master }]);

            if (error) {
                console.error('[STORE]Error al crear cliente:', error);
                throw error;
            } else {
                console.log('[STORE]CLIENTE: ', capitalizeClientName, ' CREADO');
            }
        },

        /* ************* */
        /*      PUT      */
        /* ************* */
        async updateClient(client, id_master) {
            if (!id_master) {
                console.error('id_master is not provided or is null');
                throw new Error('Master ID is required');
            }
            //TO-DO
        },

        /* ************* */
        /*    DELETE     */
        /* ************* */
        async deleteClient(id_cliente) {
            const { error } = await supabase
                .from('clientes')
                .delete()
                .eq('id', id_cliente);

            if (error) {
                console.error('[STORE]Error al eliminar el cliente:', error);
                return false;
            }
            return true;
        },
    },
})