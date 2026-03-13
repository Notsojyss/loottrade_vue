<script setup>
defineProps({
    msg: {
        type: String,
        default: 'common',
    },
})
</script>

<template>
    <div class ="navigation">

        <ul>
            <li><a href="default.asp">{{msg}}</a></li>
            <li><a href="news.asp">News</a></li>
            <li><a href="contact.asp">Contact</a></li>
            <li><a href="about.asp">About</a></li>
        </ul></div>

</template>

<style scoped>

.navigation{
    position: absolute;
    left: 0;
    top: 135px;
    width: 100%;
    height: 50px;
    background-color: #5a8570;
    border: 3px solid #282828;
    padding: 8px;

}

ul li{
    text-align: Center;
    background-color: #a5efc7;
    border: #282828 solid 3px;
    padding: 10px;
    position: relative;
    font-weight: bold;
    margin: auto;
    font-size: 15px;
    width: 200px;
    left: -50px;

}
.navigation ul li:hover {
    background: #1abc9c;
    transform: scale(1.1);

}
.navigation ul li a{
    width: 200px;
}
.navigation ul li a:hover {
    color: whitesmoke;

}
</style>
