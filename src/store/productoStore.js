import { defineStore } from 'pinia';
import { supabase } from '@/services/supabase';

export const useProductoStore = defineStore('producto', {
    state: () => ({
        product_types: [],
        images: [],
        productos: [],
    }),
    getters: {
        getProducts: (state) => state.productos,
        getImages: (state) => state.images,
        getProductTypes: (state) => state.product_types,
    },
    actions: {

        /* ************* */
        /*      GET      */
        /* ************* */
        async fetchProductos(id_master) {
            if (!id_master) {
                console.error('id_master is not provided or is null');
                throw new Error('Master ID is required');
            }

            const { data, error } = await supabase
                .from('productos')
                .select(`
                  *,
                  images (
                    url
                  )
                `)
                .eq('id_master', id_master);

            if (error) {
                console.error('[STORE]Error al cargar los productos:', error);
            } else {
                this.productos = data;
            }
        },

        async fetchProductTypes() {
            const { data, error } = await supabase
                .from('product_types')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                console.error('[STORE]Error al cargar los Tipos de Productos:', error);
            } else {
                this.product_types = data;
            }
        },

        async fetchImages() {
            const { data, error } = await supabase
                .from('images')
                .select(`
                *,
                product_types (
                    id,
                    categoria,
                    subcategoria
                )
                `)
                .order('id', { ascending: true });

            if (error) {
                console.error('[STORE]Error al cargar las imágenes:', error);
            } else {
                this.images = data;
            }
        },

        /* ************* */
        /*      POST     */
        /* ************* */
        async createProduct(producto, id_master) {
            if (!id_master || !producto.titulo || !producto.precio) {
                console.error(`id_master, titulo or precio is not provided or is null: --> '${id_master}', '${producto.titulo}', '${producto.precio}'`);
                throw new Error('Master ID, Titulo or Precio are required');
            }
            const { data, error } = await supabase
                .from('productos')
                .insert([{ id_imagen: producto.id_imagen, titulo: producto.titulo, precio: producto.precio, id_master: id_master }])
                .select();
            if (error) {
                console.error('[STORE]Error al crear el producto:', error);
                throw error;
            } else {
                console.log(`[STORE]PRODUCTO: '${producto.titulo}' CREADO`);
                return data[0];
            }
        },

        /* ************* */
        /*      PUT      */
        /* ************* */
        async updateProduct(producto, id_master) {
            if (!id_master) {
                console.error('id_master is not provided or is null');
                throw new Error('Master ID is required');
            }
            //TO-DO
        },

        /* ************* */
        /*    DELETE     */
        /* ************* */
        async deleteProducto(id_producto, id_master) {
            const { error } = await supabase
                .from('productos')
                .delete()
                .match({ id: id_producto, id_master: id_master });

            if (error) {
                console.error('[STORE]Error al eliminar el producto:', error);
                throw error;
            }
            console.log(`[STORE]Producto con ID ${id_producto} eliminado correctamente.`);
            return true;
        },
    },
})