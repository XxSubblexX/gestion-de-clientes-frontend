<script setup>
import { ref } from 'vue';
import axios from 'axios';

const nombre = ref("");
const correo = ref("");
const rol = ref(null);
const roles = ref([]);

const modelValue = ref(false);
const cargando = ref(false);
const formRef = ref(null); // Referencia para controlar las validaciones

const emit = defineEmits(['usuarioGuardado'])

// Reglas de validación y seguridad
const reglas = {
  nombre: [
    v => !!v || 'El nombre completo es obligatorio',
    v => (v && v.trim().length >= 3) || 'Debe tener al menos 3 caracteres',
    v => !/[<>;"'=$%]/.test(v) || 'No se permiten caracteres especiales peligrosos'
  ],
  correo: [
    v => !!v || 'El correo electrónico es obligatorio',
    v => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || 'El formato de correo no es válido'
  ],
  rol: [
    v => !!v || 'Seleccionar un rol es obligatorio'
  ]
}

const abrirModalNuevo = async () => {
  if (formRef.value) {
    formRef.value.resetValidation(); // Limpia alertas previas si existen
  }

  try {
    const respuesta = await axios.get("http://localhost:3000/roles")
    roles.value = respuesta.data
    modelValue.value = true
  } catch (error) {
    console.error("Error al cargar roles", error);
    alert("No se pudieron cargar los roles del sistema. Intenta de nuevo.");
  }
}

const cerrar = () => {
  modelValue.value = false
  limpiarFormulario()
}

const limpiarFormulario = () => {
  nombre.value = ""
  correo.value = ""
  rol.value = null
}

const guardarUsuario = async () =>  {
  if (!formRef.value) return

  // Validar visualmente el formulario antes de mandar la petición HTTP
  const { valid } = await formRef.value.validate()
  if (!valid) return

  cargando.value = true;
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.')
      return
    }

    // Limpieza de datos (Seguridad del lado del cliente)
    const datos = {
      nombre: nombre.value.trim(),
      correo: correo.value.trim().toLowerCase(),
      id_rol: rol.value,
      estado: true // Corregido: Enviado como valor directo en lugar de un ref() interno
    }
    
    await axios.post("http://localhost:3000/usuarios", datos, {
      headers: { token: `Bearer ${token}` }
    });
    
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
    <!-- Se unificaron los contenedores de tarjeta y se removieron estilos conflictivos -->
    <v-card class="pa-6 mx-auto" rounded="xl" elevation="12" width="100%" max-width="500">
      
      <div class="d-flex justify-end">
        <v-btn 
          icon="mdi-close" 
          variant="text" 
          size="small"
          :disabled="cargando"
          @click="cerrar" 
        />
      </div>

      <!-- Encabezado / Título -->
      <v-card-item class="text-center mb-4 pt-0">
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

      <!-- FORM: Se añade la referencia 'formRef' -->
      <v-form ref="formRef" @submit.prevent="guardarUsuario">
        
        <!-- Campo Nombre -->
        <v-text-field
          v-model="nombre"
          label="Nombre Completo"
          type="text"
          variant="outlined"
          prepend-inner-icon="mdi-account-outline"
          class="mb-3"
          :rules="reglas.nombre"
          hide-details="auto"
          maxlength="100"
        />

        <!-- Campo Correo -->
        <v-text-field
          v-model="correo"
          label="Correo Electrónico"
          type="email"
          variant="outlined"
          prepend-inner-icon="mdi-email-outline"
          class="mb-3"
          :rules="reglas.correo"
          hide-details="auto"
          maxlength="100"
        />

        <!-- Campo Rol -->
        <v-select
          :items="roles"
          item-title="id_nombre"
          item-value="id_rol"
          v-model="rol"
          label="Rol"
          variant="outlined"
          prepend-inner-icon="mdi-account"
          class="mb-5"
          :rules="reglas.rol"
          hide-details="auto"
        />

        <!-- Botón de Envío Estilizado -->
        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          rounded="lg"
          class="text-weight-bold mb-2 text-capitalize"
          :loading="cargando"
        >
          Registrarse
        </v-btn>
      </v-form>

    </v-card>
  </v-dialog>
</template>

<style scoped>
/* Estilos responsivos nativos de Vuetify */
</style>