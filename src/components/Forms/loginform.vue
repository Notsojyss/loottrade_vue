
<script>
    import { useAuthStore } from "@/stores/authStore.js";
    import { computed, onMounted } from "vue";
export default {
        name: "loginform",
        setup() {
        const authStore = useAuthStore();


    return { authStore };
},
    data() {
      return {
            logindata: {
            username: '',
            password: ''
        }
    };
},
    methods: {
        /**
         * Uses the login Api
         * @returns {Promise<void>}
         */
        async loginUser() {
            try {
            const response = await fetch(import.meta.env.VITE_API_URL + "/api/user/login", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.logindata)
});

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
}

    const data = await response.json();
    console.log("Login successful:");
    this.authStore.login(data.user, data.token);
    await this.authStore.fetchMoney();

    alert(data.message);
    this.$router.push('/landingpage');
} catch (error) {
    console.error('Login failed:', error);
    alert(error.message);
}
},
}
};
</script>

<template>
  <div v-if="!authStore.user" class="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
    <div
        class="forms w-full max-w-md sm:max-w-lg md:max-w-xl rounded-2xl bg-gradient-to-br from-black to-gray-500 p-6 sm:p-8 md:p-10 text-center shadow-xl"
    >
      <img
          alt="Vue logo"
          class="logo mx-auto mb-4 w-40 sm:w-52 md:w-64 h-auto"
          src="../../assets/LTlogo.png"
      />

      <h1 class="mb-6 text-2xl sm:text-3xl font-bold text-white">Sign In</h1>

      <div class="flex flex-col gap-4">
        <input
            v-model="logindata.username"
            placeholder="Username"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm sm:text-base outline-none focus:border-blue-500"
        />

        <input
            v-model="logindata.password"
            placeholder="Password"
            type="password"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm sm:text-base outline-none focus:border-blue-500"
        />

        <button
            @click="loginUser"
            class="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm sm:text-base font-semibold text-white hover:bg-blue-700 transition"
        >
          Login
        </button>
      </div>

      <p class="login-link mt-5 text-sm sm:text-base text-white">
        Don't have an account?
        <router-link class="registertxt ml-1 text-blue-300 hover:text-blue-400 underline" to="/registrationform">
          Register
        </router-link>
      </p>
    </div>
  </div>
</template>


