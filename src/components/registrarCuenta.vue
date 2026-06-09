  <script setup>
  import { ref } from 'vue';
  import axios from 'axios';

  const nombre = ref("");
  const correo = ref("");
  const rol = ref(null);
  const roles = ref([]);

  const modelValue = ref(false);

  const cargando = ref(false);
  const emit = defineEmits(['usuarioGuardado'])
  const abrirModalNuevo = async () => {

    const respuesta = await axios.get("http://localhost:3000/roles")
    roles.value = respuesta.data
    modelValue.value = true
  }
const cerrar = () => {
  modelValue.value = false
}
  const guardarUsuario = async () =>  {
    cargando.value = true;
    try {
      const estado = ref(true);

      const datos = {
        nombre: nombre.value,
        correo: correo.value,
        id_rol: rol.value,
        estado: estado.value
      }
      
      await axios.post("http://localhost:3000/usuarios", datos);
      
      emit('usuarioGuardado', datos)
      cerrar()
    } catch (error) {
      console.error("Error al registrar usuario", error);
      alert("No se pudo crear la cuenta. Intenta de nuevo.");
    } finally {
      cargando.value = false;
    }
  }
  </script>

  <template>
    <v-btn 
              color="primary" 
              prepend-icon="mdi-plus" 
              size="large"
              rounded="lg"
              elevation="2"
              @click="abrirModalNuevo"
            >
              Registrar Usuario
            </v-btn>
    <v-dialog v-model="modelValue" max-width="600" persistent>
        
      
      <v-card width="100%" max-width="450" class="pa-6" rounded="xl" elevation="12">
          <div class="d-flex justify-end">
              <v-btn 
                icon="mdi-close" 
                variant="text" 
                size="small"
                @click="modelValue = false" 
              />
          </div>
        <!-- Encabezado / Título -->
        <v-card-item class="text-center mb-4">
          
          
          <v-avatar color="primary" size="56" class="mb-2">
            <v-icon size="28" color="white">mdi-account-plus-outline</v-icon>
          </v-avatar>
          <v-card-title class="text-h5 font-weight-bold">
            Crear Cuenta
          </v-card-title>
          <v-card-subtitle>
            Regístrate para empezar a gestionar tus clientes
          </v-card-subtitle>
        </v-card-item>

        <!-- Formulario -->
        <v-form @submit.prevent="guardarUsuario">
          
          <!-- Campo Nombre -->
          <v-text-field
            v-model="nombre"
            label="Nombre Completo"
            type="text"
            variant="outlined"
            prepend-inner-icon="mdi-account-outline"
            class="mb-2"
            required
          />

          <!-- Campo Correo -->
          <v-text-field
            v-model="correo"
            label="Correo Electrónico"
            type="email"
            variant="outlined"
            prepend-inner-icon="mdi-email-outline"
            class="mb-2"
            required
          />

          <!-- Campo Contraseña con opción de ocultar/mostrar -->
          <v-select
            :items="roles"
            item-title="id_nombre"
            item-value="id_rol"
            v-model="rol"
            label="Rol"
            variant="outlined"
            prepend-inner-icon="mdi-account"
            class="mb-4"
            required
          />

          <!-- Botón de Envío Estilizado -->
          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            rounded="lg"
            class="text-weight-bold mb-4"
            :loading="cargando"
          >
            Registrarse
          </v-btn>
        </v-form>

      </v-card>
    </v-dialog>
  </template>

  <style scoped>
  /* Vuetify maneja todo el diseño responsivo de forma nativa */
  </style>
