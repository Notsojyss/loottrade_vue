<script setup>
import { useAuthStore } from '@/stores/authStore.js'; // Import the store if needed
const authStore = useAuthStore();
</script>

<template>
<!-- Landing Page-->
    <div class="landing">
        <h1>Welcome to <a class="loot-trade-a">Loot Trade</a></h1>

        <p>Trade, buy, and sell game items in a virtual marketplace!</p>
        <br>

        <div class="features">

            <RouterLink to="/shop" class="feature-card">
                <h2> Item Shop </h2>
                <ul>
                    <li>Purchase exclusive items using your coins.</li>
                    <li>Discover a variety of rare and valuable items.</li>
                </ul>
            </RouterLink>
            <RouterLink to="/market" class="feature-card">
                <h2> Marketplace</h2>
                <ul>
                    <li>List items for sale</li>
                    <li>Browse and buy items from other users.</li>
                    <li>See item listed by other users</li>
                    <li>View purchase history details.</li>
                </ul>

            </RouterLink>


            <RouterLink to="/pvp" class="feature-card">
                <h2>Earn Coins with PvP</h2>
                <ul>
                    <li>Challenge players in Rock-Paper-Scissors Battle.</li>
                    <li>Win battles to earn more coins!</li>
                </ul>
                </RouterLink>
            <RouterLink to="/inventory" class="feature-card">
                <h2> Inventory </h2>
                <ul>
                    <li>Keep track of your owned assets.</li>
                </ul>
            </RouterLink>
        </div>
    </div>

</template>

<style scoped>
body{
    background-color: #2c3e50;
}
.landing {
    margin-right: 80px;
    width: 90%;
    height: 650px;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 160px 240px;
}
.landing h1{
    position: absolute;
    top:250px;
    left: 605px;
    font-weight: bold;
    font-size: 70px;
    font-family: "Brush Script MT";
    color: #8e918e;
}
.landing p{
    position: absolute;
    top:350px;
    left: 720px;
    font-weight: bold;
    font-size: 18px;
    font-family: "Brush Script MT";
    color: #8e918e;
}
.loot-trade-a{
    top:100px;
    left: 100px;
    font-weight: bold;
    font-size: 70px;
    font-family: "Brush Script MT";
    color: #d76755;
}
.loot-trade-a:hover{
    background: none;
}


.features {
    position: relative;
    left: -50px;
    top: -75px;
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 4 equal columns */
    gap: 20px; /* Space between cards */
    width: 900px; /* Adjust as needed */
     /* Center the container */
    justify-content: center; /* Align items to center */

}

/* Feature card styling */
.feature-card {
    background: linear-gradient(45deg, rgba(44, 44, 44, 0.74) 80%, #838282);
    border-radius: 8px;
    border: #333333 solid 2px;
    padding: 8px;
    min-width: 325px;
    max-height: 200px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    text-align: center;
    position: relative;
    top: 120px;
}

.feature-card h2{
    position: relative;
    top: -30px;
    color: #d76755;
}.feature-card  ul{
    position: relative;
    top: -40px;
    left: -10px;
     color: #ffffff;
}
.feature-card:hover {
    transform: scale(110%);
}

/* Make the last two cards take equal space */
.feature-card:nth-child(4),
.feature-card:nth-child(5) {
    flex: 1 1 calc(50% - 20px); /* Each takes 50% of the width */
}


.feature-card ul{
    min-width: 250px;
    max-height: 200px;
    min-height: 200px;
}.feature-card h2{
         display: block;
         font-size: 1.5em;
         margin-block-start: 0.83em;
         margin-block-end: 0.83em;
         margin-inline-start: 0px;
         margin-inline-end: 10px;
         font-weight: bold;
         unicode-bidi: isolate;
        width: 100%;

}

.cta {
    margin-top: 30px;
}

button {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 18px;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
    background: #45a049;
}
</style>
