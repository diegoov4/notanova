import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'

export const useClientStore = defineStore('cliente', {
  state: () => ({
    clientes: [],
  }),
  getters: {
    getClients: state => state.clientes,
  },
  actions: {
    /* ************* */
    /*      GET      */
    /* ************* */
    async fetchClients(id_master) {
      if (!id_master) {
        console.error('id_master is not provided or is null')
        throw new Error('Master ID is required')
      }

      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id_master', id_master)
        .is('closed_at', null)
        .order('id', { ascending: false })

      if (error) console.error('Error al cargar clientes:', error)
      else {
        this.clientes = data
        console.info('CLIENTES[fetchClients_IN]', data)
      }
    },

    /* ************* */
    /*      POST     */
    /* ************* */
    async createClient(clientName, id_master) {
      if (!id_master) {
        console.error('id_master is not provided or is null')
        throw new Error('Master ID is required')
      }

      if (!clientName) throw new Error('No Client Name')

      // Capitalizamos el cliente
      const capitalizeClientName =
        clientName.charAt(0).toUpperCase() + clientName.slice(1).toLowerCase()

      const { data, error } = await supabase
        .from('clientes')
        .insert([{ nombre: capitalizeClientName, id_master }])
        .select()

      if (error) {
        console.error('[STORE]Error al crear cliente:', error)
        throw error
      } else {
        console.info('[STORE]CLIENTE: ', capitalizeClientName, ' CREADO')
        return data[0]
      }
    },

    /* ************* */
    /*      PUT      */
    /* ************* */
    async updateClient(client) {
      if (!client) {
        console.error('Client is not provided or is null')
        throw new Error('Client is required')
      }
      try {
        const updates = {}

        // Check & Validation for: Phone
        if (client.phone !== undefined && client.phone !== '') {
          // Add +34 if not + from front
          if (!client.phone.startsWith('+')) {
            updates.phone = `+34${client.phone}`
          } else {
            updates.phone = client.phone
          }
          // Verificación adicional para asegurar que cumple con el formato esperado
          const phoneRegex = /^[+]?[0-9]{10,15}$/
          if (!phoneRegex.test(updates.phone)) {
            throw new Error('Phone Format is not valid')
          }
        }

        // Check & Validation for: Email
        if (client.email !== undefined && client.email !== '') {
          const emailRegex = /^[^@\s]+@([^@\s]+\.)+[^@\s]+$/
          if (!emailRegex.test(client.email)) {
            console.error('Email format is not valid')
            throw new Error('Email format is not valid')
          }
          updates.email = client.email
        }

        // Check updates
        if (Object.keys(updates).length > 0) {
          const { data, error } = await supabase
            .from('clientes')
            .update(updates)
            .match({ id: client.id })

          if (error) throw error

          return data
        } else {
          console.error('No hay cambios para actualizar.')
        }
      } catch (error) {
        console.error('Error al actualizar el Cliente:', error)
        throw error
      }
    },

    /* ************* */
    /*    DELETE     */
    /* ************* */
    async deleteCliente(id_cliente) {
      const now = new Date().toISOString()

      // Change: cambiamos closed_at en vez de borrar (por las fk)
      const { error } = await supabase
        .from('clientes')
        .update({ closed_at: now })
        .eq('id', id_cliente)

      // const { error } = await supabase.from('clientes').delete().eq('id', id_cliente)

      if (error) {
        console.error('[STORE]Error al eliminar el cliente:', error)
        return false
      }
      return true
    },
  },
})
