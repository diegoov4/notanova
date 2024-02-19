<template>
  <div class="productos-container">
    <!-- Header -->
    <div class="products-header">
      <!-- Carrito -->
      <div class="add-product-button-container">
        <button @click="showFormularioNuevo = true" class="button button-yellow">
          <i class="fa-solid fa-cart-plus fa-xl"></i>
        </button>
      </div>
      <!-- Type Filter -->
      <div class="filter-container">
        <v-select
          class="type-filter"
          :options="optionsList"
          v-model="selectedType"
          label="description"
          placeholder="Tipo de producto"
        />
      </div>
    </div>

    <!-- Form -->
    <div
      v-if="showFormularioNuevo"
      class="dialog-overlay"
      @click.self="showFormularioNuevo = false"
    >
      <div class="form-new-product">
        <h2>Nuevo Producto</h2>
        <input v-model="nuevoProducto.titulo" placeholder="Título" />
        <input
          v-model.number="nuevoProducto.precio"
          min="0"
          type="number"
          placeholder="Precio (€)"
        />
        <!-- fake input -->
        <div class="image-input" @click="showImageSelector = true">
          <img v-if="selectedImage" :src="selectedImage?.url" class="thumbnail" />
          <span>{{ selectedImage?.titulo || 'Imagen' }}</span>
          <i class="fa-solid fa-plus"></i>
        </div>
        <button @click="agregarNuevoProducto" class="button button-green">Guardar</button>
        <button @click="showFormularioNuevo = false" class="button button-red">Cerrar</button>
      </div>
    </div>

    <!-- Select Image -->
    <div class="product-dialog-container" v-if="showImageSelector">
      <ImageSelectorDialog
        :options-list="optionsList"
        @select="handleImageSelect"
        @close="showImageSelector = false"
      />
    </div>

    <!-- Products List (Carousel) -->
    <Carousel
      v-if="!showFormularioNuevo"
      class="activeClasses"
      :itemsToShow="3.95"
      :wrapAround="true"
      :transition="500"
    >
      <Slide v-for="product in filteredProducts" :key="product.id">
        <div class="carousel__item">
          <img :src="product.images.url" :alt="product.titulo" class="product-image" />
          <h3 class="product-title">{{ product.titulo }}</h3>
          <p>{{ formatCurrency(product.precio) }}</p>
          <button @click="deleteProduct(product)" class="button button-red delete-button">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </Slide>

      <template #addons>
        <Navigation />
        <!-- <Pagination /> -->
      </template>
    </Carousel>
  </div>
</template>

<script>
import { ref, onMounted, toRef, computed } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useProductoStore } from '@/store/productoStore'
import ImageSelectorDialog from '@/components/ImageSelectorDialog.vue'
// Carousel
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Navigation, Slide } from 'vue3-carousel'

export default {
  name: 'Productos',
  components: {
    ImageSelectorDialog,
    Carousel,
    Slide,
    Navigation,
    // Pagination,
  },
  setup() {
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
          return producto.images.product_types.id === selectedType.value.value
        })
      }
      return productos.value
    })

    const handleImageSelect = image => {
      selectedImage.value = image
      nuevoProducto.value.id_imagen = image.id
      nuevoProducto.value.url = image.url
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
      if (master_id) {
        await productosStore.fetchProductos(master_id)

        optionsList.value = productTypes.value.map(type => ({
          value: type.id,
          description: `${type.categoria} > ${type.subcategoria}`,
        }))
      }
    }

    onMounted(fetchProductos)

    // Nuew Product
    const agregarNuevoProducto = async () => {
      if (nuevoProducto.value.titulo && nuevoProducto.value.precio) {
        const nuevoProductoCreado = await productosStore.createProduct(
          nuevoProducto.value,
          master_id
        )
        if (nuevoProductoCreado) {
          // Add new url to product
          if (!nuevoProductoCreado.images) {
            nuevoProductoCreado.images = {}
          }
          nuevoProductoCreado.images.url = nuevoProducto.value.url
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

    const deleteProduct = async producto => {
      console.info('deleteProduct: ', producto)
      if (!confirm(`¿Estás seguro de que deseas eliminar "${producto.titulo}" de tu Catalogo?`)) {
        return
      }
      try {
        const eliminado = await productosStore.deleteProducto(producto.id, master_id)

        if (eliminado) {
          productos.value = productos.value.filter(p => p.id !== producto.id)
        }
      } catch (error) {
        console.error('Hubo un error al eliminar el producto:', error)
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

    return {
      selectedImage,
      handleImageSelect,
      showImageSelector,
      filteredProducts,
      selectedType,
      productTypes,
      optionsList,
      productos,
      showFormularioNuevo,
      nuevoProducto,
      agregarNuevoProducto,
      deleteProduct,
      formatCurrency,
    }
  },
}
</script>

<style scoped>
/* PRODUCTS */
.productos-container {
  padding: 1rem;
  /* shelv texture */
  background: url('@/assets/bg-shelv.JPG') no-repeat center center fixed;
  background-size: cover;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.product-title {
  font-size: 1.1rem;
  color: #fff;
}

.yellow {
  font-size: 1.1rem;
  font-weight: bold;
}

.add-product-button-container {
  margin-bottom: 1rem;
}

.product-image {
  max-width: 100%;
  width: 80%;
  height: 80%;
  border-radius: 4px;
  object-fit: cover;
}

.delete-button {
  padding: 0.5rem 1rem;
  margin-top: 1rem;
}

/* FORM STYLE */
.form-new-product {
  background: #ffffff;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
}

.form-new-product h2 {
  margin-bottom: 0.2rem;
}

.form-new-product input,
.form-new-product button {
  display: block;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.image-input {
  display: flex;
  align-items: center;
  /* gap: 8rem; */
  justify-content: space-between;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.image-input span {
  color: #746e6e;
}

.thumbnail {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
