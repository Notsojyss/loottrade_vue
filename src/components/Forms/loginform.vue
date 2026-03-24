
<script>
    import { useAuthStore } from "@/stores/authStore.js";
    import { useToast } from "vue-toastification";
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
          const toast = useToast();

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

            this.authStore.login(data.user, data.token);
            await this.authStore.fetchMoney();

            // ✅ SUCCESS TOAST
            toast.success(data.message || "Login successful!", {
              timeout: 2000
            });

            this.$router.push('/landingpage');

          } catch (error) {
            console.error('Login failed:', error);

            // ❌ ERROR TOAST
            toast.error(error.message || "Something went wrong", {
              timeout: 3000
            });
          }
        },
}
};
</script>

<template>
  <div v-if="!authStore.user" class="mx-auto bg-gray-900 px-4 py-6 text-white flex items-center justify-center">
    <div class="w-full max-w-md sm:max-w-lg">

      <!-- Title -->
      <h1 class="mb-8 text-center text-3xl font-bold sm:text-4xl">
        SIGN IN
      </h1>

      <!-- Card -->
      <div class="rounded-2xl border border-gray-700 bg-gray-800 p-5 shadow-lg sm:p-6">

        <!-- Logo -->
        <div class="mb-6 flex justify-center">
          <img
              alt="LootTrade Logo"
              class="h-20 w-auto sm:h-24"
              src="../../assets/LTlogo.png"
          />
        </div>

        <!-- Inputs -->
        <div class="flex flex-col gap-4">
          <input
              v-model="logindata.username"
              placeholder="Username"
              class="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
          />

          <input
              v-model="logindata.password"
              placeholder="Password"
              type="password"
              class="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
          />

          <button
              @click="loginUser"
              class="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Login
          </button>
        </div>

        <!-- Footer -->
        <p class="mt-6 text-center text-sm text-gray-300">
          Don't have an account?
          <router-link
              class="ml-1 text-blue-400 hover:text-blue-300 underline"
              to="/registrationform"
          >
            Register
          </router-link>
        </p>

      </div>
    </div>
  </div>
</template>


