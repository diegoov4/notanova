<script setup>
import { ref, onMounted, toRef, computed } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useProductoStore } from '@/store/productoStore'
// Carousel
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide } from 'vue3-carousel'

const authStore = useAuthStore()
const productosStore = useProductoStore()
const userMasterData = toRef(authStore, 'userMasterData')
const productos = toRef(productosStore, 'productos')
const productTypes = toRef(productosStore, 'product_types')
const optionsList = ref([])
const master_id = userMasterData.value.id
const selectedType = ref('')
const showFormularioNuevo = ref(false)
const showImageSelector = ref(false)
const selectedImage = ref(null)
const showConfirmDialog = ref(false)
const productToDelete = ref(null)
const titleToConfirmDialog = ref('')
const textToConfirmDialog = ref('')
const nuevoProducto = ref({
  titulo: '',
  id_imagen: 27, // Imagen de Producto por defecto. DMO: Cambiar a hacer la busqueda por Default=TRUE
  url: '',
  precio: '',
})

const filteredProducts = computed(() => {
  console.info('[selectedType] ', selectedType.value)
  if (selectedType.value) {
    return productos.value.filter(producto => {
      return producto.images.product_types.id === parseInt(selectedType.value, 10)
    })
  }
  return productos.value
})

const handleImageSelect = image => {
  selectedImage.value = image
  // set img atts
  nuevoProducto.value.id_imagen = image.id
  nuevoProducto.value.url = image.url
  nuevoProducto.value.type = image.type
  console.info(
    '[Selector_Image]: ',
    nuevoProducto.value,
    'New Image: ',
    image,
    '[SelectedImage]',
    selectedImage
  )
}

const fetchProductos = async () => {
  selectedType.value = ''
  if (master_id) {
    await productosStore.fetchProductos(master_id)

    optionsList.value = productTypes.value.map(type => ({
      id: `${type.id}`,
      title: `${type.categoria} > ${type.subcategoria}`,
    }))
  }
}

onMounted(fetchProductos)

// NEW Product
const agregarNuevoProducto = async () => {
  if (nuevoProducto.value.titulo && nuevoProducto.value.precio) {
    const nuevoProductoCreado = await productosStore.createProduct(nuevoProducto.value, master_id)
    if (nuevoProductoCreado) {
      // Add new url to product
      if (!nuevoProductoCreado.images) {
        nuevoProductoCreado.images = {}
        if (!nuevoProductoCreado.images.product_types) {
          nuevoProductoCreado.images.product_types = {}
        }
      }
      nuevoProductoCreado.images.url = nuevoProducto.value.url
      nuevoProductoCreado.images.product_types.id = nuevoProducto.value.type
      productos.value.push(nuevoProductoCreado)
      console.info('[Productos]productos: ', productos)
    }
    // Clean vars
    nuevoProducto.value = { titulo: '', id_imagen: 27, url: '', precio: '' }
    selectedImage.value = null
    showFormularioNuevo.value = false
  } else {
    alert('Tiene que rellenar al menos el título y el Precio')
  }
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

// Close & Clear vars
const closeProductForm = () => {
  selectedImage.value = ''
  showFormularioNuevo.value = false
}

// DELETE
const promptDeleteProduct = producto => {
  productToDelete.value = producto
  titleToConfirmDialog.value = `Eliminar ${producto.titulo}`
  textToConfirmDialog.value = `¿Estás seguro de que deseas eliminar "${producto.titulo}" de la comanda?`
  showConfirmDialog.value = true
}

const resetConfirmDialog = () => {
  productToDelete.value = null
  showConfirmDialog.value = false
}

const deleteProduct = async () => {
  const producto = productToDelete.value
  console.info('deleteProduct: ', producto)
  try {
    const eliminado = await productosStore.deleteProducto(producto.id, master_id)

    if (eliminado) {
      productos.value = productos.value.filter(p => p.id !== producto.id)
      resetConfirmDialog()
    }
  } catch (error) {
    console.error('Hubo un error al eliminar el producto:', error)
  }
}
</script>

<template>
  <!-- DMO: Try fill-height -->
  <v-container class="bg-shelv-image pa-12 rounded-xl">
    <!-- Header -->
    <v-row>
      <!-- Carrito -->
      <v-col>
        <v-btn color="secondary" @click="showFormularioNuevo = true">
          <i-ph-shopping-cart-bold class="mr-2" />
          Producto
        </v-btn>
      </v-col>
      <!-- Type Filter -->
      <v-col cols="4">
        <v-select
          v-model="selectedType"
          :items="optionsList"
          item-text="title"
          item-value="id"
          bg-color="white"
          base-color="black"
          label="Tipo de producto"
          placeholder="Seleccione tipo"
        />
      </v-col>
    </v-row>

    <!-- Products List (Carousel) -->
    <Carousel :items-to-show="4.95" hover :wrap-around="true" :transition="500" class="pt-8 pb-10">
      <template #slides>
        <Slide v-for="product in filteredProducts" :key="product.id">
          <div class="carousel__item">
            <v-avatar
              rounded="0"
              class="rounded-lg"
              size="290"
              :image="product.images.url"
              :alt="product.titulo"
            />
            <p class="text-h5 text-white">{{ product.titulo }}</p>
            <p class="text-h6 text-amber-accent-2">{{ formatCurrency(product.precio) }}</p>
            <v-btn variant="elevated" color="error" @click="promptDeleteProduct(product)">
              <i-ph-trash-duotone />
            </v-btn>
          </div>
        </Slide>
      </template>

      <template #addons>
        <!-- <Navigation /> -->
        <!-- <Pagination /> -->
      </template>
    </Carousel>

    <!-- Formulario Nuevo Producto -->
    <v-dialog v-model="showFormularioNuevo" persistent max-width="300px">
      <v-card class="pa-4 mb-4 rounded-lg">
        <!-- Header -->
        <v-card-title class="d-flex justify-space-between align-center">
          Nuevo Producto
          <i-ph-x-bold @click="closeProductForm" />
        </v-card-title>

        <v-divider color="primary"></v-divider>

        <!-- Fields for new Product -->
        <v-card-text>
          <v-text-field
            v-model="nuevoProducto.titulo"
            clearable
            label="Titulo"
            variant="outlined"
          />
          <v-text-field
            v-model.number="nuevoProducto.precio"
            min="0"
            type="number"
            label="Precio (€)"
            variant="outlined"
          />
          <!-- Fake input para imagen -->
          <v-text-field
            hover
            variant="outlined"
            class="text-grey-darken-1"
            @click="showImageSelector = true"
          >
            <template #prepend-inner>
              <v-avatar
                v-if="selectedImage"
                size="40"
                class="mr-2"
                :image="selectedImage?.url"
                alt="imagen"
              />
            </template>
            <span class="overflow-hidden-ellipsis">
              {{ selectedImage?.titulo || 'Imagen' }}
            </span>
            <template #append-inner>
              <v-fade-transition leave-absolute>
                <v-progress-circular
                  v-if="showImageSelector"
                  color="info"
                  indeterminate
                  size="24"
                ></v-progress-circular>

                <i-ph-plus-bold v-else />
              </v-fade-transition>
            </template>
          </v-text-field>
        </v-card-text>

        <v-divider color="primary"></v-divider>

        <v-card-actions class="mt-2">
          <v-btn variant="elevated" color="primary" @click="agregarNuevoProducto">Guardar</v-btn>
          <v-spacer></v-spacer>
          <v-btn variant="elevated" color="error" @click="closeProductForm">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Selector de Imagen -->
    <ImageSelectorDialog
      v-model="showImageSelector"
      :options-list="optionsList"
      @select="handleImageSelect"
      @close="showImageSelector = false"
    />

    <!-- ############## -->
    <!-- Confirm Dialog -->
    <v-dialog v-model="showConfirmDialog" persistent max-width="300px">
      <v-card>
        <v-card-title class="text-h5">{{ titleToConfirmDialog }}</v-card-title>
        <v-card-text>{{ textToConfirmDialog }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error darken-1" text @click="resetConfirmDialog">Cancelar</v-btn>
          <v-btn color="primary darken-1" text @click="deleteProduct(productToDelete.value)">
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
