import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'

export const useComandaStore = defineStore('comanda', {
  state: () => ({
    comanda: null,
    comandas: [],
  }),
  getters: {
    getComandas: state => state.comandas,
  },
  actions: {
    /* ************* */
    /*      GET      */
    /* ************* */
    async fetchComandas(id_master) {
      this.comandas = null

      if (!id_master) {
        console.error('id_master is not provided or is null')
        throw new Error('Master ID is required')
      }

      const { data, error } = await supabase
        .from('comandas')
        .select(
          `
                    *,
                    clientes (
                        nombre
                    ),
                    mesas (
                        nombre
                    ),
                    comandas_productos (
                        cantidad,
                        productos (
                            *,
                            images (
                                url
                            )
                        )
                    )
                    `
        )
        .eq('id_master', id_master)
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[STORE]Error al obtener comandas:', error)
      } else {
        this.comandas = data.map(comanda => {
          comanda.comandas_productos = comanda.comandas_productos.map(cp => ({
            cantidad: cp.cantidad,
            producto: cp.productos,
          }))

          const total = comanda.comandas_productos.reduce((acc, { cantidad, producto }) => {
            return acc + cantidad * producto.precio
          }, 0)

          return {
            ...comanda,
            total,
          }
        })
      }
    },

    async fetchComandaById(id_comanda) {
      this.comanda = null

      if (!id_comanda) {
        console.error('[STORE]id_comanda is not provided or is null')
        throw new Error('Comanda ID is required')
      }

      const { data, error } = await supabase
        .from('comandas')
        .select(
          `
                        *,
                        clientes (
                            nombre
                        ),
                        mesas (
                            nombre
                        ),
                        comandas_productos (
                            cantidad,
                            productos (
                                *,
                                images (
                                    url
                                )
                            )
                        )
                    `
        )
        .eq('id', id_comanda)
        .eq('status', 'open')
        .single()

      if (error) {
        console.error('[STORE]Error al obtener los detalles de la comanda:', error)
        return
      }

      if (data && data.comandas_productos && Array.isArray(data.comandas_productos)) {
        data.comandas_productos = data.comandas_productos
          .map(({ productos, ...cp }) => ({
            ...cp,
            producto: productos,
          }))
          .filter(cp => cp.producto != null)

        const total = data.comandas_productos.reduce((acc, { cantidad, producto }) => {
          return acc + cantidad * producto.precio
        }, 0)

        this.comanda = {
          ...data,
          total,
        }
      } else {
        console.error('[STORE]La respuesta no tiene la forma esperada o no contiene productos.')
      }
    },

    /* ************* */
    /*      POST     */
    /* ************* */
    async createComanda(id_cliente, id_mesa, productosSeleccionados, created_by, id_master) {
      if (!id_master) {
        console.error('[STORE]id_master is not provided or is null')
        throw new Error('Master ID is required')
      }

      try {
        const { data: comanda, error: comandaError } = await supabase
          .from('comandas')
          .insert([
            {
              id_master,
              id_cliente,
              id_mesa,
              // created_at   //Se añade solo con timestamp
              created_by,
              // closed_at    //NULL por defecto hasta que se cierre
              status: 'open',
            },
          ])
          .select()
        console.info('COMANDA CREADA[STORE]: ', comanda)
        if (comandaError) throw comandaError

        if (!comanda || comanda.length === 0) {
          throw new Error('[STORE]La comanda fue creada, pero no se recibieron los datos.')
        }

        // Insert de los productos asociados a la comanda
        const inserts = productosSeleccionados.map(producto => {
          return {
            id_comanda: comanda[0].id,
            id_producto: producto.id,
            cantidad: producto.cantidad,
          }
        })

        const { error: productError } = await supabase.from('comandas_productos').insert(inserts)

        if (productError) throw productError
      } catch (err) {
        console.error('[STORE]Error al guardar la comanda:', err)
        throw err
      }
    },

    /* ************* */
    /*      PUT      */
    /* ************* */
    async updateComanda(comanda, id_master) {
      if (!id_master) {
        console.error('id_master is not provided or is null')
        throw new Error('Master ID is required')
      }
      // TO-DO
    },

    async updateProductsComanda(id_comanda, productos) {
      if (!id_comanda) {
        console.error('id_comanda is not provided or is null')
        throw new Error('Comanda ID is required')
      }

      // Preparar los datos para el upsert
      const upsertData = productos.map(producto => ({
        id_comanda,
        id_producto: producto.producto.id,
        cantidad: producto.cantidad,
      }))

      // Realizar un solo upsert en lugar de un bucle
      const { error } = await supabase.from('comandas_productos').upsert(upsertData, {
        onConflict: ['id_comanda', 'id_producto'], // Columnas de conflicto
        returning: 'minimal', // No devolver datos después del upsert
      })

      if (error) {
        console.error('[STORE]Error in upsert operation:', error)
        throw error
      }
    },

    async updateProductQuantity(idComanda, idProducto, newQuantity) {
      try {
        const { data, error } = await supabase
          .from('comandas_productos')
          .update({ cantidad: newQuantity })
          .match({ id_comanda: idComanda, id_producto: idProducto })

        if (error) throw error

        return data
      } catch (error) {
        console.error('Error al actualizar la cantidad del producto:', error)
        throw error
      }
    },

    async closeComanda(id_comanda) {
      const now = new Date().toISOString()

      const { error } = await supabase
        .from('comandas')
        .update({
          status: 'closed',
          closed_at: now,
        })
        .eq('id', id_comanda)

      if (error) {
        console.error('Error al cerrar la comanda:', error)
        return false
      }

      return true
    },

    /* ************* */
    /*    DELETE     */
    /* ************* */
    async deleteProducto(id_comanda, id_producto) {
      const { error } = await supabase
        .from('comandas_productos')
        .delete()
        .match({ id_comanda, id_producto })

      if (error) {
        console.error('[STORE]Error al eliminar el pedido:', error)
        return
      }

      // Eliminar el pedido de la lista en la interfaz de usuario
      this.comanda.comandas_productos = this.comanda.comandas_productos.filter(
        pedido => pedido.producto.id !== id_producto
      )

      // Recalcular el total
      this.comanda.total = this.comanda.comandas_productos.reduce((total, cp) => {
        return total + cp.cantidad * cp.producto.precio
      }, 0)
    },
  },
})
