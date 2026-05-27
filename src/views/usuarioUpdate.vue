<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'; 

const id_usuario = ref(null);
const nombre = ref("");
const correo = ref("");
const password = ref(""); 
const router = useRouter(); 

onMounted(async () => {
    try {
        const info = JSON.parse(localStorage.getItem("info"));
        const token = localStorage.getItem("token");

        // Si el localStorage está vacío, evitamos que el código explote
        if (!info || !token) {
            console.warn("No se encontró información de sesión.");
            return;
        }

        const id_token = info.id;
        const nombre_token = info.nombre;
        
        if (id_token) id_usuario.value = id_token;
        if (nombre_token) nombre.value = nombre_token;

        // CORRECCIÓN: Se cerró correctamente la llave del objeto de configuración de Axios
        const respuesta = await axios.get(`http://localhost:3000/usuarios/${id_usuario.value}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });      

        if (respuesta.data && respuesta.data.correo) {
            correo.value = respuesta.data.correo;
        }

        console.log("Datos cargados:", respuesta);
    } catch (error) {
        console.error("Error al cargar la información inicial:", error);
    }
});

const actualizarDatos = async () =>  {
  try {
    const token = localStorage.getItem("token");
    
    const datosActualizados = {
      nombre: nombre.value,
      correo: correo.value
    };

    if (password.value && password.value.trim() !== "") {
      datosActualizados.password = password.value;
    }

    // AÑADIDO: Enviamos el token también en el PUT para que el backend te deje guardar
    await axios.put(`http://localhost:3000/usuarios/${id_usuario.value}`, datosActualizados, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    alert("¡Datos actualizados con éxito!");
    window.location.reload();

  } catch (error) {
    console.error("Error al actualizar el usuario", error);
    alert("No se pudieron guardar los cambios. Intenta de nuevo.");
  }
}
</script>


<template>
<div>
  <h2>Modificar Cuenta</h2>
  
  <form @submit.prevent="actualizarDatos">
    <div>
      <label>Nombre</label>
      <input type="email" v-model="nombre" required />
    </div>

    <div>
      <label>Correo</label>
      <input type="text" v-model="correo" required />
    </div>

    <div>
      <label>Contraseña (Opcional)</label>
      <!-- Sin 'required' para que no obligue a cambiarla siempre -->
      <input type="password" v-model="password" placeholder="Dejar en blanco para mantener actual" />
    </div>

    <button type="submit">Guardar Cambios</button>
  </form>
</div>
</template>

<style scoped>
/* Mismo estilo de tu registro */
</style>
