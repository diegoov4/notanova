import { defineStore } from 'pinia';
import { supabase } from '@/services/supabase';

export const useProductoStore = defineStore('producto', {
    state: () => ({
        productos: [],
    }),
    getters: {
        getProducts: (state) => state.productos,
    },
    actions: {

        /* ************* */
        /*      GET      */
        /* ************* */
        async fetchProductos(id_local) {
            if (!id_local) {
                console.error('id_local is not provided or is null');
                throw new Error('Local ID is required');
            }

            const { data, error } = await supabase
                .from('productos')
                .select('*')
                .eq('id_local', id_local);

            if (error) {
                console.error('Error al cargar los productos:', error);
            } else {
                this.productos = data.map(product => ({
                    ...product,
                    cantidad: 0,
                }));
            }
        },

        /* ************* */
        /*      POST     */
        /* ************* */
        async createProduct(producto, id_local) {
            if (!id_local) {
                console.error('id_local is not provided or is null');
                throw new Error('Local ID is required');
            }

            const { error } = await supabase
                .from('productos')
                .insert([{ titulo: producto.titulo, precio: producto.precio, id_local: id_local }]);

            if (error) {
                console.error('Error al crear el producto[STORE]:', error);
                throw error;
            } else {
                console.log('PRODUCTO[STORE]: ', producto.titulo, ' CREADO');
            }
        },

        /* ************* */
        /*      PUT      */
        /* ************* */
        async updateProduct(producto, id_local) {
            if (!id_local) {
                console.error('id_local is not provided or is null');
                throw new Error('Local ID is required');
            }
            //TO-DO
        },

        /* ************* */
        /*    DELETE     */
        /* ************* */
        async deleteProduct(id_producto) {
            const { error } = await supabase
                .from('productos')
                .delete()
                .eq('id', id_producto);

            if (error) {
                console.error('[STORE]Error al eliminar el producto:', error);
                return false;
            }
            return true;
        },
    },
})