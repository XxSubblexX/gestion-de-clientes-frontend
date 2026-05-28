<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// 1. Declaramos las propiedades esenciales para la actualización
const props = defineProps({
  idUsuario: {
    type: Number,
    required: true
  },
  // Recibe obligatoriamente el objeto del cliente que se va a editar
  cliente: {
    type: Object,
    required: true
  }
})

// Definimos los eventos necesarios para interactuar con el padre (clientesCRUD)
const emit = defineEmits(['cerrar', 'clienteActualizado'])

// 2. Variables reactivas vinculadas directamente a los inputs del formulario
const nit = ref('')
const razonSocial = ref('')
const correo = ref('')
const telefono = ref('')
const estado = ref(true)

// 3. Al montar el modal, inyectamos siempre los datos del cliente seleccionado
onMounted(() => {
  nit.value = props.cliente.nit
  razonSocial.value = props.cliente.razon_social
  correo.value = props.cliente.correo
  telefono.value = props.cliente.telefono
  estado.value = props.cliente.estado
})

// 4. Función dedicada exclusivamente a enviar la actualización (PUT) a la API
const guardarCambios = async () => {
  try {
    const token = localStorage.getItem("token")
    
    const datosFormulario = {
      nit: nit.value,
      razon_social: razonSocial.value,
      correo: correo.value,
      telefono: telefono.value,
      estado: estado.value,
      id_usuario: props.idUsuario
    }

    // Petición de actualización (PUT) incluyendo el ID del cliente en la URL
    await axios.put(`http://localhost:3000/clientes/${props.cliente.id_cliente}`, datosFormulario, {
      headers: { 'token': `Bearer ${token}` }
    })

    // Construimos el objeto con los datos modificados y su ID correspondiente
    const clienteModificado = {
      id_cliente: props.cliente.id_cliente,
      ...datosFormulario
    }
    
    alert("¡Cliente actualizado con éxito!")
    emit('clienteActualizado', clienteModificado) // Envía los datos actualizados para el filtro del padre
    emit('cerrar')                                // Cierra la ventana emergente
  } catch (error) {
    console.error("Error al actualizar el cliente:", error)
    alert("Ocurrió un error en el servidor. Inténtalo de nuevo.")
  }
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-contenedor">
      <h3>Actualizar Cliente</h3>
      
      <form @submit.prevent="guardarCambios">
        <div class="campo">
          <label>NIT</label>
          <input type="text" v-model="nit" required />
        </div>

        <div class="campo">
          <label>Razón Social</label>
          <input type="text" v-model="razonSocial" required />
        </div>

        <div class="campo">
          <label>Correo</label>
          <input type="email" v-model="correo" required />
        </div>

        <div class="campo">
          <label>Teléfono</label>
          <input type="text" v-model="telefono" required />
        </div>

        <div class="campo-checkbox">
          <label>
            <input type="checkbox" v-model="estado" />
            Cliente Activo
          </label>
        </div>

        <div class="modal-botones">
          <button type="button" class="btn-cancelar" @click="$emit('cerrar')">Cancelar</button>
          <button type="submit" class="btn-guardar">Guardar Cambios</button>
        </div>
      </form>
    </div>
  </div>
</template>
