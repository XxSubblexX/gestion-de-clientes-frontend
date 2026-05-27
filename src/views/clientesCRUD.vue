<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const id_usuario = ref(null)
const nombre = ref('')
const clientes = ref([])

onMounted(async () => {
  try {
    const info = JSON.parse(localStorage.getItem("info"))
    const token = localStorage.getItem("token")

    const id_token = info.id
    const nombre_token = info.nombre
    
    if (id_token) {
        id_usuario.value = id_token;
    }

    if (nombre_token) {
        nombre.value = nombre_token;
    }

    const respuesta = await axios.get(`http://localhost:3000/clientes`, {
      headers: {
        'token': `Bearer ${token}` 
      }
    });      
    
    console.log(respuesta)
    clientes.value = respuesta.data 

  } catch (error) {
    console.error("Error al cargar los datos del cliente:", error)
  }
})
</script>

<template>
  <div>
    <header>
      <h2>Gestión de Clientes (Usuario: {{ nombre }})</h2>
      <RouterLink :to="{ name: 'nuevoCliente' }">
        <button type="button">+ Registrar Cliente</button>
      </RouterLink>
    </header>

    <main>
      <table border="1">
         
        <thead>
          <tr>
            
            <th>NIT</th>
            <th>Razón Social</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>ID Usuario</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in clientes" :key="cliente.id_cliente">
            <td>{{ cliente.nit }}</td>
            <td>{{ cliente.razon_social }}</td>
            <td>{{ cliente.correo }}</td>
            <td>{{ cliente.telefono }}</td>
            <td>
              {{ cliente.estado ? 'Activo' : 'Inactivo' }}
            </td>
            <td>
              <button type="button" title="Editar">✏️</button>
              <button type="button" title="Eliminar">🗑️</button>
            </td>
          </tr>

          <tr v-if="clientes.length === 0">
            <td colspan="9" align="center">
              No tienes clientes registrados todavía.
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  </div>
</template>