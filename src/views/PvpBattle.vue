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
        async handleSelectPlay(play) {
          if (confirm(`Are you sure you want to select "${play}"?`)) {
            this.playConfirmed = true;

            // player's chosen play
            this.selectedPlay = play;

            // submit player choice
            await this.pvpStore.selectPlay(play, this.selectedPvpId);

            // fetch host play and store it separately
            const hostPlayData = await this.pvpStore.fetchHostPlay(this.selectedPvpId);

            if (hostPlayData) {
              this.selectedPvpIdHostPlay = hostPlayData.host_play;
            }
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
             this.selectedPvpIdHostPlay = null;




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


  <!-- Main Container -->
  <div class="px-4 py-6">
    <div class="mx-auto max-w-7xl">
      <h2 class="mb-6 text-center text-2xl font-bold text-white sm:text-3xl">
        PVP BATTLES
      </h2>

      <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <!-- LEFT SIDE -->
        <div class="flex flex-wrap gap-2">
          <button
              @click="toggleLeaderboard()"
              class="rounded-lg bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-400"
          >
            🏆 Leaderboard
          </button>

          <button
              @click="showHistoryModal()"
              class="rounded-lg bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600"
          >
            ⓘ PVP Battle Logs
          </button>

          <button
              @click="showMyHistoryModal()"
              class="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700"
          >
            My PVP History
          </button>
        </div>

        <!-- RIGHT SIDE -->
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">

          <!-- Sort -->
          <div class="flex items-center gap-2">
            <label for="sortAmount" class="text-sm text-white">Sort:</label>
            <select
                id="sortAmount"
                v-model="sortAmount"
                class="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-red-400"
            >
              <option value="0">All</option>
              <option value="100">100</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
              <option value="2000">2000</option>
            </select>
          </div>

          <!-- Create Battle -->
          <button
              class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              @click="showCreateBattleModal = true"
          >
            Create Battle
          </button>
        </div>

      </div>

      <!-- Battle List -->
      <div
          v-if="pvpbattles.length > 0"
          class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div
            v-for="pvp in sortedBattles"
            :key="pvp.id"
            class="rounded-2xl border border-gray-700 bg-gray-800 p-4 shadow-lg"
        >
          <div class="mb-3">
            <h2 class="text-lg font-semibold text-white">
              Host: {{ shortenHostname(pvp.user.first_name) }}
            </h2>
          </div>

          <div class="mb-4 flex justify-center">
            <img
                src="../assets/pvpgame.png"
                alt="Market"
                class="h-28 w-auto rounded-lg object-contain sm:h-32"
            />
          </div>

          <div class="flex flex-col gap-4">
            <p class="flex items-center justify-center gap-2 text-lg font-bold text-yellow-400">
              <img
                  alt="Coin Image"
                  class="h-7 w-7"
                  src="/src/assets/rotating-coin.gif"
              />
              {{ pvp.money_betted }}
            </p>

            <button
                class="rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600"
                @click="handleJoin(user.id, pvp.id, pvp.money_betted, pvp.user.first_name)"
            >
              Join Battle
            </button>
          </div>
        </div>
      </div>

      <p v-else class="text-center text-sm text-gray-300 sm:text-base">
        No active listings available.
      </p>
    </div>
  </div>

  <!-- Global History Modal -->
  <div
      v-if="showHistory"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
  >
    <div class="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-gray-900 shadow-2xl">
      <div class="flex items-center justify-between border-b border-gray-700 px-4 py-4 sm:px-6">
        <h3 class="text-lg font-bold text-white sm:text-xl">PVP BATTLES History</h3>
        <button
            class="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            @click="closeHistoryModal()"
        >
          Close
        </button>
      </div>

      <div class="p-4 sm:p-6">
        <div v-if="loading" class="text-center text-white">Loading history...</div>

        <div v-else-if="pvphistory.length > 0" class="overflow-x-auto">
          <table class="min-w-full border-collapse text-sm text-white">
            <thead>
            <tr class="bg-gray-800">
              <th class="px-4 py-3 text-left">Host</th>
              <th class="px-4 py-3 text-left">Versus</th>
              <th class="px-4 py-3 text-left">Opponent</th>
              <th class="px-4 py-3 text-left">Bet</th>
              <th class="px-4 py-3 text-left">Winner</th>
              <th class="px-4 py-3 text-left">Date</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="pvp in pvphistory"
                :key="pvp.id"
                class="border-t border-gray-700"
            >
              <td class="px-4 py-3">{{ pvp.hostname }}</td>
              <td class="px-4 py-3">VS</td>
              <td class="px-4 py-3">{{ pvp.opponentname }}</td>
              <td class="px-4 py-3">{{ pvp.money_betted }}</td>
              <td class="px-4 py-3">{{ pvp.winnername }}</td>
              <td class="px-4 py-3">{{ pvp.battletime }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center text-gray-300">No history available.</div>
      </div>
    </div>
  </div>

  <!-- My History Modal -->
  <div
      v-if="showMyHistory"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
  >
    <div class="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-gray-900 shadow-2xl">
      <div class="flex items-center justify-between border-b border-gray-700 px-4 py-4 sm:px-6">
        <h3 class="text-lg font-bold text-white sm:text-xl">My PVP History</h3>
        <button
            class="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            @click="closeMyHistoryModal()"
        >
          Close
        </button>
      </div>

      <div class="p-4 sm:p-6">
        <div v-if="loading" class="text-center text-white">Loading history...</div>

        <div v-else-if="mypvphistory.length > 0" class="overflow-x-auto">
          <table class="min-w-full border-collapse text-sm text-white">
            <thead>
            <tr class="bg-gray-800">
              <th class="px-4 py-3 text-left">Host</th>
              <th class="px-4 py-3 text-left">Versus</th>
              <th class="px-4 py-3 text-left">Opponent</th>
              <th class="px-4 py-3 text-left">Bet</th>
              <th class="px-4 py-3 text-left">Result</th>
              <th class="px-4 py-3 text-left">Date</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="mypvp in mypvphistory"
                :key="mypvp.id"
                class="border-t border-gray-700"
            >
              <td class="px-4 py-3">
                {{ mypvp.host_id === authStore.user.id ? 'You' : mypvp.hostname }}
              </td>
              <td class="px-4 py-3">VS</td>
              <td class="px-4 py-3">
                {{ mypvp.opponent_id === authStore.user.id ? 'You' : mypvp.opponentname }}
              </td>
              <td class="px-4 py-3">{{ mypvp.money_betted }}</td>
              <td class="px-4 py-3">{{ mypvp.result }}</td>
              <td class="px-4 py-3">{{ mypvp.battletime }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center text-gray-300">No history available.</div>
      </div>
    </div>
  </div>





  <!-- Modal For Picking a Play opponents joining a Battle -->
  <div
      v-if="showPickPlayModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
  >
    <div class="w-full max-w-4xl rounded-2xl bg-gray-900 p-4 text-white shadow-2xl sm:p-6">
      <!-- Header -->
      <div class="mb-6 flex flex-col gap-3 border-b border-gray-700 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-lg font-bold sm:text-xl">Select your Play</h3>
          <p class="mt-1 text-sm text-gray-300">
            {{ selectedPvpUsername.toLowerCase() }} vs {{ user.username.toLowerCase() }}
          </p>
        </div>

        <button
            class="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            @click="handleClose()"
        >
          Close
        </button>
      </div>

      <!-- Main Content -->
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Preview Area -->
        <div class="flex flex-col items-center justify-center gap-4 rounded-xl bg-gray-800 p-4">
          <img
              class="h-28 w-28 object-contain sm:h-36 sm:w-36"
              :src="playImages[selectedPvpIdHostPlay  || 'Default']"
              alt="Host Play"
          />

          <p class="text-sm text-gray-400">VS</p>

          <img
              class="h-28 w-28 object-contain sm:h-36 sm:w-36"
              :src="hoveredPlay ? playImages[hoveredPlay] : playImages['Default']"
              alt="Opponent Play"
          />

          <p class="text-base font-semibold text-yellow-400">
            Bet: {{ selectedPvpMoneybetted }}
          </p>

          <p class="min-h-[24px] text-center text-sm font-medium text-green-400">
            {{ pvpStore.winMessage }}
          </p>
        </div>

        <!-- Options -->
        <div>
          <div v-if="!playConfirmed" class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
                @mouseover="hoveredPlay = 'Rock'"
                @mouseleave="hoveredPlay = null"
                @click="handleSelectPlay('Rock')"
                class="flex flex-col items-center rounded-xl border border-gray-700 bg-gray-800 p-4 transition hover:border-red-400 hover:bg-gray-700"
            >
              <img :src="playImages['Rock']" alt="Rock" class="mb-2 h-16 w-16 object-contain" />
              <h3 class="font-semibold">Rock</h3>
            </button>

            <button
                @mouseover="hoveredPlay = 'Paper'"
                @mouseleave="hoveredPlay = null"
                @click="handleSelectPlay('Paper')"
                class="flex flex-col items-center rounded-xl border border-gray-700 bg-gray-800 p-4 transition hover:border-red-400 hover:bg-gray-700"
            >
              <img :src="playImages['Paper']" alt="Paper" class="mb-2 h-16 w-16 object-contain" />
              <h3 class="font-semibold">Paper</h3>
            </button>

            <button
                @mouseover="hoveredPlay = 'Scissor'"
                @mouseleave="hoveredPlay = null"
                @click="handleSelectPlay('Scissor')"
                class="flex flex-col items-center rounded-xl border border-gray-700 bg-gray-800 p-4 transition hover:border-red-400 hover:bg-gray-700"
            >
              <img :src="playImages['Scissor']" alt="Scissors" class="mb-2 h-16 w-16 object-contain" />
              <h3 class="font-semibold">Scissor</h3>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal For Picking a Play & Bet (Create Battle) -->
  <div
      v-if="showCreateBattleModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      @click.self="showCreateBattleModal = false"
  >
    <div class="w-full max-w-3xl rounded-2xl bg-gray-900 p-4 text-white shadow-2xl sm:p-6">
      <!-- Header -->
      <div class="mb-6 flex flex-col gap-3 border-b border-gray-700 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 class="text-lg font-bold sm:text-xl">CREATING A PVP BATTLE</h3>
        <button
            class="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            @click="showCreateBattleModal = false"
        >
          Close
        </button>
      </div>

      <!-- Play Selection -->
      <h3 class="mb-3 text-base font-semibold sm:text-lg">Choose Your Play</h3>
      <div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
            @click="selectedPlay = 'Rock'"
            class="flex flex-col items-center rounded-xl border p-4 transition"
            :class="selectedPlay === 'Rock'
          ? 'border-red-400 bg-red-500/10'
          : 'border-gray-700 bg-gray-800 hover:bg-gray-700'"
        >
          <img src="../assets/rock.png" alt="Rock" class="mb-2 h-16 w-16 object-contain" />
          <h3 class="font-semibold">Rock</h3>
        </button>

        <button
            @click="selectedPlay = 'Paper'"
            class="flex flex-col items-center rounded-xl border p-4 transition"
            :class="selectedPlay === 'Paper'
          ? 'border-red-400 bg-red-500/10'
          : 'border-gray-700 bg-gray-800 hover:bg-gray-700'"
        >
          <img src="../assets/paper.png" alt="Paper" class="mb-2 h-16 w-16 object-contain" />
          <h3 class="font-semibold">Paper</h3>
        </button>

        <button
            @click="selectedPlay = 'Scissor'"
            class="flex flex-col items-center rounded-xl border p-4 transition"
            :class="selectedPlay === 'Scissor'
          ? 'border-red-400 bg-red-500/10'
          : 'border-gray-700 bg-gray-800 hover:bg-gray-700'"
        >
          <img src="../assets/scissor.png" alt="Scissors" class="mb-2 h-16 w-16 object-contain" />
          <h3 class="font-semibold">Scissor</h3>
        </button>
      </div>

      <!-- Bet Selection -->
      <h3 class="mb-3 text-base font-semibold sm:text-lg">Select Your Bet</h3>
      <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
            @click="selectedBet = 100"
            class="rounded-xl border px-4 py-3 font-semibold transition"
            :class="selectedBet === 100
          ? 'border-yellow-400 bg-yellow-500/10 text-yellow-400'
          : 'border-gray-700 bg-gray-800 hover:bg-gray-700'"
        >
          100
        </button>

        <button
            @click="selectedBet = 500"
            class="rounded-xl border px-4 py-3 font-semibold transition"
            :class="selectedBet === 500
          ? 'border-yellow-400 bg-yellow-500/10 text-yellow-400'
          : 'border-gray-700 bg-gray-800 hover:bg-gray-700'"
        >
          500
        </button>

        <button
            @click="selectedBet = 1000"
            class="rounded-xl border px-4 py-3 font-semibold transition"
            :class="selectedBet === 1000
          ? 'border-yellow-400 bg-yellow-500/10 text-yellow-400'
          : 'border-gray-700 bg-gray-800 hover:bg-gray-700'"
        >
          1000
        </button>

        <button
            @click="selectedBet = 2000"
            class="rounded-xl border px-4 py-3 font-semibold transition"
            :class="selectedBet === 2000
          ? 'border-yellow-400 bg-yellow-500/10 text-yellow-400'
          : 'border-gray-700 bg-gray-800 hover:bg-gray-700'"
        >
          2000
        </button>
      </div>

      <button
          class="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
          @click="handleCreateBattle(selectedPlay, selectedBet)"
      >
        Confirm Battle
      </button>
    </div>
  </div>

  <!-- Leaderboard -->
  <div
      v-if="showLeaderboard"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      @click.self="toggleLeaderboard"
  >
    <div class="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-gray-900 p-4 text-white shadow-2xl sm:p-6">
      <button
          @click="toggleLeaderboard"
          class="absolute right-4 top-4 text-gray-400 hover:text-white text-2xl font-bold"
      >
        ✕
      </button>
      <h2 class="mb-6 text-center text-2xl font-bold">Most Wins Leaderboard</h2>

      <!-- Podium -->
      <div class="mb-8 grid gap-4 md:grid-cols-3">
        <div
            v-if="leaderboard.length >= 2"
            class="rounded-2xl bg-gray-800 p-4 text-center shadow-lg"
        >
          <p class="text-sm text-gray-400">Rank #2</p>
          <p class="mt-2 text-lg font-bold">{{ shorten(leaderboard[1].first_name) }}</p>
          <p class="text-yellow-400">{{ leaderboard[1].wins }} Wins</p>
          <p class="text-green-400">${{ leaderboard[1].total_money_won }}</p>
        </div>

        <div
            v-if="leaderboard.length >= 1"
            class="rounded-2xl border-2 border-yellow-400 bg-gray-800 p-5 text-center shadow-xl"
        >
          <p class="text-sm text-yellow-400">Rank #1</p>
          <p class="mt-2 text-xl font-bold">{{ shorten(leaderboard[0].first_name) }}</p>
          <p class="text-yellow-300">{{ leaderboard[0].wins }} Wins</p>
          <p class="text-green-400">${{ leaderboard[0].total_money_won }}</p>
        </div>

        <div
            v-if="leaderboard.length >= 3"
            class="rounded-2xl bg-gray-800 p-4 text-center shadow-lg"
        >
          <p class="text-sm text-gray-400">Rank #3</p>
          <p class="mt-2 text-lg font-bold">{{ shorten(leaderboard[2].first_name) }}</p>
          <p class="text-yellow-400">{{ leaderboard[2].wins }} Wins</p>
          <p class="text-green-400">${{ leaderboard[2].total_money_won }}</p>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse text-sm text-white">
          <thead>
          <tr class="bg-gray-800">
            <th class="px-4 py-3 text-left">Rank</th>
            <th class="px-4 py-3 text-left">Username</th>
            <th class="px-4 py-3 text-left">Wins</th>
            <th class="px-4 py-3 text-left">Total Money Won</th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="(player, index) in leaderboard.slice(0)"
              :key="player.id"
              class="border-t border-gray-700"
          >
            <td class="px-4 py-3">{{index+1}}</td>
            <td class="px-4 py-3">{{ player.first_name }}</td>
            <td class="px-4 py-3">{{ player.wins }}</td>
            <td class="px-4 py-3">${{ player.total_money_won }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>



