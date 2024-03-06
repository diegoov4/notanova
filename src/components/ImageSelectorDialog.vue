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

// Computed filter for image types
const filteredImages = computed(() => {
  let filterImg = images.value
  if (selectedType.value) {
    filterImg = images.value.filter(
      image => image.product_types && image.product_types.id === parseInt(selectedType.value, 10)
    )
  }
  return filterImg
})

const close = () => {
  selectedType.value = ''
  emit('close')
}
</script>

<template>
  <v-dialog max-width="420" @click.self="close">
    <v-card class="pa-4 mb-4 rounded-lg">
      <!-- Type Filter -->
      <v-select
        v-model="selectedType"
        :items="optionsList"
        item-text="title"
        item-value="id"
        placeholder="Seleccione tipo"
        label="Tipo de producto"
      ></v-select>
      <v-list lines="two">
        <v-list-item
          v-for="image in filteredImages"
          :key="image.id"
          :subtitle="image.titulo"
          @click="selectImage(image)"
        >
          <!-- Image Product -->
          <template #prepend>
            <v-avatar size="60" :image="image.url" :alt="image.titulo" />
          </template>
        </v-list-item>
      </v-list>

      <v-divider color="primary"></v-divider>

      <!-- Footer -->
      <v-card-actions>
        <v-btn variant="elevated" color="error" class="btn-main" @click="close">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
