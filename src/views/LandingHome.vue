<template>
    <section class="home">
        <h1 class="title">Comandas Activas</h1>
        <div class="comandas-list">
            <div v-for="comanda in comandas" :key="comanda.id" class="comanda-item" @click="selectComanda(comanda.id)">
                <div class="comanda-content">
                    <h2>{{ comanda.nombre_cliente || 'Cliente Desconocido' }}</h2>
                    <p>Total: {{ formatCurrency(comanda.total) }}</p>
                </div>
                <!-- La imagen de la hoja se establece como fondo del item de comanda -->
            </div>
        </div>
    </section>
</template>
  
  
<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/services/supabase';

export default {
    name: 'LandingHome',
    setup() {
        const comandas = ref([]);
        const router = useRouter();

        onMounted(async () => {
            const { data, error } = await supabase
                .from('comandas')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error al obtener comandas:', error);
                return;
            }

            comandas.value = data;
        });

        const formatCurrency = (value) => {
            if (value) {
                return new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                }).format(value);
            }
            return '';
        };

        const selectComanda = (comandaId) => {
            router.push({ name: 'ComandaDetail', params: { id: comandaId } });
        };

        return { comandas, selectComanda, formatCurrency };
    },
    filters: {
        currency(value) {
            // Un filtro simple para formatear el total como moneda
            return new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR',
            }).format(value);
        },
    },
};
</script>
  
<style scoped>
.home {
    padding: 1rem;
}

.title {
    margin-bottom: 2rem;
}

.comandas-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.comanda-item {
  background-image: url('@/assets/hoja-comanda.png');
  background-size: cover; /* O utiliza contain para ver toda la hoja */
  background-repeat: no-repeat;
  background-position: center;
  padding: 2rem; /* Ajusta el espaciado para que el contenido no se superponga con los bordes de la imagen */
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  width: 200px; /* O el tamaño que prefieras para las notas */
  height: 250px; /* O el tamaño que prefieras para las notas */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.comanda-content {
  background-color: rgba(255, 255, 255, 0.8); /* Fondo semitransparente para el texto */
  padding: 1rem;
  border-radius: 4px;
}

.comanda-item:hover {
  transform: scale(1.05);
}

.comanda-item:active {
  transform: scale(1.1);
}
</style>  