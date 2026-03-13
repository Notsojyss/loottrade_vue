<script setup>
import {RouterLink} from "vue-router";
import Loginregister from "@/components/Headers/loginregister.vue";

defineProps({
    header: {
        type: String,
        default: 'common',
    },
    login: {
        type: String,
        default: 'Login'
    },
    computed: {

    },
    methods: {

    }
})
</script>

<template>
    <div class="header">
        <router-link to="/landingpage">
            <img alt="Vue logo" class="logo" src="../../assets/LTlogo.png" width="200" height="140" />
        </router-link>


        <loginregister />


        <div class="navigation">
            <RouterLink to="/pvp">PVP Battle</RouterLink>
            <RouterLink to="/landingpage">Home</RouterLink>
            <RouterLink to="/market" class="nav-item">
                Marketplace
            </RouterLink>
            <RouterLink to="/shop">Shop</RouterLink>
            <RouterLink to="/inventory">Inventory</RouterLink>
        </div>
    </div>

</template>

<style scoped>
.header{
    position: absolute;
    margin: 0;
    width: 100% ;
    background-color: #0e110e;
    top: 0px;
    left: 0px;
    min-height: 70px;
    max-height: 70px;
    border: #0b0b0b solid 0.5px;
    border-radius: 2px;
    font-weight: bold;
    box-shadow: 4px 8px 5px 2px rgba(0, 0, 0, 0.87);
}


.logo {
    position: absolute;
    margin-top: -25px;
    margin-left: 30px;/* Move the image down */
    transition: transform 0.3s ease, filter 0.3s ease;

}
.logo:hover{
    transform: scale(102%);
    filter: brightness(80%);

}

.header h1 {
    font-weight: bold;
    color:#2c3e50;
    font-family: "Brush Script MT";
    font-size: 32px;
    margin-top: -70px;
    margin-left: 110px ;
    letter-spacing: -2px;
    height: 60px;

}

.navigation {
    position: absolute;
    top: 0px;
    left: 37%;
    transform: translateX(-50%);
    margin-top: 18px;
    width: 50%; /* Adjust width as needed */
    text-align: center;
    display: flex;
    justify-content: center;
}

.navigation a {

    color: #8e918e;
    font-weight: bold;
    font-size: 18px;
    margin-right: 40px;
    width: auto;
    text-align: center;
    padding: 5px;
}
.navigation a:hover {
    transform: scale(1.1);
    color: red;
    background: none;

}
.nav-item {
    display: flex;
    align-items: center;
    gap: 8px; /* Space between icon and text */
    text-decoration: none;
    color: black;
}

.nav-icon {
    width: 24px; /* Adjust size */
    height: 24px;
}

</style>
