<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

import FormularioClienteModal from '/src/components/FormularioClienteModal.vue';
import ActualizarClienteModal from '/src/components/actualizarClienteModal.vue';
import BorrarClienteModal from '/src/components/eliminarClienteModal.vue';
import userSettings from '@/components/userSettings.vue';

const id_usuario = ref(null)
const nombre = ref('')
const clientes = ref([])
const router = useRouter()
const busqueda = ref('') 

// =====================
// 🔥 ESTADOS PARA ALERTAS (SNACKBAR)
// =====================
const snackbar = ref(false)
const snackbarTexto = ref("")
const snackbarColor = ref("success")

const manejarNotificacion = (alerta) => {
  snackbarTexto.value = alerta.texto
  snackbarColor.value = alerta.color
  snackbar.value = true
}

const cabeceras = ref([
  { title: 'Acciones', key: 'acciones', align: 'center', sortable: false },
  { title: 'NIT', key: 'nit', align: 'center', sortable: true },
  { title: 'Razón Social', key: 'razon_social', align: 'start', sortable: true },
  { title: 'Correo', key: 'correo', align: 'start' },
  { title: 'Teléfono', key: 'telefono', align: 'center' }
])

const mostrarAjustesDeUsuario = ref(false)

const nombreActualizado = (nuevoNombre) => {
  nombre.value = nuevoNombre
}

const actualizarFila = (esInformacionQueMeLlego) => {
  clientes.value.unshift(esInformacionQueMeLlego)
  // Alerta opcional al crear cliente
  manejarNotificacion({ texto: "Cliente registrado correctamente", color: "success" })
}

const cargarClientes = async () => {
  try {
    const respuesta = await axios.get(`http://localhost:3000/clientes/${id_usuario.value}`, {
      headers: { token: `Bearer ${localStorage.getItem("token")}` }
    })
    clientes.value = respuesta.data
  } catch (error) {
    console.error("Error al cargar clientes:", error)
    if (error.response?.status === 401) {
      router.push({ name: 'inicioSesion' })
    }
  }
}

const actualizarClienteEnLaLista = (cliente_actualizado) => {
  const index = clientes.value.findIndex(
    c => c.id_cliente === cliente_actualizado.id_cliente
  )
  
  if (index !== -1) {
    clientes.value[index] = cliente_actualizado
    manejarNotificacion({ texto: "Cliente actualizado correctamente", color: "info" })
  }
}

const removerClienteDeLaLista = (id) => {
  clientes.value = clientes.value.filter(
    c => c.id_cliente !== id
  )
  manejarNotificacion({ texto: "Cliente eliminado correctamente", color: "error" })
}

onMounted(async () => {
  try {
    const info = JSON.parse(localStorage.getItem("info"))
    if (info) {
      id_usuario.value = info.id
    }
    const respuesta = await axios.get(`http://localhost:3000/usuarios/${id_usuario.value}`, {
      headers: { token: `Bearer ${localStorage.getItem("token")}` }
    })
    nombre.value = respuesta.data.nombre
  } catch (error) {

    if (error.response?.status === 401) {
      router.push({ name: 'inicioSesion'}); 
  }
  }
  await cargarClientes()
})
</script>

<template>
  <v-container class="py-6">

    <v-card class="mb-6 bg-gradient pa-4" rounded="xl" elevation="3">
      <v-row align="center">
        <v-col cols="12" sm="8" class="d-flex align-center">
          <v-avatar color="primary-lighten-4" size="48" class="mr-4">
            <v-icon color="primary" size="28">mdi-domain</v-icon>
          </v-avatar>
          <div>
            <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-1">
              Gestión de Clientes
            </h2>
            <div class="d-flex align-center text-subtitle-2 text-medium-emphasis">
              <v-icon size="16" class="mr-1" color="grey">mdi-account-circle-outline</v-icon>
              <span class="mr-1">Usuario:</span>
                <!-- Escuchamos @notificar también aquí si userSettings usa snackbars -->
                <userSettings
                  :nombre="nombre"
                  @actualizarNombre="nombreActualizado"
                  @cerrar="mostrarAjustesDeUsuario = false"
                  @notificar="manejarNotificacion"
              />
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="4" class="d-flex justify-sm-end justify-start">
            <FormularioClienteModal @clienteGuardado="actualizarFila" />
        </v-col>
      </v-row>
    </v-card>
 <v-btn 
      to="/compras" 
      text="Ir a compras" 
      prepend-icon="mdi-cart"
      variant="tonal"
      color="secondary"
      class="mb-6 text-capitalize font-weight-bold"
      rounded="lg"
    />
    <!-- TABLE CARD WITH ACTIONS & SEARCH -->
    <v-card class="overflow-hidden" rounded="xl" elevation="4">
      
      <!-- Tabla Cabecera con Buscador -->
      <v-card-title class="pa-4 bg-grey-lighten-4 d-flex flex-sm-row flex-column align-sm-center justify-space-between gap-4">
        <div class="text-subtitle-1 font-weight-bold text-grey-darken-2">
          Lista de Clientes Registrados ({{ clientes.length }})
        </div>
        <v-text-field
          v-model="busqueda"
          prepend-inner-icon="mdi-magnify"
          label="Buscar cliente..."
          variant="solo"
          density="compact"
          max-width="300"
          hide-details
          rounded="lg"
          flat
          bg-color="white"
        />
      </v-card-title>

      <!-- DATA TABLE -->
      <v-data-table
        :items="clientes"
        :headers="cabeceras"
        :search="busqueda"
        item-value="id_cliente"
        items-per-page="10"
        hover
        class="elevation-0 text-grey-darken-2"
        no-data-text="No se encontraron clientes registrados"
        items-per-page-text="Clientes por página:"
        page-text="{0}-{1} de {2}"
      >

        <!-- Acciones del Cliente -->
        <template #item.acciones="{ item }">
          <div class="d-flex justify-center align-center">
            <ActualizarClienteModal
              :cliente="item"
              @clienteActualizado="actualizarClienteEnLaLista"
            />
            
            <!-- CAPTURAMOS EL EVENTO @notificar DEL HIJO -->
            <BorrarClienteModal
              :cliente="item"
              @eliminado="removerClienteDeLaLista" 
              @notificar="manejarNotificacion"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- 🚨 SNACKBAR GLOBAL (Permanente en la vista del Padre) -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      rounded="lg"
      elevation="10"
    >
      {{ snackbarTexto }}
      
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar = false"
          icon="mdi-close"
        />
      </template>
    </v-snackbar>

  </v-container>
</template>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #f4f6fa 100%);
}
.gap-4 {
  gap: 16px;
}
:deep(.v-data-table__tr:hover) {
  background: #f8fafc !important;
}
:deep(.v-data-table-header__content) {
  font-weight: 700 !important;
  color: #475569 !important;
}
</style>
