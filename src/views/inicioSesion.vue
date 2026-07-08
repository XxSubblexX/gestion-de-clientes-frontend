<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'; 

const correo = ref("");
const password = ref("");
const token = ref("");
const info = ref("");
const rol = ref(null);
const router = useRouter(); 

const snackbar = ref(false)
const snackbarTexto = ref("")
const snackbarColor = ref("success")

const manejarNotificacion = (alerta) => {
  snackbarTexto.value = alerta.texto
  snackbarColor.value = alerta.color
  snackbar.value = true
}

// Controladores visuales de Vuetify
const cargando = ref(false);
const mostrarPassword = ref(false);

const guardarToken = async () =>  {
  cargando.value = true;
  try {
    const respuesta = await axios.post("http://localhost:3000/login", {
      correo: correo.value,
      password: password.value
    });

    info.value = respuesta.data.payload;
    token.value = respuesta.data.token;
    
    localStorage.setItem('token', respuesta.data.token);
    localStorage.setItem('info', JSON.stringify(respuesta.data.payload));


    rol.value = info.value.rol

    if (rol.value === 1) {
      router.push({ name: 'usuariosCRUD'}); 
    }
    else if (rol.value === 2) {
      router.push({ name: 'clientesCRUD'});
    }
    else {
      alert("usted no tiene un rol definido.")
    }

  } catch (error) {
    console.error("Error al iniciar sesión", error);
    manejarNotificacion({ texto:"Credenciales incorrectas", color: "error" })
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <!-- Contenedor centrado en pantalla completa con utilidades de Vuetify -->
  <v-container fluid class="fill-height bg-grey-lighten-4 d-flex align-center justify-center">
    
    <v-card width="100%" max-width="450" class="pa-6" rounded="xl" elevation="12">
      
      <!-- Encabezado / Título -->
      <v-card-item class="text-center mb-4">
        <v-avatar color="primary" size="56" class="mb-2">
          <v-icon size="28" color="white">mdi-lock-outline</v-icon>
        </v-avatar>
        <v-card-title class="text-h5 font-weight-bold">
          Iniciar Sesión
        </v-card-title>
        <v-card-subtitle>
          Ingresa tus credenciales para continuar
        </v-card-subtitle>
      </v-card-item>

      <!-- Formulario -->
      <v-form @submit.prevent="guardarToken">
        
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

        <!-- Campo Contraseña con opción de ocultar/mostrar ojo -->
        <v-text-field
          v-model="password"
          label="Contraseña"
          :type="mostrarPassword ? 'text' : 'password'"
          variant="outlined"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="mostrarPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="mostrarPassword = !mostrarPassword"
          class="mb-4"
          required
        />

        <!-- Botón de Envío Animado y con estado de carga -->
        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          rounded="lg"
          class="text-weight-bold mb-4"
          :loading="cargando"
        >
          Ingresar
        </v-btn>
      </v-form>
      <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      rounded="lg"
      elevation="10"
    >
      {{ snackbarTexto }}
      
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar = false"
          icon="mdi-close"
        />
      </template>
    </v-snackbar>

    </v-card>
  </v-container>
</template>