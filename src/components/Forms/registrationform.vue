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
  <div class="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
    <div
        class="forms w-full max-w-md sm:max-w-lg md:max-w-xl rounded-2xl bg-gradient-to-br from-black to-gray-500 p-6 sm:p-8 md:p-10 text-center shadow-xl"
    >
      <!-- Logo -->
      <img
          alt="Vue logo"
          class="logo mx-auto mb-4 w-40 sm:w-52 md:w-64 h-auto"
          src="../../assets/LTlogo.png"
      />

      <!-- Title -->
      <h1 class="mb-6 text-2xl sm:text-3xl font-bold text-white">Register</h1>

      <!-- Inputs -->
      <div class="flex flex-col gap-4">
        <input
            v-model="form.username"
            placeholder="Username"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm sm:text-base outline-none focus:border-blue-500"
        />

        <input
            v-model="form.password"
            placeholder="Password"
            type="password"
            minlength="8"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm sm:text-base outline-none focus:border-blue-500"
        />

        <input
            v-model="form.confirmPassword"
            placeholder="Confirm Password"
            type="password"
            minlength="8"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm sm:text-base outline-none focus:border-blue-500"
        />

        <input
            v-model="form.first_name"
            placeholder="First Name"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm sm:text-base outline-none focus:border-blue-500"
        />

        <input
            v-model="form.last_name"
            placeholder="Last Name"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm sm:text-base outline-none focus:border-blue-500"
        />

        <input
            v-model="form.email"
            placeholder="Email"
            type="email"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm sm:text-base outline-none focus:border-blue-500"
        />

        <input
            v-model="form.confirmEmail"
            placeholder="Confirm Email"
            type="email"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm sm:text-base outline-none focus:border-blue-500"
        />

        <!-- Button -->
        <button
            @click="registerUser"
            class="w-full rounded-lg bg-green-600 px-4 py-3 text-sm sm:text-base font-semibold text-white hover:bg-green-700 transition"
        >
          Register
        </button>
      </div>

      <!-- Footer -->
      <p class="login-link mt-5 text-sm sm:text-base text-white">
        Already have an account?
        <router-link
            class="logintxt ml-1 text-blue-300 hover:text-blue-400 underline"
            to="/loginform"
        >
          Login
        </router-link>
      </p>
    </div>
  </div>
</template>

