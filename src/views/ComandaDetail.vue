<script setup>
import { ref, onMounted, toRef } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { useComandaStore } from '@/store/comandaStore'
import { useProductoStore } from '@/store/productoStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const comandaStore = useComandaStore()
const productStore = useProductoStore()
const userMasterData = toRef(authStore, 'userMasterData')
const productTypes = toRef(productStore, 'product_types')
const comanda = toRef(comandaStore, 'comanda')
const master_id = userMasterData.value.id
const showProductSelection = ref(false)
const optionsList = ref([])
const showConfirmDialog = ref(false)
const titleToConfirmDialog = ref('')
const textToConfirmDialog = ref('')
const confirmAction = ref(null)

const fetchComandaById = async () => {
  if (route.params.id) {
    // Get Comanda data
    await comandaStore.fetchComandaById(route.params.id)
    console.info('[COMANDA] ', comanda)
  } else {
    console.error('Invalid Param ID: ', route.params.id)
  }
}
const fetchProductos = async () => {
  await productStore.fetchProductos(master_id)

  optionsList.value = productTypes.value.map(type => ({
    id: `${type.id}`,
    title: `${type.categoria} > ${type.subcategoria}`,
  }))
}
onMounted(() => {
  fetchComandaById()
  fetchProductos()
})

const increment = async producto => {
  producto.cantidad++
  await comandaStore.updateProductQuantity(
    comanda.value.id,
    producto.producto.id,
    producto.cantidad
  )
  recalcularTotal()
}

const decrement = async producto => {
  if (producto.cantidad > 1) {
    producto.cantidad--
    await comandaStore.updateProductQuantity(
      comanda.value.id,
      producto.producto.id,
      producto.cantidad
    )
    recalcularTotal()
  }
}

function recalcularTotal() {
  let total = 0
  comanda.value.comandas_productos.forEach(item => {
    total += item.cantidad * item.producto.precio
  })
  comanda.value.total = total
}

const showProducts = selectedProducts => {
  console.info('[STORE_showProducts]selectedProducts: ', selectedProducts)
  console.info(
    '[STORE_showProducts]comanda.value.comandas_productos: ',
    comanda.value.comandas_productos
  )
  // Añadir productos seleccionados a la comanda existente
  selectedProducts.forEach(product => {
    const existingProduct = comanda.value.comandas_productos.find(p => p.producto.id === product.id)
    if (existingProduct) {
      existingProduct.cantidad += product.cantidad
    } else {
      comanda.value.comandas_productos.push({
        producto: product,
        cantidad: product.cantidad,
      })
    }
  })
  recalcularTotal()
  showProductSelection.value = false

  // Actualizar la comanda en el backend con los nuevos productos
  console.info('Lista Productos a Actualizar: ', comanda.value.comandas_productos)
  comandaStore.updateProductsComanda(comanda.value.id, comanda.value.comandas_productos)
}

const formatCurrency = value => {
  if (value) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }
  return ''
}

const goToLandingHome = () => {
  router.push({ name: 'LandingHome' })
}

// ####################
// Confirm Dialogs
// ####################
const promptCerrarComanda = () => {
  titleToConfirmDialog.value = 'Cerrar Comanda'
  textToConfirmDialog.value = `¿Quieres cobrar y cerrar la comanda?`
  confirmAction.value = cerrarComanda
  showConfirmDialog.value = true
}

const promptDeleteProducto = producto => {
  titleToConfirmDialog.value = `Eliminar ${producto.producto.titulo}`
  textToConfirmDialog.value = `¿Estás seguro de que deseas eliminar "${producto.producto.titulo}" de la comanda?`
  confirmAction.value = () => eliminarProducto(producto)
  showConfirmDialog.value = true
}

const confirmAndReset = () => {
  if (confirmAction.value) {
    // Ejecuta la acción confirmada
    confirmAction.value()
  }
  resetConfirmDialog()
}

const resetConfirmDialog = () => {
  showConfirmDialog.value = false
  confirmAction.value = null // Limpia la acción confirmada
}

const cerrarComanda = async () => {
  const cerrado = await comandaStore.closeComanda(comanda.value.id)
  if (!cerrado) {
    alert('Ha habido un error al cerrar la comanda. Contacte con el administrador')
  }
  // Redirigir a la Home
  router.push({ name: 'LandingHome' })
}

const eliminarProducto = async producto => {
  console.info('[EliminarProducto]: ', producto)
  await comandaStore.deleteProducto(comanda.value.id, producto.producto.id)
}
</script>

<template>
  <v-container>
    <!-- Cabecera Comanda -->
    <v-card class="pa-4 mb-4 rounded-lg">
      <v-card-title class="d-flex justify-space-between align-center">
        <!-- Cliente -->
        <span class="text-h4 text-capitalize d-none d-sm-flex">{{ comanda?.clientes.nombre }}</span>
        <span class="text-h6 text-uppercase mr-2 font-weight-bold text-primary d-sm-none">
          {{ comanda?.clientes.nombre }}
        </span>

        <!-- Mesa -->
        <span class="text-h5 text-capitalize d-none d-sm-flex">
          <i-mdi-table-chair class="mr-2" />
          {{ comanda?.mesas.nombre }}
        </span>
        <span
          class="text-subtitle-2 text-uppercase mr-2 font-weight-bold text-blue-grey-darken-3 d-sm-none"
        >
          -
          {{ comanda?.mesas.nombre }}
        </span>

        <!-- Total -->
        <span class="d-flex text-grey-darken-3">
          <!-- <span class="text-h5 mr-2 d-none d-sm-flex">Total:</span> -->
          <span
            class="text-h4 font-weight-bold text-secondary"
            style="cursor: pointer"
            @click="promptCerrarComanda"
          >
            {{ formatCurrency(comanda?.total) || '0 €' }}
          </span>
        </span>
      </v-card-title>

      <v-divider color="primary"></v-divider>

      <!-- Listado de Productos -->
      <v-list lines="two" class="overflow-y-auto mh-40">
        <v-list-item v-for="producto_b in comanda?.comandas_productos" :key="producto_b.id">
          <!-- Image Product -->
          <template #prepend>
            <v-avatar class="responsive-avatar" :image="producto_b.producto.images.url" />
          </template>
          <!-- Desc. Product -->
          <template #title>
            <span class="text-h5 d-none d-sm-flex">{{ producto_b.producto.titulo }}</span>
            <span class="text-subtitle-2 text-uppercase font-weight-bold d-sm-none">
              {{ producto_b.producto.titulo }}
            </span>
          </template>
          <!-- Cantidad -->
          <template #subtitle>
            <div class="selector-cantidad pl-6">
              <v-text-field variant="plain">
                <template #prepend>
                  <!-- Uses classes to responsive mode -->
                  <v-btn
                    color="#c7c7c7"
                    class="d-none d-sm-flex"
                    size="55"
                    icon
                    @click="decrement(producto_b)"
                  >
                    <i-ph-minus-bold />
                  </v-btn>
                  <v-btn
                    color="#c7c7c7"
                    class="d-sm-none"
                    size="35"
                    icon
                    @click="decrement(producto_b)"
                  >
                    <i-ph-minus-bold />
                  </v-btn>
                </template>
                <div class="cantidad">
                  {{ producto_b.cantidad }}
                </div>

                <template #append>
                  <v-btn
                    color="#c7c7c7"
                    class="d-none d-sm-flex"
                    size="55"
                    icon
                    @click="increment(producto_b)"
                  >
                    <i-ph-plus-bold />
                  </v-btn>
                  <v-btn
                    color="#c7c7c7"
                    class="d-sm-none"
                    size="35"
                    icon
                    @click="increment(producto_b)"
                  >
                    <i-ph-plus-bold />
                  </v-btn>
                </template>
              </v-text-field>
            </div>
          </template>
          <!-- Delete Product -->
          <template #append>
            <v-btn
              stacked
              size="40"
              class="ml-5"
              color="error"
              @click="promptDeleteProducto(producto_b)"
            >
              <i-ph-trash-duotone />
            </v-btn>
          </template>
        </v-list-item>
      </v-list>

      <!-- Footer. Editar comanda y Productos -->
      <v-card-actions>
        <v-btn
          variant="elevated"
          color="secondary"
          class="btn-main"
          :loading="showProductSelection"
          @click="showProductSelection = true"
        >
          Productos
        </v-btn>
        <!-- <v-btn variant="elevated" color="primary" @click="updateComanda">Guardar</v-btn> -->
        <v-spacer></v-spacer>
        <v-btn variant="elevated" color="grey" class="btn-main" @click="goToLandingHome">
          Salir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>

  <!-- ##################################### -->
  <!-- out from containter. Dialogs,Forms... -->
  <!-- ##################################### -->

  <!-- Dialogo Selección Productos -->
  <ProductSelectionDialog
    v-model="showProductSelection"
    :options-list="optionsList"
    @selected-products="showProducts"
    @close="showProductSelection = false"
  />
  <!-- Confirm Dialog -->
  <v-dialog v-model="showConfirmDialog" persistent max-width="300px">
    <v-card>
      <v-card-title class="text-h5">{{ titleToConfirmDialog }}</v-card-title>
      <v-card-text>{{ textToConfirmDialog }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error darken-1" class="btn-main" text @click="resetConfirmDialog">
          Cancelar
        </v-btn>
        <v-btn color="primary darken-1" class="btn-main" text @click="confirmAndReset">
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.responsive-avatar {
  width: 110px;
  height: 110px;
}

@media (max-width: 600px) {
  .responsive-avatar {
    width: 67px;
    height: 67px;
  }
}
</style>
