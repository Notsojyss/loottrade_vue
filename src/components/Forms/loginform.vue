
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
    this.authStore.fetchMoney();

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
    <div v-if="!authStore.user" class="forms">
        <img alt="Vue logo" class="logo" src="../../assets/LTlogo.png" width="200" height="140" />
        <h1>Sign In</h1>


        <input v-model="logindata.username" placeholder="Username" />
        <input v-model="logindata.password" placeholder="Password" type="password" />
        <button @click="loginUser">Login</button>
        <p class="login-link">
            Don't have an account?
            <router-link class="registertxt " to="/registrationform">Register</router-link>
        </p>
    </div>
</template>

<style scoped>
.forms {
    position: absolute;
    top: 170px;
    left: 580px;
    width: 400px;
    min-height: 500px;
    padding: 20px;
    background: linear-gradient(45deg, #000000 60%, #8f8f8f);
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    text-align: center;

}
.logo{
    position: relative;
    top: 0px;
}
.forms h1{
    position: relative;
    top: -20px;
    color:#8e918e;
}
.disabled-form {
    opacity: 0.5;
    pointer-events: none; /* Prevent clicks and interactions */
}
.forms input {
    color: white;
    width: 100%;
    padding: 10px;
    margin: 12px 0;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    transition: 0.3s ease;
    background: #282828;
}

.forms input:focus {
    transform: scale(102%);
    box-shadow: 0 0 5px rgba(67, 124, 71, 0.5);
}

.forms button {
    width: 100%;
    padding: 10px;
    margin-top: 10px;
    border: none;
    background: #494848;
    color: white;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
    transition: 0.3s ease;
}

.forms button:hover {
    background: #ff0000;
}
.login-link{
    color: #8e918e;
    margin-top: 10px;
}
.registertxt{
    text-decoration: underline;
    color: white;
    font-weight: bold;
}.registertxt:hover{
    color: #ff0000;

}
</style>
