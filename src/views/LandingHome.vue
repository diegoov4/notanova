<script setup>
import { onMounted, toRef } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { useCommonStore } from '@/store/commonStore'
import { useComandaStore } from '@/store/comandaStore'

const authStore = useAuthStore()
const commonStore = useCommonStore()
const comandaStore = useComandaStore()
const userMasterData = toRef(authStore, 'userMasterData')
const checkDialog = toRef(commonStore, 'showNewComandaDialog')
const comandas = toRef(comandaStore, 'comandas')
const router = useRouter()

const closeDialog = () => {
  commonStore.setShowNewComandaDialog(false)
}

const fetchComandas = async () => {
  await comandaStore.fetchComandas(userMasterData.value.id_master)
  console.info('[FETCH] Comandas toRef: ', comandas.value)
}

onMounted(fetchComandas)

const formatCurrency = value => {
  if (value) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }
  return ''
}

const selectComanda = comandaId => {
  router.push({ name: 'ComandaDetail', params: { id: comandaId } })
}
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col v-for="comanda in comandas" :key="comanda.id" cols="12" sm="6" md="4" lg="4">
        <v-card class="pa-16 card-bg-image" hover @click="selectComanda(comanda.id)">
          <v-card-title
            class="pt-8 pb-10 text-h4 text-center font-weight-bold text-capitalize text-blue-grey-darken-3"
          >
            {{ comanda.clientes.nombre || 'Cliente Desconocido' }}
          </v-card-title>
          <v-card-text class="text-h5 text-center text-grey-darken-3">
            Total:
            <span class="text-h4 font-weight-bold text-secondary">
              {{ formatCurrency(comanda?.total) || '0 €' }}
            </span>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <!-- Dialogo para nueva comanda -->
  <NewComandaDialog v-model="checkDialog" @close="closeDialog" @comanda-saved="fetchComandas" />
</template>
