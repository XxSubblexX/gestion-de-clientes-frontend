<template>
  <v-container class="py-6">

    <v-card class="mb-6 bg-gradient pa-4" rounded="xl" elevation="3">
      <v-row align="center">
        <v-col cols="12" sm="8" class="d-flex align-center">
          <v-avatar color="primary-lighten-4" size="48" class="mr-4">
            <v-icon color="primary" size="28">mdi-account-group</v-icon>
          </v-avatar>
          <div>
            <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-1">
              Gestión de Usuarios
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
            <FormularioUsuarioModal @usuarioGuardado="actualizarFila" />
        </v-col>
      </v-row>
    </v-card>

    <!-- BOTÓN DE NAVEGACIÓN MODIFICADO -->
    <v-btn 
      to="/productos" 
      text="Ir a productos" 
      prepend-icon="mdi-package-variant-closed"
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
          Lista de Usuarios Registrados ({{ usuarios.length }})
        </div>
        <!-- Cambia tu v-text-field por este: -->
          <v-text-field
            autocomplete="off-search"
            v-model="busqueda"
            prepend-inner-icon="mdi-magnify"
            label="Buscar usuario..."
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
        :items="usuarios"
        :headers="cabeceras"
        :search="busqueda"
        item-value="id_usuario"
        items-per-page="10"
        hover
        class="elevation-0 text-grey-darken-2"
        no-data-text="No se encontraron usuarios registrados"
        items-per-page-text="Usuarios por página:"
        page-text="{0}-{1} de {2}"
      >
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

        <!-- Acciones del Usuario -->
        <template #item.acciones="{ item }">
          <div class="d-flex justify-center align-center">
            <ActualizarUsuarioModal
              :usuario="item"
              @usuarioActualizado="actualizarUsuarioEnLaLista"
            />
            
            <BorrarUsuarioModal
              :usuario="item"
              @eliminado="removerUsuarioDeLaLista" 
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

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

import FormularioUsuarioModal from '/src/components/registrarCuenta.vue';
import ActualizarUsuarioModal from '/src/components/actualizarUsuarioModal.vue';
import BorrarUsuarioModal from '/src/components/eliminarUsuarioModal.vue';
import userSettings from '@/components/userSettings.vue';

const id_usuario = ref(null)
const nombre = ref('')
const usuarios = ref([])
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
    { title: 'Nombre', key: 'nombre', align: 'center', sortable: true },
    { title: 'Correo', key: 'correo', align: 'start', sortable: true },
    { title: 'Rol', key: 'id_rol', align: 'start' },
    { title: 'Estado', key: 'estado', align: 'center' } 
])

const mostrarAjustesDeUsuario = ref(false)

const nombreActualizado = (nuevoNombre) => {
  nombre.value = nuevoNombre
}

const actualizarFila = (esInformacionQueMeLlego) => {
  usuarios.value.unshift(esInformacionQueMeLlego)
  manejarNotificacion({ texto: "Usuario registrado correctamente", color: "success" })
}

const cargarUsuarios = async () => {
  try {
    const respuesta = await axios.get(`http://localhost:3000/usuarios`, {
      headers: { token: `Bearer ${localStorage.getItem("token")}` }
    })
    usuarios.value = respuesta.data
  } catch (error) {
    console.error("Error al cargar usuarios:", error)
    if (error.response?.status === 401) {
      router.push({ name: 'inicioSesion' })
    }
  }
}

const actualizarUsuarioEnLaLista = (usuario_actualizado) => {
  const index = usuarios.value.findIndex(
    u => u.id_usuario === usuario_actualizado.id_usuario
  )
  
  if (index !== -1) {
    usuarios.value.splice(index, 1, usuario_actualizado)
    manejarNotificacion({ texto: "Usuario actualizado correctamente", color: "info" })
  }
}

const removerUsuarioDeLaLista = (id) => {
  usuarios.value = usuarios.value.filter(
    c => c.id_usuario !== id
  )
  manejarNotificacion({ texto: "Usuario eliminado correctamente", color: "error" })
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
  await cargarUsuarios()
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