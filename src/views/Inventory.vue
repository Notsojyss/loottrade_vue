<script>
import axios from "axios";
import {useAuthStore} from "@/stores/authStore.js";
import { computed, onMounted } from "vue";

export default {
    name: "Inventory",
    setup() {
        const authStore = useAuthStore();
        const items = computed(() => authStore.items);
        onMounted(() => {
             authStore.fetchUserItems();
        });
        return { authStore,items };
    },
    data (){
        return {
            showInfoModal: false,
            selectedItem: null
        }
    },
    computed:{
        sortedItems() {
            const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
            return this.items.slice().sort((a, b) => {
                return (
                    rarityOrder.indexOf(a.rarity.toLowerCase()) -
                    rarityOrder.indexOf(b.rarity.toLowerCase())
                );
            });
        }
    },
    methods: {
        rarityClass(rarity) {
            switch (rarity) {
                case 'epic':
                    return 'rarity-epic';
                case 'legendary':
                    return 'rarity-legendary';
                case 'rare':
                    return 'rarity-rare';
                case 'uncommon':
                    return 'rarity-uncommon';
                case 'common':
                    return 'rarity-common';
                default:
                    return '';
            }
        },
        openInfoModal(item) {
            this.selectedItem = item;
            this.showInfoModal = true;
        },
        closeInfoModal() {
            this.showInfoModal = false;
            this.selectedItem = null;
        },

    }
};
</script>

<template>
    <div class="inventory-container">
        <h1 class="inventory-header">MY INVENTORY</h1>
        <div v-if="items.filter(i => i.item_name).length > 0" class="item-grid">
                <div v-for="item in sortedItems" :key="item.item_name" :class="['item-card', rarityClass(item.rarity)]">
                    <div class="listing-header">
                        <h2 class="host-name">{{ item.item_name }}</h2>

                    </div>
                    <div>
                        <img :src="item.image" :alt="item.name" class="item-image" />
                        <p class="qtytext"> You have: {{item.quantity}}	</p>
                    </div>
                    <div class="listing-body">

                        <button class="info-btn" @click="openInfoModal(item)">Info</button>

                    </div>
                </div>
            </div>
        <p class ="no-found" v-else>No items found.</p>
    </div>
    <div v-if="showInfoModal" class="modal-overlay" @click.self="closeInfoModal">
        <div class="modal-content" :class="rarityClass(selectedItem?.rarity)" >
            <h2>{{ selectedItem?.item_name }}</h2>
            <img :src="selectedItem?.image" :alt="selectedItem?.item_name" class="modal-img" />
            <p><strong>Description:</strong> {{ selectedItem?.description }}</p>
            <p><strong>Rarity:</strong> {{ selectedItem?.rarity }}</p>
            <p><strong>You have:</strong> {{ selectedItem?.quantity }}</p>
            <button class= "close-btn"@click="closeInfoModal">Close</button>
        </div>
    </div>
</template>

<style scoped>
.inventory-container {
    position: relative;
    text-align: center;
    background: transparent;
    padding: 20px;
    min-width: 1200px;
    left: 0px;
    margin-top: 120px;
    max-height: 650px;
    min-height: 650px;
    max-width: 1200px;
    overflow-x: hidden;
    overflow-y: hidden;
}
.inventory-header{
    position: relative;
    color: #f5ff28;
    left: -430px;
    top: -20px;
    font-weight: bold;
    font-family: "Brush Script MT";
    font-size: 40px;
}


.item-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    padding: 20px;
    position: relative;
    top:-40px;
    justify-items: center;
    max-width: 1160px;
    min-width: 1160px;
    overflow-x: hidden;
    overflow-y: auto;
    min-height: 500px;
    max-height: 500px;
    margin-left: 0px;
}
.item-card {
    background: linear-gradient(135deg, #222, #444);
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    color: white;
    transition: transform 0.2s ease-in-out;
    text-align: center;
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: center;
    min-width: 200px;
    max-width: 200px; /* Adjust size if needed */
    min-height: 200px;
    max-height: 200px;
}
.item-image {
    margin-top: 10px;
    width: 100px;
    height: 100px;
    border-radius: 10px;
}
.item-card:hover{
    filter: brightness(80%);
}
 .info-btn {
    opacity: 0;
    position: relative;
    top: -100px; /* adjust as needed */
    background: #d9534f;
    border: none;
     width: 100px;
     color: white;
     height: 40px;
     border-radius: 5px;
     font-size: 14px;
     text-transform: uppercase;
    padding: 6px 12px;
    cursor: pointer;
    transition: opacity 0.3s ease;
    z-index: 2;
}

.item-card:hover .info-btn {
    opacity: 1;

}
.item h3{
    position: relative;
    top: -30px;
    left: 200px;
    min-width: 100px;
    max-width: 150px;
    text-align: center;
}
.qtytext{
    font-size: 16px;

    position: relative;
    display: flex;
    justify-content: center;  /* Center horizontally */
    align-items: center;
}
.host-name {
    font-size: 18px;
    font-weight: bold;
}
.rarity-epic {
    background: linear-gradient(135deg, rgba(243, 85, 243, 0.95), rgba(234, 228, 234, 0.8));
    color: black;
}

.rarity-legendary {
    background: linear-gradient(135deg, #f7d700, #ffd700, #ff9900);
    color: black;
}

.rarity-rare {
    background: linear-gradient(135deg, #4d8ee6, #6bb7d3);
    color: black;
}

.rarity-uncommon {
    background: linear-gradient(135deg, #56ab2f, #a8e063);
    color: black;
}

.rarity-common {
    background: linear-gradient(135deg, #f0f0f0, #ffffff);
    color: black;
}
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.modal-content {
    padding: 20px;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
    text-align: center;
}

.modal-img {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 10px;
}
.close-btn{
    padding: 10px 20px;
    font-size: 16px;
    background-color: #fd0101;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    width: 150px;
}
.no-found{
    color: whitesmoke;
}

</style>
