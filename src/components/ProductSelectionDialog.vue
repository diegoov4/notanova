<script setup>
import { ref, computed, onMounted, toRef } from 'vue'
import { useProductoStore } from '@/store/productoStore'

defineProps({
  optionsList: Array,
})
const emit = defineEmits(['update:modelValue', 'selected-products'])

const productoStore = useProductoStore()
const availableProducts = toRef(productoStore, 'productos')
const selectedType = ref('')

// Reset 'cantidad' to 0 for new products
const resetCantidad = () => {
  selectedType.value = ''
  availableProducts.value = availableProducts.value.map(product => ({
    ...product,
    cantidad: 0,
  }))
}
onMounted(resetCantidad)

const confirmSelection = () => {
  const selected = availableProducts.value
    .filter(product => product.cantidad > 0)
    .map(product => ({
      id: product.id,
      titulo: product.titulo,
      images: { url: product.images.url },
      cantidad: product.cantidad,
      precio: product.precio,
    }))

  emit('selected-products', selected)
  close()
}

// Computed filter for image types
const filteredProducts = computed(() => {
  if (selectedType.value) {
    return availableProducts.value.filter(producto => {
      return producto.images.product_types.id === parseInt(selectedType.value, 10)
    })
  }
  return availableProducts.value
})

const formatCurrency = value => {
  if (value) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }
  return ''
}

const increment = product => {
  product.cantidad++
}
const decrement = product => {
  if (product.cantidad > 0) {
    product.cantidad--
  }
}

function close() {
  resetCantidad()
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog max-width="600px" @click:outside="close">
    <v-card class="pa-4 mb-4 rounded-lg">
      <!-- Header -->
      <v-card-title class="d-flex justify-space-between align-center">
        Seleccionar Productos
        <i-ph-x-bold @click="close" />
      </v-card-title>

      <!-- Filter Type -->
      <v-select
        v-model="selectedType"
        :items="optionsList"
        item-text="title"
        item-value="id"
        placeholder="Seleccione tipo"
        label="Tipo de producto"
      ></v-select>

      <v-divider color="primary"></v-divider>

      <!-- Product Picker -->
      <v-list lines="two">
        <v-list-item v-for="product in filteredProducts" :key="product.id">
          <!-- Image Product -->
          <template #prepend>
            <v-avatar size="80" :image="product.images.url" :alt="product.titulo" />
          </template>
          <!-- Desc. Product -->
          <template #title>
            <span class="text-h6">
              {{ product.titulo }}
            </span>
            |
            <span class="text-h6 text-primary font-weight-bold">
              {{ formatCurrency(product.precio) }}
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
                    @click="decrement(product)"
                  >
                    <i-ph-minus-bold />
                  </v-btn>
                  <v-btn
                    color="#c7c7c7"
                    class="d-sm-none"
                    size="50"
                    icon
                    @click="decrement(product)"
                  >
                    <i-ph-minus-bold />
                  </v-btn>
                </template>
                <div class="cantidad">
                  {{ product.cantidad }}
                </div>

                <template #append>
                  <v-btn
                    color="#c7c7c7"
                    class="d-none d-sm-flex"
                    size="55"
                    icon
                    @click="increment(product)"
                  >
                    <i-ph-plus-bold />
                  </v-btn>
                  <v-btn
                    color="#c7c7c7"
                    class="ml-4 d-sm-none"
                    size="50"
                    icon
                    @click="increment(product)"
                  >
                    <i-ph-plus-bold />
                  </v-btn>
                </template>
              </v-text-field>
            </div>
          </template>
        </v-list-item>
      </v-list>

      <!-- Footer -->
      <v-card-actions>
        <v-btn variant="elevated" color="primary" @click="confirmSelection">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
/* Mobile screen */
@media (max-width: 600px) {
  .cantidad {
    font-size: 1.8rem;
    padding-top: 0.3rem;
  }
}
</style>
