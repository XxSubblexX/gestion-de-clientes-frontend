<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

import FormularioClienteModal from '/src/components/FormularioClienteModal.vue'
import ActualizarClienteModal from '/src/components/actualizarClienteModal.vue'
import BotonEliminar from '/src/components/borrarCliente.vue'

const id_usuario = ref(null)
const nombre = ref('')
const clientes = ref([])
const router = useRouter()

const mostrarModalNuevo = ref(false)
const mostrarModalActualizar = ref(false)
const clienteAEditar = ref(null)

const abrirModalNuevo = () => {
  mostrarModalNuevo.value = true
}

const abrirModalEditar = (cliente) => {
  clienteAEditar.value = cliente
  mostrarModalActualizar.value = true
}

const cargarClientes = async () => {
  try {
    const token = localStorage.getItem("token")

    const respuesta = await axios.get(`http://localhost:3000/clientes`, {
      headers: {
        token: `Bearer ${token}`
      }
    })

    clientes.value = respuesta.data
  } catch (error) {
    console.error("Error al cargar los datos del cliente:", error)

    if (error.status === 401 || error.response?.status === 401) {
      router.push({ name: 'inicioSesion' })
    }
  }
}

const actualizarClienteEnLaLista = (cliente_actualizado) => {
  const indice = clientes.value.findIndex(
    c => c.id_cliente === cliente_actualizado.id_cliente
  )

  if (indice !== -1) {
    clientes.value[indice] = {
      ...clientes.value[indice],
      ...cliente_actualizado
    }
  }
}

const removerClienteDeLaLista = (id_cliente_borrado) => {
  clientes.value = clientes.value.filter(
    cliente => cliente.id_cliente !== id_cliente_borrado
  )
}

onMounted(async () => {
  try {
    const info = JSON.parse(localStorage.getItem("info"))

    if (info) {
      const id_token = info.id
      const nombre_token = info.nombre

      if (id_token) id_usuario.value = id_token
      if (nombre_token) nombre.value = nombre_token
    }
  } catch (error) {
    console.error("Error al cargar los datos de sesión:", error)
  }

  await cargarClientes()
})
</script>

<template>
  <div>
    <header>
      <h2>
        Gestión de Clientes (Usuario:
        <RouterLink
          style="cursor: pointer;"
          :to="{ name: 'usuarioUpdate' }"
        >
          {{ nombre }}
        </RouterLink>
        )
      </h2>

      <button type="button" @click="abrirModalNuevo">
        + Registrar Cliente
      </button>
    </header>

    <main>
      <table border="1">
        <thead>
          <tr>
            <th>NIT</th>
            <th>Razón Social</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="cliente in clientes"
            :key="cliente.id_cliente"
          >
            <td>{{ cliente.nit }}</td>
            <td>{{ cliente.razon_social }}</td>
            <td>{{ cliente.correo }}</td>
            <td>{{ cliente.telefono }}</td>
            <td>{{ cliente.estado ? 'Activo' : 'Inactivo' }}</td>

            <td>
              <button
                type="button"
                title="Editar"
                @click="abrirModalEditar(cliente)"
                style="cursor: pointer; margin-right: 5px;"
              >
                ✏️
              </button>

              <BotonEliminar
                :idCliente="cliente.id_cliente"
                :razonSocial="cliente.razon_social"
                @eliminadoExitosamente="removerClienteDeLaLista"
              />
            </td>
          </tr>

          <tr v-if="clientes.length === 0">
            <td colspan="6" align="center">
              No tienes clientes registrados todavía.
            </td>
          </tr>
        </tbody>
      </table>
    </main>

    <FormularioClienteModal
      v-if="mostrarModalNuevo"
      :idUsuario="id_usuario"
      @cerrar="mostrarModalNuevo = false"
      @clienteGuardado="cargarClientes"
    />

    <ActualizarClienteModal
      v-if="mostrarModalActualizar"
      :key="clienteAEditar?.id_cliente"
      :cliente="clienteAEditar"
      :idUsuario="id_usuario"
      @cerrar="mostrarModalActualizar = false"
      @clienteActualizado="actualizarClienteEnLaLista"
    />
  </div>
</template>