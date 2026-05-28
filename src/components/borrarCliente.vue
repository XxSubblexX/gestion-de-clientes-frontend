<script setup>
import axios from 'axios'

// Recibe los datos necesarios del cliente actual desde la fila de la tabla
const props = defineProps({
  idCliente: {
    type: Number,
    required: true
  },
  razonSocial: {
    type: String,
    required: true
  }
})

// Evento para avisar al componente padre (clientesCRUD) que el cliente fue borrado
const emit = defineEmits(['eliminadoExitosamente'])

const ejecutarEliminacion = async () => {
  const confirmar = confirm(`¿Estás seguro de que deseas eliminar al cliente "${props.razonSocial}"?`)
  if (!confirmar) return 

  try {
    const token = localStorage.getItem("token")
    
    // Petición DELETE a tu backend
    await axios.delete(`http://localhost:3000/clientes/${props.idCliente}`, {
      headers: {
        'token': `Bearer ${token}`
      }
    })

    alert("Cliente eliminado con éxito.")
    
    // Emitimos el evento hacia el padre enviando el ID del cliente borrado
    emit('eliminadoExitosamente', props.idCliente)
  } catch (error) {
    console.error("Error al eliminar el cliente:", error)
    alert("No se pudo eliminar el cliente. Inténtalo de nuevo.")
  }
}
</script>

<template>
  <button 
    type="button" 
    title="Eliminar" 
    @click="ejecutarEliminacion" 
    class="btn-eliminar"
  >
    🗑️
  </button>
</template>

<style scoped>
.btn-eliminar {
  cursor: pointer;
  background: none;
  border: none;
  font-size: 16px;
  padding: 4px 8px;
  transition: transform 0.1s ease;
}
.btn-eliminar:hover {
  transform: scale(1.15);
}
</style>
