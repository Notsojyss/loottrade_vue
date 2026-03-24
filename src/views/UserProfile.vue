<script>
import {useAuthStore} from "@/stores/authStore.js";
import axios from "axios";
export default {
    name: "UserProfile",
    data() {
        return {
            form: {
                first_name: '',
                username: '',
                last_name: '',
                email: ''

            }

        };
    },
    async mounted() {
        /**
         * mount the user's details
         */
        await this.authStore.fetchUser();
        if (this.authStore.user) {
            this.form.username = this.authStore.user.username || '';
            this.form.first_name = this.authStore.user.first_name || '';
            this.form.last_name = this.authStore.user.last_name || '';
            this.form.email = this.authStore.user.email || '';
        }
    },
    computed: {

        authStore() {
            return useAuthStore();
        }
    },
    methods: {
        /**
         * function to implement the update on User's profile
         * @returns {Promise<void>}
         */
        async updateProfile() {
            // Validation
            if (/\d/.test(this.form.first_name) || /\d/.test(this.form.last_name)) {
                alert("Names cannot contain numbers.");
                return;
            }

            const userData = {
                username: this.form.username,
                first_name: this.form.first_name,
                last_name: this.form.last_name,
                email: this.form.email
            };

            try {
                const token = localStorage.getItem("auth_token");

                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/update`, userData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 200 || response.status === 201) {
                    alert(response.data.message || "Profile updated successfully!");
                    await this.authStore.fetchUser();
                } else {
                    alert("Failed to update profile. Please try again.");
                }

            } catch (error) {
                console.error("Error updating profile:", error);

                if (error.response && error.response.status === 422) {
                    const errors = error.response.data.errors;
                    let messages = [];

                    if (errors.username) messages.push(`Username: ${errors.username[0]}`);
                    if (errors.email) messages.push(`Email: ${errors.email[0]}`);
                    if (errors.first_name) messages.push(`First Name: ${errors.first_name[0]}`);
                    if (errors.last_name) messages.push(`Last Name: ${errors.last_name[0]}`);

                    alert(messages.join("\n"));
                } else {
                    alert("An error occurred while updating the profile.");
                }
            }

        }
    }
}

</script>

<template>
  <div class="min-h-screen bg-gray-900 px-4 py-6 text-white">
    <div class="mx-auto max-w-3xl">
      <!-- Header -->
      <h1 class="mb-8 text-center text-3xl font-bold sm:text-4xl">
        EDIT PROFILE
      </h1>

      <!-- Form Card -->
      <div class="rounded-2xl border border-gray-700 bg-gray-800 p-5 shadow-lg sm:p-6">
        <div class="grid grid-cols-1 gap-4 sm:gap-5">
          <!-- Username -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
                v-model="form.username"
                :placeholder="authStore.user?.username"
                class="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>

          <!-- First Name -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-300">
              First Name
            </label>
            <input
                v-model="form.first_name"
                :placeholder="authStore.user?.first_name"
                class="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>

          <!-- Last Name -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-300">
              Last Name
            </label>
            <input
                v-model="form.last_name"
                :placeholder="authStore.user?.last_name"
                class="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
                v-model="form.email"
                :placeholder="authStore.user?.email"
                class="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>

          <!-- Button -->
          <div class="pt-2">
            <button
                class="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 sm:w-auto"
                @click="updateProfile"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
