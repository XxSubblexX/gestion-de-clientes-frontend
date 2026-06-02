<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

import FormularioClienteModal from '/src/components/FormularioClienteModal.vue';
import ActualizarClienteModal from '/src/components/actualizarClienteModal.vue';
import userSettings from '@/components/userSettings.vue';
import BotonEliminar from '/src/components/borrarCliente.vue'

const id_usuario = ref(null)
const nombre = ref('')
const clientes = ref([])
const router = useRouter()

const cabeceras = ref([
  { title: 'NIT', key: 'nit' },
  { title: 'Razón Social', key: 'razon_social' },
  { title: 'Correo', key: 'correo' },
  { title: 'Teléfono', key: 'telefono' },
  { title: 'Estado', key: 'estado', value: item => item.estado ? 'Activo' : 'Inactivo' },
  { title: 'Acciones', key: 'acciones', sortable: false }
])



const mostrarModalNuevo = ref(false)
const mostrarAjustesDeUsuario = ref(false)
const mostrarModalActualizar = ref(false)
const clienteAEditar = ref(null)

// NUEVO
const abrirModalNuevo = () => {
  mostrarModalNuevo.value = true
}


// EDITAR
const abrirModalEditar = (cliente) => {
  clienteAEditar.value = cliente
  mostrarModalActualizar.value = true
}

const nombreActualizado = (nuevoNombre) => {
  // Aquí recibes el texto del hijo y actualizas tu estado/localStorage
  nombre.value = nuevoNombre
}

// CARGAR CLIENTES
const cargarClientes = async () => {
  try {
    const token = localStorage.getItem("token")

    const respuesta = await axios.get(`http://localhost:3000/clientes`, {
      headers: { token: `Bearer ${token}` }
    })

    clientes.value = respuesta.data
  } catch (error) {
    console.error("Error al cargar clientes:", error)

    if (error.response?.status === 401) {
      router.push({ name: 'inicioSesion' })
    }
  }
}

// ACTUALIZAR LISTA
const actualizarClienteEnLaLista = (cliente_actualizado) => {
  const index = clientes.value.findIndex(
    c => c.id_cliente === cliente_actualizado.id_cliente
  )

  if (index !== -1) {
    clientes.value[index] = {
      ...clientes.value[index],
      ...cliente_actualizado
    }
  }
}

// ELIMINAR LISTA
const removerClienteDeLaLista = (id) => {
  clientes.value = clientes.value.filter(
    c => c.id_cliente !== id
  )
}

// SESIÓN
onMounted(async () => {
  try {
    const info = JSON.parse(localStorage.getItem("info"))

    if (info) {
      id_usuario.value = info.id
      nombre.value = info.nombre
    }
    
  } catch (e) {
    console.error(e)
  }

  await cargarClientes()
})
</script>

<template>
  <v-container class="d-flex flex-column">

    <!-- HEADER -->
    <v-row class="mb-4">
      <v-col cols="12" sm="8">
        <h2 class="text-h5 font-weight-bold">
          Gestión de Clientes
          <div class="">
          <span class="text-subtitle-1 text-medium-emphasis">
            (Usuario:<userSettings
              :nombre="nombre"
              @actualizarNombre="nombreActualizado"
              @cerrar="mostrarAjustesDeUsuario = false"
              />

)
          </span>
        </div>
        </h2>
      </v-col>

      <v-col cols="12" sm="4" class="d-flex justify-end">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="abrirModalNuevo">
          Registrar Cliente
        </v-btn>
      </v-col>
    </v-row>

    <!-- TABLE -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table
            :items="clientes"
            :headers="cabeceras"
            item-value="id_cliente"
            items-per-page="-1"
            fixed-header
            hide-default-footer
          >
            <template #item.acciones="{ item }">
              <ActualizarClienteModal
                :cliente="item"
                @clienteActualizado="actualizarClienteEnLaLista"
                @eliminado="removerClienteDeLaLista"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- ✅ MODAL CREAR (v-model) -->
    <FormularioClienteModal
      v-model="mostrarModalNuevo"
      :idUsuario="id_usuario"
      @clienteGuardado="cargarClientes"
    />

    <!-- MODAL ACTUALIZAR -->
    

   

  </v-container>
</template>

<style scoped>
:deep(.v-data-table-header__content) {
  justify-content: center !important;
}

:deep(td) {
  text-align: center !important;
}
</style>