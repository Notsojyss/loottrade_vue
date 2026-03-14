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

    <div class="forms">
        <img alt="Vue logo" class="logo" src="../../assets/LTlogo.png" width="300" height="250" />
        <h1>Register</h1>
        <input v-model="form.username" placeholder="Username" /><br>
        <input v-model="form.password" placeholder="Password" type="password" minlength="8"/><br>
        <input v-model="form.confirmPassword" placeholder="Confirm Password" type="password" minlength="8"/><br>
        <input v-model="form.first_name" placeholder="First Name" /><br>
        <input v-model="form.last_name" placeholder="Last Name" /><br>
        <input v-model="form.email" placeholder="Email" type="email"/><br>
        <input v-model="form.confirmEmail" placeholder="Confirm Email" type="email"/><br>
        <button @click = "registerUser">Register</button>
        <p class="login-link">
            Already have an account?
            <router-link class="logintxt" to="/loginform">Login</router-link>
        </p>


        <br><br>

    </div>
</template>

<style scoped>
.forms {
  position: absolute;
  top: 150px;
  left: 550px;
  width: 800px;
  min-height: 720px;
  padding: 0px;
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
    top:-40px;
}
.forms input {
    position: relative;
    top: -30px;
    width: 60%;
    padding: 20px;
    margin: 6px 0;
    border: 1px solid #ddd;
    height: 30px;
    border-radius: 5px;
    font-size: 16px;
    transition: 0.3s ease;
    background: #282828;
    color: white;
}

.forms input:focus {
    transform: scale(102%);
    box-shadow: 0 0 5px rgba(67, 124, 71, 0.5);
}

.forms button {
    width: 60%;
    padding: 10px;
    margin-top: 0px;
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
    margin-top: 0px;
}
.logintxt{
    text-decoration: underline;
    color: white;
    font-weight: bold;
}.logintxt:hover{
     color: #ff0000;

 }
</style>
