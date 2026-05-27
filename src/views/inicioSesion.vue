<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'; 

const correo = ref("");
const password = ref("");
const token = ref("");
const info = ref("");
const router = useRouter(); 

const guardarToken = async () =>  {
  try {
    const respuesta = await axios.post("http://localhost:3000/login", {
      correo: correo.value,
      password: password.value
    });

    info.value = respuesta.data.payload;
    token.value = respuesta.data.token;
    
    localStorage.setItem('token', respuesta.data.token);
    localStorage.setItem('info', JSON.stringify(respuesta.data.payload));
    router.push({ name: 'clientesCRUD'}); 

  } catch (error) {
    console.error("Error al iniciar sesión", error);
    alert("Credenciales incorrectas");
  }
}
</script>
<template>
  <div class="login-container"> <!-- Un solo contenedor padre para todo -->
    <h2>Iniciar Sesión</h2>
    
    <form @submit.prevent="guardarToken">
      <div>
        <label>Correo</label>
        <input type="email" v-model="correo" required />
      </div>

      <div>
        <label>Contraseña</label>
        <input type="password" v-model="password" required />
      </div>

      <button type="submit">Ingresar</button>
    </form>

    <!-- Corregido el <<RouterLink que rompía la vista -->
    <div class="registro-enlace">
      <RouterLink :to="{ name: 'registrarCuenta' }">¿No tienes cuenta? Regístrate aquí</RouterLink>
    </div>
  </div>
</template>

<style scoped>
</style>
