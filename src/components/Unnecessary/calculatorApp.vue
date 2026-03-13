<script>
import router from "@/router/index.js";

export default {
name: "calculatorApp",
data() {
    return {
        currentinput: "0",
        storedinput: "0",
        total: "0",
        operator: ""
    };

},
    computed: {

    },
    methods : {
        appendInput(value) {
            if (value === "." && this.currentinput.includes(".")) return;
            this.currentinput += value.toString();

        },
        setOperator(operator) {
            if (this.operator) {
                this.calculateResult();
            }
            this.storedinput = this.currentinput;
            this.operator = operator;
            this.currentinput = "0";
        },
        clearInput() {
            this.currentinput = "0";
            this.total = 0;
            this.storedinput = 0;
            this.operator = "";

        },
        result(){
            this.total = eval((parseFloat(this.storedinput)) + this.operator + (parseFloat(this.currentinput)));
            this.total = parseFloat(this.total.toFixed(2));
            this.currentinput = this.total;
            this.operator = "";

        }


    },

};

</script>

<template>

    <div class ="back"> <RouterLink to="/" class="btn back">Go Back</RouterLink></div>
    <div class="calculator">

        <div class="screen">
            <input type="text" v-model="currentinput" class="display" disabled  />
        </div>
        <div class="buttons">
            <button @click="clearInput" class="btn clear">C</button>
            <button @click="setOperator('/')" class="btn operator">÷</button>
            <button @click="setOperator('*')" class="btn operator">×</button>
            <button @click="setOperator('-')" class="btn operator">−</button>

            <button @click="appendInput('7')" class="btn">7</button>
            <button @click="appendInput('8')" class="btn">8</button>
            <button @click="appendInput('9')" class="btn">9</button>
            <button @click="setOperator('+')" class="btn operator">+</button>

            <button @click="appendInput('4')" class="btn">4</button>
            <button @click="appendInput('5')" class="btn">5</button>
            <button @click="appendInput('6')" class="btn">6</button>
            <button @click="result" class="btn equal">=</button>

            <button @click="appendInput('1')" class="btn">1</button>
            <button @click="appendInput('2')" class="btn">2</button>
            <button @click="appendInput('3')" class="btn">3</button>

            <button @click="appendInput('0')" class="btn zero">0</button>
            <button @click="appendInput('.')" class="btn">.</button>
        </div>
    </div>
</template>

<style scoped>
.calculator {
    width: 300px;
    padding: 20px;
    border-radius: 10px;
    background: #2c3e50;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    text-align: center;
    margin-top: 100px;
    display: flex;
    flex-direction: column;
}
.back {
    position: absolute;
    top: 100px;
    right: 20px;
}

.btn.back {
    background-color: #449779; /* Red color */
    color: white;
    padding: 10px 15px;
    font-size: 1rem;
    border-radius: 5px;
    text-decoration: none;
    width: 100px;
    display: inline-block;
    transition: background 0.3s;
}

.btn.back:hover {
    background-color: #1d452c; /* Darker red on hover */
}


.screen {
    background: #ecf0f1;
    padding: 15px;
    border-radius: 8px;
    text-align: right;
    margin-bottom: 10px;
    font-size: 1.5rem;
    font-weight: bold;
}

.current {
    color: #34495e;
}
.result {
    color: #27ae60;
    font-size: 1.2rem;
}

.buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
}

.btn {
    background: #34495e;
    color: #fff;
    border: none;
    padding: 15px;
    font-size: 1.2rem;
    border-radius: 5px;
    cursor: pointer;
    transition: 0.3s;
}

.btn:hover {
    background: #1abc9c;
}

.clear {
    background: #e74c3c;
}

.operator {
    background: #f39c12;
}

.equal {
    background: #2ecc71;
    grid-row: span 2;
}

.zero {
    grid-column: span 2;
}
.display{
    border: none;
    background-color: #ecf0f1;
    height: 70px;
    width: 230px;
    //margin-left: 50px;
    margin-right: 0px;
    font-size: 40px;
}
</style>
