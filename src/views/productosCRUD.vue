<template>
  <v-container class="py-6">

    <v-card class="mb-6 bg-gradient pa-4" rounded="xl" elevation="3">
      <v-row align="center">
        <v-col cols="12" sm="8" class="d-flex align-center">
          <v-avatar color="primary-lighten-4" size="48" class="mr-4">
            <!-- Corregido: Ícono de caja/paquete para productos -->
            <v-icon color="primary" size="28">mdi-package-variant-closed</v-icon>
          </v-avatar>
          <div>
            <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-1">
              Gestión de Productos
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
            <FormularioProductoModal @productoGuardado="actualizarFila" />
          </v-col>
        </v-row>
      </v-card>

    <!-- BOTÓN PARA NAVEGAR A LA GESTIÓN DE USUARIOS -->
    <v-btn 
      to="/usuarios" 
      text="Ir a usuarios" 
      prepend-icon="mdi-account-group"
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
          Lista de Productos Registrados ({{ productos.length }})
        </div>
        
          <v-text-field
            autocomplete="off-search"
            v-model="busqueda"
            prepend-inner-icon="mdi-magnify"
            label="Buscar producto..."
            variant="solo"
            density="compact"
            max-width="300"
            hide-details
            rounded="lg"
            flat
            bg-color="white"
            @click.stop
            @keydown.stop
          />

      </v-card-title>

      <!-- DATA TABLE -->
      <v-data-table
        :items="productos"
        :headers="cabeceras"
        :search="busqueda"
        item-value="id_producto"
        items-per-page="10"
        hover
        class="elevation-0 text-grey-darken-2"
        no-data-text="No se encontraron productos registrados"
      >
        <!-- Miniatura de la Imagen con Esquinas Suaves -->
        <template #item.fotografia_principal_url="{ item }">
          <v-avatar size="45" rounded="lg" class="bg-grey-lighten-3 my-1 elevation-1">
            <v-img
              :src="item.fotografia_principal_url"
              cover
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-icon color="grey-lighten-1">mdi-image-outline</v-icon>
                </div>
              </template>
            </v-img>
          </v-avatar>
        </template>

        <!-- Estilo Personalizado para el Estado -->
        <template #item.estado="{ item }">
          <v-chip
            :color="item.estado ? 'success' : 'error'"
            :text="item.estado ? 'Activo' : 'Inactivo'"
            size="small"
            variant="flat"
            class="font-weight-medium px-3"
          />
        </template>

        <!-- Acciones del Producto -->
        <template #item.acciones="{ item }">
          <div class="d-flex justify-center align-center">
            <ActualizarProductoModal
              :producto="item"
              @productoActualizado="actualizarProductoEnLaLista"
            />
            
            <BorrarProductoModal
              :producto="item"
              @eliminado="removerProductoDeLaLista" 
              @notificar="manejarNotificacion"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- 🚨 SNACKBAR GLOBAL -->
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

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

import FormularioProductoModal from '/src/components/registrarProductoModal.vue';
import ActualizarProductoModal from '/src/components/actualizarProductoModal.vue';
import BorrarProductoModal from '/src/components/eliminarProductoModal.vue';
import userSettings from '@/components/userSettings.vue';

const id_usuario = ref(null)
const nombre = ref('')
const productos = ref([])
const router = useRouter()
const busqueda = ref('') 

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
    { title: 'Foto', key: 'fotografia_principal_url', align: 'center', sortable: false },
    { title: 'Nombre', key: 'nombre', align: 'start', sortable: true },
    { title: 'Descripción', key: 'descripcion', align: 'start', sortable: true },
    { title: 'Características', key: 'caracteristicas', align: 'start', sortable: true },
    { title: 'Precio', key: 'precio_venta', align: 'end', sortable: true },
    { title: 'Estado', key: 'estado', align: 'center' } 
])

const mostrarAjustesDeUsuario = ref(false)

const nombreActualizado = (nuevoNombre) => {
  nombre.value = nuevoNombre
}

const actualizarFila = (esInformacionQueMeLlego) => {
  productos.value.unshift(esInformacionQueMeLlego)
  manejarNotificacion({ texto: "Producto registrado correctamente", color: "success" })
}

const cargarProductos = async () => {
  try {
    const respuesta = await axios.get(`http://localhost:3000/productos`)
    productos.value = respuesta.data
  } catch (error) {
    console.error("Error al cargar productos:", error)
    if (error.response?.status === 401) {
      router.push({ name: 'inicioSesion' })
    }
  }
}

const actualizarProductoEnLaLista = (producto_actualizado) => {
  const producto_nuevo = producto_actualizado
  const index = productos.value.findIndex(
    u => u.id_producto === producto_nuevo.id_producto
  )
                                                                                                                                                                                                                                                                                                                                                                                                                                                    
  if (index !== -1) {
    productos.value.splice(index, 1, producto_nuevo)
    manejarNotificacion({ texto: "Producto actualizado correctamente", color: "info" })
  }
}

const removerProductoDeLaLista = (id) => {
  productos.value = productos.value.filter(
    p => p.id_producto !== id
  )
  manejarNotificacion({ texto: "Producto eliminado correctamente", color: "error" })
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
  await cargarProductos()
})
</script>

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