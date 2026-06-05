<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'; 

const nombre = ref("");
const correo = ref("");
const password = ref("");
const router = useRouter(); 

// Controladores visuales de Vuetify
const cargando = ref(false);
const mostrarPassword = ref(false);

const guardarToken = async () =>  {
  cargando.value = true;
  try {
    await axios.post("http://localhost:3000/usuarios", {
      nombre: nombre.value,
      correo: correo.value,
      password: password.value
    });

    // Te redirige exitosamente a la pantalla de login
    router.push({ name: 'inicioSesion'}); 

  } catch (error) {
    console.error("Error al registrar usuario", error);
    alert("No se pudo crear la cuenta. Intenta de nuevo.");
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <!-- Contenedor centrado en pantalla completa con fondo gris claro -->
  <v-container fluid class="fill-height bg-grey-lighten-4 d-flex align-center justify-center">
    <v-dialog>
      
    
    <v-card width="100%" max-width="450" class="pa-6" rounded="xl" elevation="12">
      
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
      <v-form @submit.prevent="guardarToken">
        
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

      <v-divider class="my-4" />

      <!-- Enlace para regresar al Login si ya tiene cuenta -->
      <div class="text-center">
        <router-link 
          :to="{ name: 'inicioSesion' }" 
          class="text-decoration-none text-primary font-weight-medium text-body-2"
        >
          ¿Ya tienes una cuenta? Inicia sesión aquí
        </router-link>
      </div>

    </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
/* Vuetify maneja todo el diseño responsivo de forma nativa */
</style>
