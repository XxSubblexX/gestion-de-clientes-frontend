<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'; 

const nombre = ref("");
const correo = ref("");
const password = ref("");
const router = useRouter(); 

const guardarToken = async () =>  {
  try {
    await axios.post("http://localhost:3000/usuarios", {
      nombre: nombre.value,
      correo: correo.value,
      password: password.value
    });

    // Te redirige exitosamente a la pantalla de login que está en tu main.js
    router.push({ name: 'inicioSesion'}); 

  } catch (error) {
    console.error("Error al registrar usuario", error);
    alert("No se pudo crear la cuenta. Intenta de nuevo.");
  }
}
</script>

<template>
<div>
  <h2>Registrarse</h2>
  
  <form @submit.prevent="guardarToken">
    <div>
      <label>Nombre</label>
      <input type="text" v-model="nombre" required />
    </div>

    <div>
      <label>Correo</label>
      <!-- Cambiado a type="email" para validación nativa -->
      <input type="email" v-model="correo" required />
    </div>

    <div>
      <label>Contraseña</label>
      <input type="password" v-model="password" required />
    </div>

    <button type="submit">Registrarse</button>
  </form>
</div>
</template>

<style scoped>
</style>
