<template>
    <section class="home">
        <h1 class="titulo-comandas">Comandas Activas</h1>
        <div class="comandas-list">
            <div v-for="comanda in comandas" :key="comanda.id" class="comanda-item" @click="selectComanda(comanda.id)">
                <div class="comanda-content">
                    <h2>{{ comanda.clientes.nombre_cliente || 'Cliente Desconocido' }}</h2>
                    <p>Total: 
                        <span class="comanda-total-price">{{ formatCurrency(comanda?.total) || '0 €' }}</span>    
                    </p>
                </div>
            </div>
        </div>
    </section>
    <!-- Dialogo para nueva comanda -->
    <NewComandaDialog v-show="checkDialog" @close="closeDialog" @comanda-saved="fetchComandas" />
</template>
  
<script>
import { onMounted, toRef } from 'vue';
import { useRouter } from 'vue-router';
import { useCommonStore } from '@/store/commonStore';
import { useComandaStore } from '@/store/comandaStore';
import NewComandaDialog from '@/components/NewComandaDialog.vue';

export default {
    name: 'LandingHome',
    components: {
        NewComandaDialog,
    },
    setup() {
        const commonStore = useCommonStore();
        const comandaStore = useComandaStore();
        const checkDialog = toRef(commonStore,"showNewComandaDialog");
        const comandas = toRef(comandaStore,"comandas");
        const router = useRouter();

        const closeDialog = () => {
            commonStore.setShowNewComandaDialog(false);
        };

        const fetchComandas = async () => {
            if (commonStore.getUserLocal && commonStore.getUserLocal.length > 0) {
                await comandaStore.fetchComandas(commonStore.getUserLocal[0].id);
            }
        };

        onMounted(fetchComandas);

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

        return { checkDialog, closeDialog, comandas, selectComanda, formatCurrency, fetchComandas, showNewComandaDialog: false, };
    },
};
</script>