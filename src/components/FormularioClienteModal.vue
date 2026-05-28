<template>
  <div class="modal-overlay">
    <div class="modal-contenido">
      <header>
        <h2>Registrar Cliente</h2>
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
            <!-- Cambiado de RouterLink a un botón normal que emite el cierre -->
            <button type="button" class="btn-cancelar" @click="$emit('cerrar')">Cancelar</button>
            <button type="submit">Guardar Cliente</button>
          </div>
        </form>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const props = defineProps({
  idUsuario: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['cerrar', 'clienteGuardado'])

const formulario = ref({
  nit: '',
  razon_social: '',
  correo: '',
  telefono: '',
  estado: true
})

const guardarCliente = async () => {
  try {
    const token = localStorage.getItem("token")
    const datosDelFormulario = formulario.value
    const id_usuario = props.idUsuario

    const respuesta = await axios.post(`http://localhost:3000/clientes`, {
      ...datosDelFormulario,
      id_usuario: id_usuario
    }, {
      headers: {
        'token': `Bearer ${token}`
      }
    });

    console.log(respuesta)
    alert('Cliente registrado con éxito')
    
    formulario.value = {
      nit: '',
      razon_social: '',
      correo: '',
      telefono: '',
      estado: true
    }

    emit('clienteGuardado') // Avisa a la tabla que debe recargar los datos
    emit('cerrar')          // Cierra la pantalla emergente
  } catch (error) {
    console.error("Error al insertar el cliente:", error)
    alert('No se pudo registrar el cliente')
  }
}
</script>
