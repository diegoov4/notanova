<script setup>
import { onMounted, computed, toRef, ref } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useComandaStore } from '@/store/comandaStore'
import { format } from 'date-fns'

const authStore = useAuthStore()
const comandaStore = useComandaStore()
const userMasterData = toRef(authStore, 'userMasterData')
const comandas = toRef(comandaStore, 'comandas')
const search = ref('')
// date pickers
const startDate = ref(null)
const endDate = ref(null)

// Report HEADERS
const headers = ref([
  { text: 'Cliente', align: 'start', sortable: false, value: 'clientes.nombre' },
  { text: 'Fecha creación', value: 'created_at' },
  { text: 'Fecha cierre', value: 'closed_at' },
  //   { text: 'Estado', value: 'status' }, //DMO: Feature: quitar status y poner en un color u otro el 'closed_at' según status
  { text: 'Creado por', value: 'created_by' },
  { text: 'Total (€)', value: 'total' },
])

// Get all Comandas (without status)
onMounted(async () => {
  await comandaStore.fetchComandas(userMasterData.value.id_master)
  console.info('[COMANDAS] ', comandas)
})

const formatDate = (dateString, hours) => {
  if (dateString) {
    const date = new Date(dateString)
    return hours ? format(date, 'dd/MM/yyyy HH:mm:ss') : format(date, 'dd/MM/yyyy')
  }
  return ''
}
const formattedStartDate = computed(() => {
  return startDate.value ? formatDate(startDate.value, false) : ''
})

const formattedEndDate = computed(() => {
  return endDate.value ? formatDate(endDate.value, false) : ''
})

const resetFilters = () => {
  search.value = ''
  startDate.value = null
  endDate.value = null
}

// Currency format (€)
const formatCurrency = value => {
  if (value) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }
  return ''
}

// Filter by 'Search' and Date Range
const filteredComandas = computed(() => {
  if (!comandas.value || !Array.isArray(comandas.value)) {
    return []
  }

  // 1 - Filter by Search
  const filteredBySearch = comandas.value.filter(comanda => {
    return (
      comanda.clientes.nombre.toLowerCase().includes(search.value.toLowerCase()) ||
      comanda.status.toLowerCase().includes(search.value.toLowerCase()) ||
      comanda.created_by.toLowerCase().includes(search.value.toLowerCase())
      // ... more search fields ...
    )
  })

  // 2 - Filter by created_at Range
  return filterByDate(filteredBySearch, startDate.value, endDate.value)
})

// Filter by Date: created_at
const filterByDate = (comandas, start, end) => {
  return comandas.filter(comanda => {
    const createdAt = new Date(comanda.created_at).getTime()
    const afterStart = start ? createdAt >= new Date(start).getTime() : true
    const beforeEnd = end ? createdAt <= new Date(end).getTime() : true
    return afterStart && beforeEnd
  })
}
</script>

<template>
  <v-container>
    <v-card class="pa-4 mb-4 rounded-lg">
      <!-- Header -->
      <v-card-title class="d-flex justify-space-between align-center mb-5">
        <span class="text-h4 text-primary font-weight-bold text-capitalize d-none d-sm-flex">
          Reporte Economico
        </span>
        <span class="text-button text-primary font-weight-bold text-uppercase d-sm-none">
          Reporte Economico
        </span>
      </v-card-title>

      <v-divider color="primary" :thickness="3"></v-divider>

      <!-- Filters: Search -->
      <v-text-field v-model="search" label="Buscar" solo>
        <template #prepend-inner>
          <i-ph-magnifying-glass-bold />
        </template>
      </v-text-field>

      <!-- Filters: Date Range created_at -->
      <v-row>
        <v-col cols="12" md="6">
          <v-menu transition="scale-transition" offset-y>
            <template #activator="{ props }">
              <v-text-field
                v-model="formattedStartDate"
                label="Comandas desde"
                readonly
                v-bind="props"
              >
                <template #prepend-inner>
                  <i-ph-calendar-duotone />
                </template>
              </v-text-field>
            </template>
            <v-date-picker v-model="startDate" color="primary"></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" md="6">
          <v-menu transition="scale-transition" offset-y>
            <template #activator="{ props }">
              <v-text-field
                v-model="formattedEndDate"
                label="Comandas hasta"
                readonly
                v-bind="props"
              >
                <template #prepend-inner>
                  <i-ph-calendar-duotone />
                </template>
              </v-text-field>
            </template>
            <v-date-picker v-model="endDate" color="primary"></v-date-picker>
          </v-menu>
        </v-col>
      </v-row>

      <!-- Data Table -->
      <v-data-table :headers="headers" :items="filteredComandas" item-key="id">
        <template #header="{ props }">
          <thead>
            <tr>
              <!-- new cell for 'clean' button -->
              <th>
                <v-btn
                  v-if="search.value || startDate.value || endDate.value"
                  small
                  text
                  @click="resetFilters"
                >
                  Limpiar filtros
                </v-btn>
              </th>
              <!-- ... rest headers -->
              <th v-for="header in props.headers" :key="header.text">
                {{ header.text }}
              </th>
            </tr>
          </thead>
        </template>
        <template #[`item.clientes.nombre`]="{ item }">
          <span class="text-h6 text-blue-grey-darken-3 text-capitalize">
            {{ item.clientes.nombre }}
          </span>
        </template>
        <template #[`item.created_at`]="{ item }">
          <span class="text-subtitle-2 text-blue-grey-lighten-1">
            {{ formatDate(item.created_at, true) }}
          </span>
        </template>
        <template #[`item.closed_at`]="{ item }">
          <span v-if="item.closed_at" class="text-subtitle-2 text-red-accent-4">
            {{ formatDate(item.closed_at, true) }}
          </span>
          <span v-else class="text-subtitle-2 text-primary font-italic">- activa -</span>
        </template>
        <template #[`item.total`]="{ item }">
          <span class="text-subtitle-2 text-secondary font-weight-bold">
            {{ formatCurrency(item.total) }}
          </span>
        </template>
        <!-- ... more slots ... -->
      </v-data-table>
    </v-card>
  </v-container>
</template>
