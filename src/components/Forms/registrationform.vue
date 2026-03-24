<script>
import axios from 'axios';
export default {
    data() {
        return {
            form:{
                username: '',
                password: '',
                confirmPassword: '',
                first_name: '',
                last_name: '',
                email: '',
                confirmEmail: ''
            }

        };
    },
    methods: {
        /**
         * registering user
         * @returns {Promise<void>}
         */
        async registerUser() {
            if (this.form.password !== this.form.confirmPassword) {
                alert("Passwords do not match!");
                return;
            }
            if (this.form.password.length && this.form.confirmPassword.length < 8) {
                alert("Password is too short, Minimum Length is 8");
                return;
            }
            if (/\d/.test(this.form.first_name) || /\d/.test(this.form.last_name)) {
                alert("Names Cannot contain number");
                return;
            }

            if (this.form.email !== this.form.confirmEmail) {
                alert("Emails do not match!");
                return;
            }
            const userData = {
                first_name: this.form.first_name,
                last_name: this.form.last_name,
                email: this.form.email,
                username: this.form.username,
                password: this.form.password
            };
            try {
                // Send request using Axios
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/create`, userData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Handle successful response
                alert('User registered successfully!');
                console.log(response.data);

                // Redirect to login page after successful registration
                this.$router.push('/loginform');
            } catch (error) {
                // Handle error response
                if (error.response) {
                    // If there’s a validation error from backend, show those errors
                    const errors = error.response.data.errors;
                    let errorMessage = "Registration failed:\n";
                    for (const field in errors) {
                        errorMessage += `${field}: ${errors[field].join(', ')}\n`;
                    }
                    alert(errorMessage);
                } else {
                    console.error('Registration failed:', error);
                    alert('Failed to register user. Please try again later.');
                }
            }
        }
    }
};
</script>

<template>
  <div class="mx-auto bg-gray-900 px-4 py-6 text-white">
    <div class="mx-auto flex max-w-3xl items-center justify-center">
      <div class="w-full rounded-2xl border border-gray-700 bg-gray-800 p-5 shadow-lg sm:p-6 md:p-8">
        <!-- Header -->
        <div class="mb-6 text-center">
          <div class="mb-4 flex justify-center">
            <img
                alt="LootTrade Logo"
                class="h-20 w-auto sm:h-24"
                src="../../assets/LTlogo.png"
            />
          </div>
          <h1 class="text-3xl font-bold sm:text-4xl">REGISTER</h1>
          <p class="mt-2 text-sm text-gray-400 sm:text-base">
            Create your LootTrade account
          </p>
        </div>

        <!-- Form -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
              v-model="form.username"
              placeholder="Username"
              class="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500 sm:col-span-2"
          />

          <input
              v-model="form.first_name"
              placeholder="First Name"
              class="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
          />

          <input
              v-model="form.last_name"
              placeholder="Last Name"
              class="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
          />

          <input
              v-model="form.email"
              placeholder="Email"
              type="email"
              class="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
          />

          <input
              v-model="form.confirmEmail"
              placeholder="Confirm Email"
              type="email"
              class="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
          />

          <input
              v-model="form.password"
              placeholder="Password"
              type="password"
              minlength="8"
              class="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
          />

          <input
              v-model="form.confirmPassword"
              placeholder="Confirm Password"
              type="password"
              minlength="8"
              class="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
          />
        </div>

        <!-- Button -->
        <button
            @click="registerUser"
            class="mt-6 w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition hover:bg-green-700"
        >
          Register
        </button>

        <!-- Footer -->
        <p class="mt-5 text-center text-sm text-gray-300 sm:text-base">
          Already have an account?
          <router-link
              class="ml-1 text-blue-400 hover:text-blue-300 underline"
              to="/loginform"
          >
            Login
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

