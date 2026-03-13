<script>
import { useAuthStore } from "@/stores/authStore.js";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import axios from 'axios'

export default {
    name: "loginregister",

    data() {
        return {
            authStore: useAuthStore(),
            router: useRouter(),
            dropdownOpen: false

        };
    },
    computed: {
        user() {
            return this.authStore.user;
        },
        money() {
            return this.authStore.money;
        }
    },
    methods: {
        /**
         * for handling logging out
         */
        handleLogout() {
            this.authStore.logout(this.router);
        },
        /**
         * directed to /profile page
         */
        goToProfile() {
            this.$router.push('/profile');
        },
        /**
         * dropdown to see update profile and logout
         */
        toggleDropdown() {
            this.dropdownOpen = !this.dropdownOpen;
        },
        /**
         * shorten text
         * @param shortenText
         * @returns {string|*}
         */
        shorten(shortenText) {
            // Ensure that hostname is a string before checking its length
            return typeof shortenText === 'string' && shortenText.length > 14
                ? shortenText.substring(0, 10) + ".."
                : shortenText;
        }
    },
    mounted() {
        const auth = useAuthStore();
        auth.fetchUser();
        auth.fetchMoney();
    }
};
</script>


<template>
    <div>
        <div class="moneyVal">
            <a v-if="!user" hidden></a>
            <a v-else>
                <img alt="Coin Image" class="coin-icon" src="../../assets/coin.gif" width="40" height="40" /> Balance: {{ money }}
            </a>
        </div>



        <RouterLink v-if="!user" to="/loginform" class="login-default-btn">Login</RouterLink>
        <RouterLink v-if="!user" to="/registrationform" class="register-btn">Register</RouterLink>
        <div v-else class="profile-dropdown" @click="toggleDropdown">
            <button class="login-btn">{{ shorten(user.full_name) }}</button>
            <div class="dropdown-menu">
                <a @click="goToProfile">View Profile</a>
                <a @click="handleLogout">Logout</a>
            </div>
        </div>
    </div>
</template>



<style scoped>
.login-btn {
    background: #7b271a;
    text-align: center;
    color: #ffffff;
    padding-right: 10px;
    padding-left: 10px;
    font-family: "Brush Script MT";
    min-width: 140px;
    font-weight: bold;
    font-size: 16px;
    height: 30px;
    border-radius: 5px;
    transition: 0.3s;
    position: absolute;
    top: 2px;
    right: -50px;
}
.login-default-btn{
    background: #7b271a;
    text-align: center;
    color: #ffffff;
    padding-right: 10px;
    padding-left: 10px;
    font-family: "Brush Script MT";
    min-width: 90px;
    font-weight: bold;
    font-size: 16px;
    height: 30px;
    border-radius: 5px;
    transition: 0.3s;
    position: absolute;
    top: 25px;
    right: 120px;
}
.profile-dropdown {
    position: absolute;
    top: 23px;
    right: 85px;
}

.profile-dropdown .dropdown-menu {
    display: none;
    position: absolute;
    top: 30px;
    right: -55px;
    background-color: #7b271a;
    border: 1px solid #070707;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    min-width: 140px;
    z-index: 999;
    font-family: "Brush Script MT";
    font-size: 16px;
}
.profile-dropdown:hover .dropdown-menu {
    display: block;
}

.profile-dropdown .dropdown-menu a {
    display: block;
    padding: 2px 10px;
    color: whitesmoke;
    text-decoration: none;
    font-weight: bold;
    text-align: left;
}

.profile-dropdown .dropdown-menu a:hover {
    background-color: #cf7070;
}
.login-btn:hover{
    color: white;
}
.register-btn {
    background: #7b271a;
    text-align: center;
    color: #ffffff;
    padding-right: 10px;
    padding-left: 10px;
    font-family: "Brush Script MT";
    min-width: 80px;
    font-weight: bold;
    font-size: 16px;
    height: 30px;
    border-radius: 5px;
    cursor: pointer;
    transition: 0.3s;
    position: absolute;
    top: 25px;
    right: 30px;

}

.register-btn:hover {
    background: #da3a3a;
}
.coin-icon{
    position: absolute;
    top: -7px;
    right: 150px;
}

.login-btn:hover {
    background: #da3a3a;
}
.moneyVal{
    position: absolute;
    top: 27px;
    right: 160px;
    justify-content: left;
    width: 150px;



}

.moneyVal a{
    font-weight: bold;
    color: #8e918e;

}

</style>
