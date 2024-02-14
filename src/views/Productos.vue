<template>
  <div class="productos-container">
    <!-- Form -->
    <div v-if="showFormularioNuevo" class="dialog-overlay" @click.self="showFormularioNuevo = false">
      <div class="form-new-product">
        <h2>Nuevo Producto</h2>
          <input v-model="nuevoProducto.titulo" placeholder="Título" />
          <input v-model.number="nuevoProducto.precio" min="0" type="number" placeholder="Precio (€)" />
          <!-- fake input -->
          <div class="image-input" @click="showImageSelector = true">
            <img v-if="selectedImage" :src="selectedImage?.url" class="thumbnail" />
            <span>{{ selectedImage?.titulo || 'Imagen' }}</span>
            <i class="fa-solid fa-plus"></i>
          </div>
          <!-- <button class="button button-yellow" @click="showImageSelector = true">Imagen</button> -->
          <button @click="agregarNuevoProducto" class="button button-green">Guardar</button>
        <button @click="showFormularioNuevo = false" class="button button-red">Cerrar</button>
      </div>
    </div>

    <!-- Select Image -->
    <div class="product-dialog-container" v-if="showImageSelector">
      <ImageSelectorDialog @select="handleImageSelect" @close="showImageSelector = false" />
    </div>

    <div class="add-product-button-container">
      <button @click="showFormularioNuevo = true" class="button button-yellow">
        <i class="fa-solid fa-cart-plus fa-xl"></i>
      </button>
    </div>

    <!-- Products List -->
    <section class="pedido-section">
      <ul class="pedido-list">
        <li v-for="producto in productos" :key="producto.id" class="pedido-item-catalog">
          <div class="product-image-container">
            <img :src="producto.images.url" class="product-image" :alt="producto.titulo" />
          </div>
          <div class="pedido-info">
            <h3 class="product-title">{{ producto.titulo }}</h3>
            <p class="green">{{ formatCurrency(producto.precio) }}</p>
          </div>
          <button @click="eliminarProducto(producto)" class="button button-red">
            <i class="fas fa-trash-alt fa-xs"></i>
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import { ref, onMounted, toRef } from 'vue';
import { useAuthStore } from '@/store/authStore';
import { useProductoStore } from '@/store/productoStore';
import ImageSelectorDialog from '@/components/ImageSelectorDialog.vue';

export default {
  name: 'Productos',
  components: {
    ImageSelectorDialog
  },
  setup() {
    const authStore           = useAuthStore();
    const productosStore      = useProductoStore();
    const userMasterData      = toRef(authStore, "userMasterData");
    const productos           = toRef(productosStore, "productos");
    const master_id           = userMasterData.value.id;
    const showFormularioNuevo = ref(false);
    const showImageSelector   = ref(false);
    const selectedImage       = ref(null);
    const nuevoProducto       = ref({
                                      titulo: '',
                                      id_imagen: 27, //Imagen de Producto por defecto. DMO: Cambiar a hacer la busqueda por Default=TRUE
                                      url:    '',
                                      precio: '',
                                    });

    const handleImageSelect = (image) => {
      selectedImage.value           = image;
      nuevoProducto.value.id_imagen = image.id;
      nuevoProducto.value.url       = image.url;
      console.log('[Selector_Image]: ', nuevoProducto.value, 'New Image: ', image, '[SelectedImage]', selectedImage);
    };

    const fetchProductos = async () => {
      if (master_id) {
        await productosStore.fetchProductos(master_id);
      }
    };

    onMounted(fetchProductos);

    // Nuew Product
    const agregarNuevoProducto = async () => {
      
      if (nuevoProducto.value.titulo && nuevoProducto.value.precio) {
        const nuevoProductoCreado = await productosStore.createProduct(nuevoProducto.value, master_id);
        if (nuevoProductoCreado) {
          //Add new url to product
          if (!nuevoProductoCreado.images) {
              nuevoProductoCreado.images = {};
          }
          nuevoProductoCreado.images.url = nuevoProducto.value.url;
          productos.value.push(nuevoProductoCreado);
          console.log('[Productos]productos: ', productos);
        }
        //Clean vars
        nuevoProducto.value = { titulo: '', id_imagen: 27, url: '', precio: '' };
        selectedImage.value = null;
        showFormularioNuevo.value = false;
      } else {
        alert('Tiene que rellenar al menos el título y el Precio');
      }
    };

    const eliminarProducto = async (producto) => {
      console.log('EliminarProducto: ', producto)
      if (!confirm(`¿Estás seguro de que deseas eliminar "${producto.titulo}" de tu Catalogo?`)) {
        return;
      }
      try {
        const eliminado = await productosStore.deleteProducto(producto.id, master_id);

        if (eliminado) {
          productos.value = productos.value.filter(p => p.id !== producto.id);
        }
      } catch (error) {
        console.error('Hubo un error al eliminar el producto:', error);
      }

    };

    const formatCurrency = (value) => {
      if (value) {
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
        }).format(value);
      }
      return '';
    };

    return {
      // images,
      selectedImage,
      handleImageSelect,
      showImageSelector,
      productos,
      showFormularioNuevo,
      nuevoProducto,
      agregarNuevoProducto,
      eliminarProducto,
      formatCurrency
    };
  },
};
</script>

<style scoped>
.productos-container {
  padding: 1rem;
  /* wood texture */
  background: url('https://i.imgur.com/lr2JTF6.jpeg') no-repeat center center;
  background-size: cover;
  min-height: 85vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.pedido-section {
  max-width: 100%;
  margin: auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-gap: 1rem;
  gap: 1rem;
  padding: 1rem;
}

.pedido-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: contents;
}

.pedido-item-catalog {
  background: rgb(255 255 255 / 60%);
  border-bottom: 1px solid #838383;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  justify-content: space-between;
  transition: background-color 0.2s ease-in-out;
  border-radius: 4px;
  padding: 0 1rem 0 0;
}

.pedido-item-catalog:last-child {
  border-bottom: none;
}

.pedido-item-catalog:hover {
  background-color: #f8f8f8;
}

.pedido-item-catalog .product-title {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.pedido-item-catalog .green {
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0.55rem 0 0 1.5rem;
}

.pedido-item-catalog .button-red {
  padding: 0.5rem 1rem !important;
}

.add-product-button-container {
  margin-bottom: 1rem;
}

.product-image-container {
  width: 90px;
  height: 90px;
  flex-shrink: 0;
  margin-right: 0.5rem;
  padding: 0.1rem;
}

.product-image {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  object-fit: cover;
}

.pedido-info {
  height: 90% !important;
  padding: 0 !important;
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

.image-input span{
  color: #746e6e;
}

.thumbnail {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}
/* MEDIA RESPONSIVE */
@media (max-width: 768px) {
  .pedido-item-catalog .product-title {
    font-size: 0.8rem;
  }

  .pedido-item-catalog .green {
    font-size: 1rem;
  }
}
</style>