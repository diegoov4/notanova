<template>
    <div class="dialog-overlay" @click.self="close">
        <div class="dialog">
            <div class="filter-container">
                <select v-model="selectedType" class="type-filter">
                    <option value="">Todos los tipos</option>
                    <option v-for="tp in ProductTypes" :key="tp.id" :value="tp.id">
                        {{ tp.categoria }} > {{ tp.subcategoria }}
                    </option>
                </select>
            </div>
            <ul class="products-picker image-list">
                <li class="product-item" v-for="image in filteredImages" :key="image.id" @click="selectImage(image)">
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
  
<script>

import { ref, computed, onMounted, toRef } from 'vue';
import { useProductoStore } from '@/store/productoStore';


export default {
    setup(_, { emit }) {
        const productosStore = useProductoStore();
        const images         = toRef(productosStore, "images");
        const ProductTypes   = toRef(productosStore, "product_types");
        const selectedType   = ref('');

        const selectImage = (image) => {
            emit('select', image);
            close();
        }

        const fetchImages = async () => {
            await productosStore.fetchProductTypes();
            await productosStore.fetchImages();
            console.log('[fetchTypes] ', ProductTypes, '[fetchImages] ',images);
        };

        onMounted(fetchImages);

        const close = () => emit('close');

        // Computed filter for image types
        const filteredImages = computed(() => {
            let filterImg = images.value;
            if (selectedType.value) {
                filterImg = images.value.filter(image => image.product_types && image.product_types.id === selectedType.value);
            }
            return filterImg;
        });

        return {
            images,
            filteredImages,
            selectedType,
            ProductTypes,
            selectImage,
            close
        };
    }
};
</script>

  
  
<style scoped>
.image-list .product-item {
    border-bottom: 1px solid #d3d3d3;
}

.filter-container {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.type-filter {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 1rem;
  color: #333;
  cursor: pointer;
}

.type-filter:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.type-filter option {
  padding: 0.5rem;
  background: #fff;
  color: #333;
}

.filter-container:hover .type-filter {
  border-color: #4CAF50;
}

/* Media query para ajustar el tamaño en dispositivos más pequeños si es necesario */
@media (max-width: 768px) {
  .type-filter {
    width: 100%;
  }
}

</style>
  