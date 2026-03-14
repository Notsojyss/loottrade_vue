<script>
import {useAuthStore} from "@/stores/authStore.js";
import {usePvpStore} from "@/stores/pvpStore.js";
import { computed, onMounted } from "vue";
import axios from 'axios';
import { ref } from "vue";
export default {
    name: "PvpBattle",
    setup() {
        const authStore = useAuthStore();
        const pvpStore = usePvpStore();
        const pvpbattles = computed(() => pvpStore.pvpbattles);
        const pvphistory = computed(() => pvpStore.pvphistory);
        const mypvphistory = computed(() => pvpStore.mypvphistory);
        const leaderboard = computed(() => pvpStore.leaderboard);
        const winMessage = computed(() => pvpStore.winMessage);
        const showWinMessage = computed(() => pvpStore.showWinMessage);


        onMounted(() => {
            pvpStore.fetchPvpBattles();


        });
        return {authStore, pvpStore, pvpbattles, winMessage, showWinMessage,pvphistory,leaderboard, mypvphistory};
    },
    data() {
        return {
            showPickPlayModal: false,
            selectedPvpId: null,
            selectedPvpUsername: null,
            selectedPvpMoneybetted: null,
            showCreateBattleModal: false,
            selectedPlay: null, // Stores selected play
            selectedPvpIdHostPlay: null, // Stores selected play
            selectedBet: null,
            showHistory: false,
            showMyHistory: false,
            hostPlay: null,
            sortAmount: 0,
            hoveredPlay: null,  // Tracks hovered play
            playConfirmed: false, // Tracks if play is selected
            playImages : {
                Rock: "/src/assets/rock.png",
                Paper: "/src/assets/paper.png",
                Scissor: "/src/assets/scissor.png",
                Default: "/src/assets/questionmark.png",
            },
           showLeaderboard: false,
        }
    },
    computed: {
        user() {
            return this.authStore.user;
        },
        sortedBattles() {
            const sortAmount = Number(this.sortAmount);
            if (sortAmount === 0)  {
                return [...this.pvpbattles].sort((a, b) => a.money_betted - b.money_betted);
            }
            return this.pvpbattles.filter(battle => battle.money_betted == sortAmount);
        }
    },
    methods: {
        /**
         * Shorten the hostname
         * @param hostname
         * @returns {string|*}
         */
      shortenHostname(hostname) {
        // Ensure that hostname is a string before checking its length
        return typeof hostname === 'string' && hostname.length > 6
            ? hostname.substring(0, 6) + "..."
            : hostname;
      },
        /**
         * shorten the text
         * @param shortenText
         * @returns {string|*}
         */
      shorten(shortenText) {
        // Ensure that hostname is a string before checking its length
        return typeof shortenText === 'string' && shortenText.length > 10
            ? shortenText.substring(0, 10) + "..."
            : shortenText;
      },
        /**
         * Gets the data of the clicked battle through params
         * @param user_id
         * @param pvpId
         * @param money_betted
         * @param username
         * @returns {Promise<void>}
         */
        async handleJoin(user_id, pvpId, money_betted, username) {
            const canJoin = await this.checkUserisNotHost(user_id, pvpId);
            if (!canJoin) {
                alert("You cannot join your own battle.");
                return;
            }

            const hasEnoughMoney = await this.checkUserHasEnoughMoney(user_id, pvpId);
            if (!hasEnoughMoney) {
                alert("You do not have enough money to join this battle.");
                return;
            }
            this.selectedPvpMoneybetted =  money_betted;
            this.selectedPvpUsername = username;
            this.showPickPlayModal = true;
            this.selectedPvpId = pvpId;

            this.selectedPvpIdHostPlay = await this.pvpStore.fetchHostPlay(pvpId);
            console.log("Host Play:", this.selectedPvpIdHostPlay);

        },
        /**
         *Checking if the user joining the battle is the host
         * @param user_id
         * @param pvpId
         * @returns {Promise<boolean>}
         */
        async checkUserisNotHost(   user_id, pvpId) {
            const battle = this.pvpStore.pvpbattles.find(battle => battle.id === pvpId);
            if (!battle) {
                console.warn("Battle not found.");
                return false;
            }
            return battle.host_id !== user_id;
        },
        /**
         * Check if the user joining a battle has enough money
         * @param user_id
         * @param pvpId
         * @returns {Promise<boolean>}
         */
        async checkUserHasEnoughMoney(user_id, pvpId) {
            await this.authStore.fetchMoney(); // Ensure the latest data is fetched

            const battle = this.pvpStore.pvpbattles.find(battle => battle.id === pvpId);
            if (!battle) {
                console.warn("Battle not found.");
                return false;
            }

            if (!this.authStore.user || this.authStore.user.id !== user_id) {
                console.warn("User not found or ID mismatch.");
                return false;
            }

            console.log(`User Money: ${this.authStore.money}, Required Bet: ${battle.money_betted}`);

            return this.authStore.money >= battle.money_betted;
        }
        ,
        /**
         * Selecting a play for the opponent of the battle
         * @param play
         */
        handleSelectPlay(play) {
            if (confirm(`Are you sure you want to select "${play}"?`)) {
                this.selectedPlay = this.selectedPvpIdHostPlay;
                this.playConfirmed = true;
                this.pvpStore.selectPlay(play, this.selectedPvpId);

            }
        },
        /**
         * closing modal
         * @returns {Promise<void>}
         */
         async handleClose() {
            await this.pvpStore.fetchPvpBattles();
            await this.authStore.fetchMoney();
             await this.pvpStore.clearWinMessage();
             this.showPickPlayModal = false;
             this.selectedPlay = null;
             this.hoveredPlay = null;
             this.playConfirmed = false;




        },
        /**
         * Creating of Pvp battle
         * @param play
         * @param money_betted
         * @returns {Promise<void>}
         */
       async handleCreateBattle(play,money_betted) {
            if (!this.selectedPlay || !this.selectedBet) {
                alert("Please select both a play and a bet amount.");
                return;
            }
            console.log(`Creating battle with move: ${this.selectedPlay} and bet: ${this.selectedBet}`);
           await this.pvpStore.createBattle(play,money_betted);
            this.showCreateBattleModal = false;
           await this.authStore.fetchMoney();
           this.selectedPlay = null;
           this.selectedBet = null;


        },
        /**
         * Opening of modal history
         * @returns {Promise<void>}
         */
        async showHistoryModal(){

            this.showHistory = true;
            await this.pvpStore.fetchPvpHistory();
        },
        /**
         * show My history modal
         * @returns {Promise<void>}
         */
        async showMyHistoryModal(){

            this.showMyHistory = true;
            await this.pvpStore.fetchMyPvpHistory();
        },
        /**
         * close history
         * @returns {Promise<void>}
         */
        async closeHistoryModal(){

            this.showHistory = false;
        },
        /**
         * close my history
         * @returns {Promise<void>}
         */
        async closeMyHistoryModal(){

            this.showMyHistory = false;
        },
        /**
         * for toggling of leaderboard modal
         */
      toggleLeaderboard() {
        this.showLeaderboard = !this.showLeaderboard;
        if (this.showLeaderboard) {
          this.pvpStore.fetchLeaderboard();
        }
      },


    }
}



</script>

<template>

    <div class = "sortingbet">
        <label for="sortAmount">Sort : </label>
        <select v-model="sortAmount">
            <option value="0">All</option>
            <option value="100">100</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
            <option value="2000">2000</option>
        </select>
    </div>
    <div class="container">
        <h2 class="title">PVP BATTLES</h2>

        <button class="create-btn"  @click="showCreateBattleModal = true">Create Battle</button>
        <button class="history-btn" @click="showMyHistoryModal()"> My PVP History  </button>
      <button @click="toggleLeaderboard()" class="leaderboard-button">🏆Leaderboard </button>
        <button @click="showHistoryModal()" class="mypvphistory-button"> ⓘ PVP Battle Logs</button>

        <div v-if="pvpbattles.length > 0" class="listing-grid">

            <div v-for="pvp in sortedBattles" :key="pvp.id" class="listing-card">
                <div class="listing-header">
                    <h2 class="host-name">Host: {{ shortenHostname(pvp.user.first_name) }}</h2>

                </div>
                <div>
                    <img src="../assets/pvpgame.png" alt="Market" class="nav-icon" />
                </div>
                <div class="listing-body">
                    <p class="wager"><img alt="Coin Image" class="coin-icon" src="/src/assets/rotating-coin.gif" width="30" height="30" />{{ pvp.money_betted }}</p>

                    <button class="join-btn" @click= "handleJoin(user.id,pvp.id,pvp.money_betted,pvp.user.first_name )">Join Battle</button>
                </div>
            </div>
        </div>
        <p v-else class="no-listing">No active listings available.</p>
    </div>


    <div v-if="showHistory" class="overlay-history">
        <div class="popup-history">
            <div class="popup-header">
                <h3>PVP BATTLES History</h3>
                <button class="show-history-close-btn" @click="closeHistoryModal()">Close</button>
            </div>

            <div class="market-history-loading" v-if="loading">Loading history...</div>

            <div v-else-if="pvphistory.length > 0" class="market-history-container">
                <table class="market-history-table">
                    <thead>
                    <tr>

                        <th>Host</th>
                        <th>Versus</th>
                        <th>Opponent</th>
                        <th>Bet</th>
                        <th>Winner</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="pvp in pvphistory" :key="pvp.id">
                      <td>{{ pvp.hostname }}</td>
                        <td>VS</td>
                        <td>{{ pvp.opponentname }}</td>
                        <td>{{ pvp.money_betted }}</td>
                        <td>{{ pvp.winnername }}</td>
                        <td>{{ pvp.battletime }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <div v-else class="no-history-message">
                No history available.
            </div>
        </div>
    </div>

    <div v-if="showMyHistory" class="overlay-history">
        <div class="popup-history">
            <div class="popup-header">
                <h3>My Pvp History</h3>
                <button class="show-history-close-btn" @click="closeMyHistoryModal()">Close</button>
            </div>

            <div class="market-history-loading" v-if="loading">Loading history...</div>

            <div v-else-if="mypvphistory.length > 0" class="market-history-container">
                <table class="market-history-table">
                    <thead>
                    <tr>

                        <th>Host</th>
                        <th>Versus</th>
                        <th>Opponent</th>
                        <th>Bet</th>
                        <th>Winner</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="mypvp in mypvphistory" :key="mypvp.id">
                        <td>{{ mypvp.hostname }}</td>
                        <td>VS</td>
                        <td>{{ mypvp.opponentname }}</td>
                        <td>{{ mypvp.money_betted }}</td>
                        <td>{{ mypvp.winnername }}</td>
                        <td>{{ mypvp.battletime }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <div v-else class="no-history-message">
                No history available.
            </div>
        </div>
    </div>







    <!--          Modal For Picking a Play opponents joining a Battle              -->
    <div v-if="showPickPlayModal" class="modal-overlay-bg">
        <div class="modal-pick-play">
            <div class="modal-pick-play-header">
                <h3 class="pick-play-header-select">Select your Play:</h3>
                <h3 class="host-name-pick-play">{{selectedPvpUsername.toLowerCase()}}</h3>
                <h3 class="opponent-pick-play">{{this.user.username.toLowerCase()}}</h3>
                <button class="modal-play-close-btn" @click="handleClose()">Close</button>
            </div>

            <!-- Play Selection List -->
            <div class="play-selection-list">
                <!-- Host play image remains a question mark until play is selected -->
                <img class="hostplayimg" :src="playImages[selectedPlay || 'Default']" alt="Host Play" />

                <!-- Opponent play image changes on hover -->
                <img class="opponentplayimg" :src="hoveredPlay ? playImages[hoveredPlay] : playImages['Default']" alt="Opponent Play" />

                <p class="bet-text">Bet: {{ selectedPvpMoneybetted }}</p>
                <p class="pvpresult">{{ this.pvpStore.winMessage }}</p>

                <!-- Play Options -->
                <div v-if="!playConfirmed">
                    <button
                        @mouseover="hoveredPlay = 'Rock'"
                        @mouseleave="hoveredPlay = null"
                        @click="handleSelectPlay('Rock')"
                        class="play-option">
                        <img :src="playImages['Rock']" alt="Rock" />
                        <h3>Rock</h3>
                    </button>

                    <button
                        @mouseover="hoveredPlay = 'Paper'"
                        @mouseleave="hoveredPlay = null"
                        @click="handleSelectPlay('Paper')"
                        class="play-option">
                        <img :src="playImages['Paper']" alt="Paper" />
                        <h3>Paper</h3>
                    </button>

                    <button
                        @mouseover="hoveredPlay = 'Scissor'"
                        @mouseleave="hoveredPlay = null"
                        @click="handleSelectPlay('Scissor')"
                        class="play-option">
                        <img :src="playImages['Scissor']" alt="Scissors" />
                        <h3>Scissor</h3>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <p v-else hidden></p>



    <!-- Modal For Picking a Play & Bet (Create Battle) -->
  <div v-if="showCreateBattleModal" class="modal-create-battle-overlay" @click.self="showCreateBattleModal = false">
    <div class="modal-create-battle">
      <div class="modal-create-battle-header">
        <h3>CREATING A PVP BATTLE</h3>
        <button class="modal-create-battle-close-btn" @click="showCreateBattleModal = false">Close</button>
      </div>

      <!-- Play Selection -->
      <div class="modal-create-battle-options">
        <button @click="selectedPlay = 'Rock'" class="play-option" :class="{ selected: selectedPlay === 'Rock' }">
          <img src="../assets/rock.png" alt="Rock" />
          <h3>Rock</h3>
        </button>
        <button @click="selectedPlay = 'Paper'" class="play-option" :class="{ selected: selectedPlay === 'Paper' }">
          <img src="../assets/paper.png" alt="Paper" />
          <h3>Paper</h3>
        </button>
        <button @click="selectedPlay = 'Scissor'" class="play-option" :class="{ selected: selectedPlay === 'Scissor' }">
          <img src="../assets/scissor.png" alt="Scissors" />
          <h3>Scissor</h3>
        </button>
      </div>

      <h3 class="bet-header">Select Your Bet:</h3>

      <!-- Bet Selection -->
      <div class="bet-selection-list">
        <button @click="selectedBet = 100" class="bet-option" :class="{ selected: selectedBet === 100 }">100</button>
        <button @click="selectedBet = 500" class="bet-option" :class="{ selected: selectedBet === 500 }">500</button>
        <button @click="selectedBet = 1000" class="bet-option" :class="{ selected: selectedBet === 1000 }">1000</button>
        <button @click="selectedBet = 2000" class="bet-option" :class="{ selected: selectedBet === 2000 }">2000</button>
      </div>

      <button class="confirm-btn-create" @click="handleCreateBattle(selectedPlay, selectedBet)">Confirm Battle</button>
    </div>
  </div>



  <div>


    <!-- Leaderboard Button -->


    <div v-if="showLeaderboard" class="leaderboard-popup" @click.self="toggleLeaderboard">
      <div class="leaderboard-container">
        <h2 class="leaderboard-title">Most Wins Leaderboard</h2>

        <div class="leaderboard-podium">
          <div v-if="leaderboard.length >= 2" class="leaderboard-second">
            <p class="leaderboard-rank">Rank #2</p>
            <p class="leaderboard-name">{{ shorten(leaderboard[1].first_name) }}</p>
            <p class="leaderboard-wins">{{ leaderboard[1].wins }} Wins</p>
            <p class="leaderboard-money">${{ leaderboard[1].total_money_won }}</p>
          </div>

          <div v-if="leaderboard.length >= 1" class="leaderboard-first">
            <p class="leaderboard-rank">Rank #1</p>
            <p class="leaderboard-name">{{ shorten(leaderboard[0].first_name) }}</p>
            <p class="leaderboard-wins">{{ leaderboard[0].wins }} Wins</p>
            <p class="leaderboard-money">${{ leaderboard[0].total_money_won }}</p>
          </div>

          <div v-if="leaderboard.length >= 3" class="leaderboard-third">
            <p class="leaderboard-rank">Rank #3</p>
            <p class="leaderboard-name">{{ shorten(leaderboard[2].first_name) }}</p>
            <p class="leaderboard-wins">{{ leaderboard[2].wins }} Wins</p>
            <p class="leaderboard-money">${{ leaderboard[2].total_money_won }}</p>
          </div>
        </div>

        <table class="leaderboard-table">
          <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Wins</th>
            <th>Total Money Won</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(player, index) in leaderboard.slice(3)" :key="player.id">
            <td>{{ index + 4 }}</td>
            <td>{{ player.first_name }}</td>
            <td>{{ player.wins }}</td>
            <td>${{ player.total_money_won }}</td>
          </tr>
          </tbody>
        </table>

        <button @click="toggleLeaderboard" class="leaderboard-close-button">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7); /* Dark Transparent Background */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
body.modal-open {
    overflow: hidden;
}
.modal-create-battle-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6); /* Dark overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

/* Prevents interaction outside modal */
.modal-create-battle-overlay * {
  pointer-events: auto;
}
.modal-create-battle{
    position: static;
    top: 30%;
    left: 22.5%;
    border: black solid;
    border-radius: 12px;
    justify-content: center;
    background: linear-gradient(45deg, #373737 60%, #8f8f8f);
    max-height: 360px;
    min-height: 360px;
    min-width: 800px;
    max-width: 800px;
    display: flex;
    align-items: center;
    overflow-y: auto;
    overflow-x: hidden;
}
.modal-create-battle-header{
    position: fixed;
    margin-top: -300px;
    color: white;
}

.modal-create-battle-options{

    margin-left: 20px;

    display: flex;
    margin-top: -110px;
    justify-content: space-evenly;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    width: 1000px;


}

.bet-selection-list {
    display: flex;
    position: relative;
    justify-content: center;
    gap: 10px;
    top: 450px;

}

.bet-option {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border: 1px solid #000;
    border-radius: 5px;
    transition: all 0.2s;
}

.bet-option:hover {
    background-color: #ddd;
}

.confirm-btn-create {
    display: block;
    position: absolute;
    top: 575px;
    left:965px ;
    padding: 10px 20px;
    font-size: 16px;
    background-color: #28a745;
    color: white;
    border: none;
    width: 150px;
    border-radius: 5px;
    cursor: pointer;
}
.modal-create-battle-close-btn{
    display: block;
    position: fixed;
    top: 575px;
    left:800px ;
    padding: 10px 20px;
    font-size: 16px;
    background-color: #fd0101;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    width: 150px;
}
.modal-pick-play{
    position: relative;
    border: black solid;
    border-radius: 12px;
    justify-content: center;
    background: linear-gradient(45deg, #373737 60%, #8f8f8f);
    max-height: 450px;
    min-height: 450px;
    min-width: 800px;
    max-width: 800px;
    display: flex;
    align-items: center;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 1001;
}

.modal-pick-play-header{
    position: absolute;
    margin-top: -410px;
    color: white;
   text-align: center;
}

.host-name-pick-play{
  position: absolute;
  color: white;
  top: 200px;
  left: -150px;
  text-align: center;
}
.opponent-pick-play{
    position: absolute;
    color: white;
    top: 200px;
    left: 235px;
  text-align: center;
}

.pick-play-header-select{
    position: relative;
    color: white;
    top:30px;
    left: 10px;



}
.modal-play-close-btn{
    position: absolute;
    top: 360px;
    left: 0px ;
    padding: 10px 20px;
    font-size: 16px;
    background-color: #fd0101;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    width: 150px;

}
.hostplayimg{
    position: absolute;
    top: 50px;
    left: 130px;
    width: 150px;
    height: 150px;
    border: #cccccc 2px solid;
    border-radius: 10px;
    padding: 20px;
    background: rgba(39, 39, 39, 0.91);

}
.opponentplayimg{
    position: absolute;
    top: 50px;
    right: 130px;
    width: 150px;
    height: 150px;
    border: #cccccc 2px solid;
    border-radius: 10px;
    padding: 20px;
    background: rgba(39, 39, 39, 0.91);

}
.play-selection-list {

    margin-left: 20px;

    display: flex;
    margin-top: 150px;
    justify-content: space-evenly;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    width: 1000px;

}
.play-selection-list p{
     display: flex;
     position: fixed;
     justify-content: center;
     gap: 10px;
     margin-top: -100px;
    color: #ffffff;

 }
.bet-text{
    display: flex;
    position: absolute;
    justify-content: center;
    gap: 10px;
    top: 450px;
    color: #ffffff;
}
.play-option {
    position: relative;
    background: none;
    border: #aeabab 6px double;
    border-radius: 5px 5px 20px 20px;
    cursor: pointer;
    padding: 50px;
    height: 100px;
    width: 100px;
    color: white;
}
.play-option h3{
    position: absolute;
    text-align: center;
    left: 27px;
    width: 50px;
    top: 80px;


}

.play-option img {
    position: absolute;
    margin-top: -50px;
    padding: 5px;
    margin-left: -39px;
    justify-items: center;
    object-fit: cover ;
    width: 80px; /* Adjust size */
    height: 80px;
    transition: transform 0.2s ease-in-out;

}

.play-option img:hover {
    transform: scale(1.1);
}

.confirm-btn:hover {
    background-color: #218838;
}





    /* Main Container */
.container {
  position: relative;
    text-align: center;
    background: transparent;
    padding: 20px;
    min-width: 1528px;
    left: -156px;
    margin-top: 120px;
    max-height: 650px;
    min-height: 650px;
    max-width: 1200px;
  overflow-x: hidden;
  overflow-y: hidden;
}

/* Title */
.title {
    position: relative;
    font-size: 24px;
    color: #f5ff28;
    left: -450px;
    top: -20px;
    font-weight: bold;
    font-family: "Brush Script MT";
    font-size: 40px;
}

/* Grid layout for battles */
.listing-grid {
    display: grid;
    grid-template-columns: repeat(6, 4fr);
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
  margin-left: 153px;
}

/* Battle Card */
    .listing-card {
        background: linear-gradient(135deg, #222, #444);
        border-radius: 12px;
        padding: 15px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        color: white;
        transition: transform 0.2s ease-in-out;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 220px; /* Adjust size if needed */
        min-height: 240px;
        max-height: 240px;
    }

.listing-card:hover {
    transform: translateY(-5px);
}

/* Header */
.listing-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}


.nav-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

/* Battle Info */
.host-name {
    font-size: 18px;
    font-weight: bold;
}

.wager {
    font-size: 16px;
    margin: 10px 0;
    position: relative;
    display: flex;
    justify-content: center;  /* Center horizontally */
    align-items: center;
}

/* Button */
.create-btn {
    background: #5de33f;
    position: relative;
    top: -75px;
    right: -570px;
    color: #222;
    padding: 10px 15px;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    width: 120px;
    transition: background 0.2s;
    margin-right: 10px;
    margin-left: 10px;

}
.create-btn:hover{
    color: #d9534f;
    transform: scale(105%);

}
.leaderboard-button {
      position: relative;
      top: -75px;
      left: -280px;
      background: none;
      font-weight: bold;
      color: #8e918e;
      padding: 10px 15px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      width: 150px;
      transition: background 0.2s;
      margin-right: 10px;
      margin-left: 10px;

  }.leaderboard-button:hover {
       color: red;
       transform: scale(105%);


   }
.mypvphistory-button {
    position: relative;
    top: -75px;
    left: -300px;
    background: none;
    font-weight: bold;
    color: #8e918e;
    padding: 10px 15px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    width: 200px;
    transition: background 0.2s;
    margin-right: 10px;
    margin-left: 10px;

}.mypvphistory-button:hover {
     color: red;
     transform: scale(105%);


 }
.history-btn {
  background: #a3a1a1;
  position: relative;
  top: -75px;
  right: -560px;
  font-weight: bold;
  color: #ffffff;
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  width: 130px;
  transition: background 0.2s;
  margin-right: 10px;
  margin-left: 10px;
}
.history-btn:hover{
    transform: scale(105%);
    color:red;

}
.join-btn {
    background: #ffdb4d;

    color: #222;
    padding: 10px 15px;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    width: 120px;
    transition: background 0.2s;
    margin-right: 10px;
    margin-left: 10px;
}

.join-btn:hover {
    background: #ffdb4d;

}

/* No Listings Message */
.no-listing {
    text-align: center;
    font-size: 18px;
    color: gray;
    margin-top: 20px;
}
.nav-icon{
    height: 60px;
    width: 120px;
    object-fit: contain;
}
.pvpresult {
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 50px;
}
/* Selected Play & Bet Highlight */
.selected {
    border: 2px solid green;
    background-color: lightgreen;
}
.bet-header {
    position: absolute;
    top:    485px;
    color: white;
}

/* Styling for Bet Selection */
.bet-selection-list {
    display: flex;
    position: fixed;
    justify-content: center;
    gap: 10px;
    margin-top: 75px;
}

.bet-option {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border: 1px solid #000;
    border-radius: 5px;
    transition: all 0.2s;
}

.bet-option:hover {
    background-color: #ddd;
}
.overlay-history {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.popup-history {
  background: linear-gradient(45deg, #373737 60%, #8f8f8f);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    max-width: 800px;
    min-width: 800px;
    animation: fadeIn 0.3s ease-in-out;
    min-height: 400px;
    max-height: 400px;
  color: whitesmoke;

}
.popup-header {
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
    margin-bottom: 10px;
  color: whitesmoke;
}
.show-history-close-btn {
    position: relative;
    top: 340px;
    right: 80px;
    background: red;
    color: white;
    border: none;
    padding: 5px 6px;
    cursor: pointer;
    border-radius: 5px;
}
.market-history-container{
    min-height:280px;
    max-height: 280px;
    overflow-x: hidden;
    overflow-y: auto;
}
.market-history-table {
    width: 100%;
    border-collapse: collapse;
    border: none;

}

.market-history-table th{
    position: sticky;
    top: 0;
    background: grey;
    z-index: 10;
    padding: 10px;
    text-align: center;
    border-bottom: 2px solid #ddd;
}
.market-history-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
    text-align: center;
    border: none;

}


.leaderboard-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6); /* Dark overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;

}
.leaderboard-popup * {
  pointer-events: auto;
}

.leaderboard-container {
  background: linear-gradient(45deg, #121111 1%, #8f8f8f);
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  text-align: center;
  position: relative;
  z-index: 1000;
}

/* Close button */
.leaderboard-close-button {
  margin-top: 15px;
  padding: 8px 15px;
  background: red;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.leaderboard-close-button:hover {
  background: darkred;
}

.leaderboard-title {
  margin-bottom: 10px;
  color: whitesmoke;
}

/* Podium styling */
.leaderboard-podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-bottom: 20px;
  gap: 10px;
  height: 150px;
}

.leaderboard-first,
.leaderboard-second,
.leaderboard-third {
  text-align: center;
  width: 100px;
  border-radius: 10px;
  padding: 10px;
  font-weight: bold;
  color: white;

}

.leaderboard-first {
background: gold;
  height: 160px;
  width: 120px;
  color: white; /* Ensures text is readable on black */
}

.leaderboard-second {
  background-color: silver;
  height: 130px;
  width: 120px;
}

.leaderboard-third {
  background-color: #cd7f32;
  height: 110px;
  width: 120px;
}

.leaderboard-rank {
  font-size: .75rem !important;
  font-family: Soleil, sans-serif !important;

  position: relative;
  top:-10px;
  font-weight: bold;
  font-variant-caps: normal;
  color: black;
  font-family: "Brush Script MT";
  font-weight: bold;


}

.leaderboard-name {
  font-size: 18px;
  position: relative;
  top:-15px;
  text-transform: uppercase;
  color: black;
  font-family: "Brush Script MT";
  font-weight: bold;
}

.leaderboard-wins,
.leaderboard-money {
  font-size: 14px;
  position: relative;
  top:-20px;
  text-transform: uppercase;
  color: black;
  font-family: "Brush Script MT";
  font-weight: bold;
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  color: whitesmoke;
}

.leaderboard-table th,
.leaderboard-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.leaderboard-close-button {
  margin-top: 10px;
  background-color: red;
  color: white;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}
.sortingbet{
  position: absolute;
  top: 230px;
  left: 59%;
  transform: translateX(-50%);
  height: 100px;
  z-index: 2;
  color: whitesmoke;
  font-size: 16px;
}
</style>

