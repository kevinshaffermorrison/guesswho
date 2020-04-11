<template>
  <div>
      Room: {{ room }}<br>
        <b-row v-for="(row,i) in board.values" :key="i">
            <b-col  sm v-for="(col,j) in row" :key="`${i}${j}`">
                
                <span @click="selectSquare(i,j)" >{{ board.owner[i][j] }} - {{ col }}</span>
            </b-col>
        </b-row>


      {{ score }}<br>
      Winner: {{ winner }}<br>
      Assassin: {{ assassin }}<br>
      Turn: {{ turn }}<br>
      <h2>{{error}}</h2>

      <b-button @click="remoteChangeTurn({currentTurn: turn})">Change Turn from {{turn}}</b-button>
      <b-button @click="newGame()">New Game</b-button>
  </div>
</template>

<script>
/*
    TODO:
        1. Do updates only of the thing that changed, not the whole doc
        2. Do these in transactions
        3. Only have the updates happen with responses from the snapshot
        4. allow for users to kick out other users.
*/
    import fb from '@/firebase/init';
    import functions from '../mixins/functions';
    import database from '../mixins/database';
    import helpers from '../mixins/helpers';
    const wordList = require('../static/words');

    export default {
        mixins: [functions,database, helpers],
        name: 'Room',
        data() {
            return{
                room: 'Kevin2',
                error: null,
                assassin: false,
                winner: null,
                myTeam: 'red',
                teams: ['red','blue'],
                turn: 'red',
                score: {},
                board: {
                    values: [],
                    state: [],
                    owner: []
                },
                timer: null,
                clock: null,
                words: wordList.find(m=>m.key==='basic').wordList,

            }
        },
        async mounted() {
            await this.initRoom();
        },

        methods: {
            async initRoom(){
                let ref = fb.collection('rooms').doc(this.room);
                this.docRef = ref;
                const room = await ref.get();
                if (!room.exists){
                    await ref.set({});
                }
                ref.onSnapshot(this.tick);
            },
            tick(snapshot){
                console.log(snapshot.metadata.hasPendingWrites ? "Local" : "Server");
                const data = snapshot.data();
                this.updateTurn(data.turn);
                this.updateBoard(data.board);
                this.updateScore(data.score);
                this.updatePlayers(data.players);
                this.updateWinner(data.winner);
                this.updateAssassin(data.assassin);
                this.updateTimer(data.timer);
            },
            // newGame() is in helpers.js
            endTurn(){
                this.remoteChangeTurn(this.turn);
            },
            // Methods to call on tick
            updateTurn(turn){
                this.turn = turn;
            },
            updateBoard(board){
                this.board = JSON.parse(board);
            },
            updateScore(score){
                this.score = score;
            },
            updatePlayers(players){
                this.players = players;
            },
            updateWinner(winner){
                this.winner = winner;
            },
            updateAssassin(assassin){
                this.assassin = assassin;
            },
            updateTimer(timer){
                const timerBefore = this.timer;
                this.timer = timer === 'off' ? null : (timer ||  this.timer);
                if (this.timer != timerBefore){
                    this.activateTimer(true, false);
                }
            },
            selectSquare(i,j){
                if (this.turn != this.myTeam || this.winner || this.myRole == 'spyMaster'){
                    return;
                }
                else {
                    this.remoteUpdateBoard(i, j);
                }
            }
        },

    }
</script>
<style>
    .room {
        margin: 12px;
    }
    .notes {
        min-height: 256px !important;
    }
    .header::first-letter{
        text-transform: uppercase;
    }

    .overlay {
        color:white;
        font-weight: bolder;
        position: fixed;
        z-index: 1050;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: black;
        opacity: .9;
        transition: opacity .3s ease;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow-y: auto;
        /* display: flex; */
        flex-direction: column;
        padding: 15px;
        border-radius: 2px;
        margin: auto;
        text-align: left;
    }
    /* probably should do some media queries here */
    .square {
        height: 128px; 
        margin: 4px;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        border: 2px solid;
        border-radius: 10px;
    }
    .word {
        vertical-align: middle;
        display:inline-block;
        font-weight: bold;
        font-size:1.5em;
    }
    .unknown {
        background-color: white;
        color: black;
        cursor: pointer;
    }
    .blue-team {
        color: #11779F;
    }
    .red-team {
        color: #B32728;
    }
    .red {
        background-color: #B32728;
        color: white;
        border-color: rgb(236, 170, 170);
    }
    .red.unselected {
        color: #B32728;
        background-color: rgb(236, 170, 170);
        border-color: #B32728;
    }
    .blue {
        background-color: #11779F;
        color: white;
        border-color: rgb(168, 216, 235);
    }
    .blue.unselected {
        color: #11779F;
        background-color: rgb(168, 216, 235);
        border-color: #11779F;
    }
    .neutral {
        background-color: rgb(211, 191, 175);
        color:white;
        border-color: rgb(148, 134, 123);
    }
    .neutral.unselected {
        color: black;
        background-color: white;
        border-color: rgb(211, 191, 175);
    }
    .assassin {
        background-color: black;
        color: white;
    }
    .assassin.unselected {
        background-color: #686c6d;
        color: black;
    }
    .pointer {
        cursor: pointer;
    }
    .me {
        font-style: italic;
        font-weight: bolder;
    }
    .player {
        line-height: 1em;
    }
    .init-name {
        background-color:transparent !important; 
        color: white !important;
        left: 25% !important;
        right: 25% !important;
        width: 50% !important;
    }
    .switches {
        text-align: left;
    }
    .custom-control-input:checked~.custom-control-label::before {
        border-color: black !important;
        background-color: black !important;
    }
</style>