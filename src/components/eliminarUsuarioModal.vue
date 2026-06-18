<template>
  <!-- Botón principal que abre el diálogo -->
  <v-btn
    icon="mdi-trash-can-outline"
    variant="text"
    color="error"
    title="Eliminar"
    class="btn-animado"
    @click="cargarDialog"
  />

  <!-- Diálogo de Confirmación de Eliminación -->
  <v-dialog v-model="modelValue" max-width="450" persistent>
    <v-card class="pa-4" rounded="xl" elevation="10">
      <v-card-item class="pb-2">
        <div class="d-flex align-center gap-3">
          <v-avatar color="error-lighten-5" size="40">
            <v-icon color="error" size="24">mdi-alert-circle-outline</v-icon>
          </v-avatar>
          <div>
            <v-card-title class="text-h6 font-weight-bold text-grey-darken-3 pa-0">
              ¿Confirmar eliminación?
            </v-card-title>
          </div>
        </div>
      </v-card-item>

      <v-card-text class="text-body-1 text-grey-darken-2 py-4">
        Estás a punto de eliminar al usuario 
        <strong class="text-grey-darken-4">"{{ props.usuario?.nombre }}"</strong>. 
        Esta acción no se puede deshacer.
      </v-card-text>

      <v-card-actions class="justify-end gap-2 px-4 pb-2">
        <v-btn
          variant="tonal"
          color="grey-darken-1"
          rounded="lg"
          class="px-4"
          :disabled="cargando"
          @click="cerrar"
        >
          Cancelar
        </v-btn>
        
        <v-btn
          variant="flat"
          color="error"
          rounded="lg"
          class="px-4"
          :loading="cargando"
          @click="ejecutarEliminacion"
        >
          Sí, eliminar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps(['usuario'])
const emit = defineEmits(['eliminado', 'notificar']) // Agregamos 'notificar'

const modelValue = ref(false)
const cargando = ref(false)

const cargarDialog = () => {
  modelValue.value = true
}

const cerrar = () => {
  modelValue.value = false
}

const ejecutarEliminacion = async () => {
  try {
    cargando.value = true
    console.log(props.usuario)
    await axios.delete(
  `http://localhost:3000/usuarios/${props.usuario.id_usuario}`,
  {
    headers: {
      token: `Bearer ${localStorage.getItem("token")}`
    }
  }
)

    // Mandamos el mensaje de éxito al padre antes de cerrar
    emit('eliminado', props.usuario.id_usuario)
    
    cerrar()
  } catch (error) {
    if (error.response?.status === 401) {
      router.push({ name: 'inicioSesion'}); 
  }
    // Mandamos el mensaje de error al padre para evitar usar alert()
    emit('notificar', { texto: "No se pudo eliminar el usuario. Inténtalo de nuevo.", color: "error" })
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.gap-3 { gap: 12px; }
.gap-2 { gap: 8px; }
.bg-error-lighten-5 { background-color: #ffebee !important; }
</style>
