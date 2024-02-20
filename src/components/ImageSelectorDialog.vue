<script setup>
import { ref, computed, onMounted, toRef } from 'vue'
import { useProductoStore } from '@/store/productoStore'

defineProps({
  optionsList: Array,
})
const emit = defineEmits(['close', 'select'])

const productosStore = useProductoStore()
const images = toRef(productosStore, 'images')
const productTypes = toRef(productosStore, 'product_types')
const selectedType = ref('')

const selectImage = image => {
  emit('select', image)
  close()
}

const fetchImages = async () => {
  await productosStore.fetchImages()
  console.info('[fetchTypes] ', productTypes, '[fetchImages] ', images)
}

onMounted(fetchImages)

const close = () => emit('close')

// Computed filter for image types
const filteredImages = computed(() => {
  let filterImg = images.value
  if (selectedType.value) {
    filterImg = images.value.filter(
      image => image.product_types && image.product_types.id === selectedType.value.value
    )
  }
  return filterImg
})
</script>

<template>
  <div class="dialog-overlay" @click.self="close">
    <div class="dialog">
      <!-- Type Filter -->
      <div class="filter-container">
        <v-select
          v-model="selectedType"
          class="type-filter"
          :options="optionsList"
          label="description"
          placeholder="Tipo de producto"
        />
      </div>
      <ul class="products-picker image-list">
        <li
          v-for="image in filteredImages"
          :key="image.id"
          class="product-item"
          @click="selectImage(image)"
        >
          <div class="product-image-container">
            <img class="product-image" :src="image.url" :alt="image.titulo" />
          </div>
          <span>{{ image.titulo }}</span>
        </li>
      </ul>
      <footer class="dialog-footer">
        <button class="button button-green" @click="close">Cerrar</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.image-list .product-item {
  border-bottom: 1px solid #d3d3d3;
}
</style>
