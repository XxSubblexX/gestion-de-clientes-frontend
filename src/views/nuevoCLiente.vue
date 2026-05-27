<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const id_usuario = ref(null)
const nombre = ref('')

// El formulario agrupado solo con los datos de interacción del usuario
const formulario = ref({
  nit: '',
  razon_social: '',
  correo: '',
  telefono: '',
  estado: true
})

onMounted(async () => {
  try {
    const info = JSON.parse(localStorage.getItem("info"))
    
    if (info) {
        const id_token = info.id
        const nombre_token = info.nombre
        
        if (id_token) {
            id_usuario.value = id_token;
        }

        if (nombre_token) {
            nombre.value = nombre_token;
        }
    }
  } catch (error) {
    console.error("Error al cargar los datos de sesión:", error)
  }
})

// Función de inserción separando el formulario del ID de usuario extraído
const guardarCliente = async () => {
  try {
    const token = localStorage.getItem("token")
    
    const datosDelFormulario = formulario.value
    const usuarioId = id_usuario.value

    const respuesta = await axios.post(`http://localhost:3000/clientes`, {
      ...datosDelFormulario,
      id_usuario: usuarioId
    }, {
      headers: {
        'token': `Bearer ${token}`
      }
    });

    console.log(respuesta)
    alert('Cliente registrado con éxito')
    
    // Reseteo del formulario manteniendo el estado en true
    formulario.value = {
      nit: '',
      razon_social: '',
      correo: '',
      telefono: '',
      estado: true
    }

  } catch (error) {
    console.error("Error al insertar el cliente:", error)
    alert('No se pudo registrar el cliente')
  }
}
</script>

<template>
  <div>
    <header>
      <h2>Registrar Cliente (Usuario: {{ nombre }})</h2>
    </header>

    <main>
      <form @submit.prevent="guardarCliente">
        
        <!-- NIT -->
        <div>
          <label>NIT</label>
          <input 
            v-model="formulario.nit" 
            type="text" 
            required 
            placeholder="Ej: 123456789-1"
          />
        </div>

        <!-- Razón Social -->
        <div>
          <label>Razón Social</label>
          <input 
            v-model="formulario.razon_social" 
            type="text" 
            required 
            placeholder="Nombre de la empresa"
          />
        </div>

        <!-- Correo -->
        <div>
          <label>Correo Electrónico</label>
          <input 
            v-model="formulario.correo" 
            type="email" 
            required 
            placeholder="correo@empresa.com"
          />
        </div>

        <!-- Teléfono -->
        <div>
          <label>Teléfono</label>
          <input 
            v-model="formulario.telefono" 
            type="text" 
            required 
            placeholder="Ej: 600 000 000"
          />
        </div>

        <!-- Estado (Checkbox Booleano) -->
        <div>
          <input 
            v-model="formulario.estado" 
            id="estado" 
            type="checkbox" 
          />
          <label for="estado">Cliente Activo</label>
        </div>

        <!-- Botón de Envío -->
        <div>
          <button type="submit">Guardar Cliente</button>
        </div>

      </form>
    </main>
  </div>
</template>