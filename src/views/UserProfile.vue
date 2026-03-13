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
    <div class="forms">
        <h1>Edit Profile</h1>
        <label>Username :</label>
        <input v-model="form.username" :placeholder="this.authStore.user?.username"  /><br>
        <label>First Name :</label>
        <input v-model="form.first_name" :placeholder="this.authStore.user?.first_name"  /><br>
        <label>Last Name :</label>
        <input v-model="form.last_name" :placeholder="this.authStore.user?.last_name" /><br>
        <label>Email :</label>
        <input v-model="form.email" :placeholder="this.authStore.user?.email" /><br>
        <button class="update-btn" @click = "updateProfile">Update Profile</button>

        <br><br>

    </div>
</template>
<style scoped>
.forms {
    position: absolute;
    top: 100px;
    left: 500px;
    width: 600px;
    height: 630px;
    padding: 20px;
    background: linear-gradient(45deg, #000000 90%, #8f8f8f);
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
}
h1 {
    font-size: 24px;
    margin-bottom: 20px;
    margin-top: 100px;
    color: whitesmoke;
    font-weight: bold;
}

label {
    display: block;
    margin-top: 15px;
    margin-bottom: 5px;
    font-size: 16px;
    color: whitesmoke;
}

input {
    width: 100%;
    max-width: 400px;
    padding: 10px 12px;
    font-size: 14px;
    border: 1px solid #bdc3c7;
    border-radius: 6px;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.3s ease;
}

input:focus {
    border-color: #3498db;
}


.update-btn{
    color: white;
    border: none;
    cursor: pointer;
    font-weight: bold;
    width: auto;
    margin-top: 20px;
    letter-spacing: 2px;
    padding: 10px 14px;
    background: #d9534f;
    border-radius: 10px;
    text-align: center;
}
.update-btn:hover{
    background: red;
}
</style>
