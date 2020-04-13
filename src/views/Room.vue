<template>
  <div>
  <div class="room">
    <!-- <b-alert
        class="fixed-bottom m-0 rounded-0"
        variant="light"
        dismissible
        show
        > <a href="https://www.paypal.me/KevinShaffer" target="_blank" style="color:gray">Donate to help with hosting</a>
    </b-alert> -->
    <h5 class="header" v-if="winner">
        {{ winner }} wins!
    </h5>
    <b-row>
        <b-col>
            <h2 :class="`${turn}-team`" class="header">
                {{turn}}'s turn 
            </h2>
            <h5>
                <template v-if="clock && timer">
                    {{clock}} 
                    <template v-if="Number(clock)">
                        second<template v-if="clock!=1">s</template>
                    </template>
                </template>
            </h5>
        </b-col>
    </b-row>
    <b-row>
        <b-col sm="2">
            <hr>
            <h2> Score </h2>
            <b-row>
                <b-col>
                    <h5 class="red-team">Red: <span> {{score.red}}</span></h5>
                </b-col>
                <b-col>
                    <h5 class="blue-team">Blue: <span> {{score.blue}}</span></h5>
                </b-col>
            </b-row>
            
            <hr>

            <h3> Players </h3>
            <b-row>
                <b-col class="red-team">
                    <h5 class="pointer" @click="remoteUpdatePlayer({id: myPlayerId, team:'red'})"> Red </h5>
                    <hr>
                    <div v-for="player in redTeam" :key="player.id">
                        <font-awesome-icon v-if="player.role=='spyMaster'" icon="user-secret" />&nbsp;
                        <span 
                            class="player" 
                            :class="player.id === myPlayerId ? 'me' : ''"
                        >
                            {{player.name}}
                        </span>
                    </div>
                    <div v-if="myTeam != 'red'">
                        <i class="pointer" @click="remoteUpdatePlayer({id: myPlayerId, team:'red'})">
                            <small>(Join Red)
</small>                        </i>
                    </div>
                </b-col>
                <b-col class="blue-team">
                    <h5 class="pointer" @click="remoteUpdatePlayer({id: myPlayerId, team:'blue'})"> Blue </h5>
                    <hr>
                    <div v-for="player in blueTeam" :key="player.id">
                        <font-awesome-icon v-if="player.role=='spyMaster'" icon="user-secret" />&nbsp;
                        <span 
                            class="player" 
                            :class="player.id === myPlayerId ? 'me' : ''"
                        >
                            {{player.name}}
                        </span>
                    </div>
                    <div v-if="myTeam != 'blue'">
                        <i class="pointer" @click="remoteUpdatePlayer({id: myPlayerId, team:'blue'})">
                            <small>(Join Blue)</small>
                        </i>
                    </div>
                </b-col>
            </b-row>
            <hr>
            <b-row >
                <b-col>
                    <h5 class="pointer" @click="remoteUpdatePlayer({id: myPlayerId, team:'audience'})"> Audience </h5>
                    <div v-for="player in audience" :key="player.id">
                        <font-awesome-icon v-if="player.role=='spyMaster'" icon="user-secret" />&nbsp;
                        <span 
                            class="player" 
                            :class="player.id === myPlayerId ? 'me' : ''"
                        >
                            {{player.name}}
                        </span>
                    </div>
                    <div v-if="![null, undefined, 'audience'].includes(myTeam)">
                        <i class="pointer" @click="remoteUpdatePlayer({id: myPlayerId, team:'audience'})">
                            <small>(Join Audience)</small>
                        </i>
                    </div>
                </b-col>
            </b-row>

            <hr>

            <b-row>
                <b-col>
                    <label for="myName">Update Your Name:</label>
                    <input @change="remoteUpdatePlayer({id: myPlayerId, name:initName})" type="text" class="form-control" name="initName" v-model="initName">
                </b-col>
            </b-row>
            <br>
            <b-row>
                <b-col>
                    <b-button 
                        :variant="myRole=='spyMaster' ? 'dark' : 'outline-dark'" 
                        @click="remoteUpdatePlayer({id: myPlayerId, role:'spyMaster'})"
                    >Spy Master
                    </b-button>
                    <b-button 
                        :variant="myRole=='spyMaster' ? 'outline-dark' : 'dark'" 
                        @click="remoteUpdatePlayer({id: myPlayerId, role:'peasant'})"
                    >Peasant
                    </b-button>
                </b-col>
            </b-row>
            <hr>
            <b-button class="mt-2" variant="danger" @click="newGame()">New Game</b-button>
        </b-col>

        <b-col sm="8">
            <hr>
            <div class="board">
                <b-row v-for="(row,i) in board.values" :key="i">
                    <b-col sm v-for="(col,j) in row" :key="`${i}${j}`">
                            <div
                                @click="selectSquare(i,j)"
                                class="square"
                                :class="tileClass(board.state[i][j], board.owner[i][j])"
                            >
                                <!-- TODO: clean this logic up? -->
                                <span 
                                    v-if="col.includes(stylingSeparator)" 
                                    :class="col.split(stylingSeparator).slice(0)[0]" 
                                    class="word"
                                >
                                    {{ col.split(stylingSeparator).slice(-1)[0] }}
                                </span>
                                <span v-else class="word">{{ col }}</span>
                            </div>
                    </b-col>
                </b-row>
            </div>
            <b-button 
                v-if="myTeam == turn || (timer && clock == 'Time\'s Up!')"
                block
                :variant="turn == 'red' ? 'outline-danger':'outline-primary'"  
                @click="endTurn"
            >End Turn</b-button>
        </b-col>
        <b-col sm="2">
            <hr>
            <b-row>
                <b-col>
                    <h4>Timer</h4>
                    <br>
                    <template v-if="timerOn">
                        <span v-if="clock && timer" :class="`${turn}-team`">
                            {{clock}} 
                            <template v-if="Number(clock)">
                                second<template v-if="clock!=1">s</template>
                            </template>
                        </span>
                        <b-form-input @touchend="setTimer(timerInput)" @mouseup="setTimer(timerInput)" id="timerInput" v-model="timerInput" type="range" min="30" max="330" step="30"></b-form-input>
                        <div class="mt-2">Round Timer: {{ timerInput/60 }} minutes</div>
                        <br>
                    </template>
                    <b-button :variant="timerOn ? 'dark' : 'outline-dark'" @click="activateTimer(true)">On</b-button>
                    <b-button :variant="timerOn ? 'outline-dark' : 'dark'" @click="activateTimer(false)">Off</b-button>
                </b-col>
            </b-row>
            <hr>
            <h4> Notes </h4>
            <b-textarea placeholder="Take some notes! But remember, these disappear when you refresh the page!" class="notes"></b-textarea>
            <hr>
            <b-row>
                <b-col>
                <h4>Word Packs <small>({{words.length}})</small></h4>
                    <b-form-checkbox-group
                        v-model="selectedWordPacks"
                        :options="wordPacks"
                        :stacked="true"
                        switches
                        size="lg"
                        button-variant="light"
                        class="switches"
                    ></b-form-checkbox-group>
                </b-col>
            </b-row>
            <hr>
            <b-button class="mt-2" variant="dark" @click="remoteRemovePlayer({id: myPlayerId})">Leave Game</b-button>
        </b-col>
    </b-row>

    <div v-if="!myName && !localName" class="overlay">
        <h1>Enter your name </h1>
        <input 
            @change="remoteUpdatePlayer({id: myPlayerId, name: initName})"
            type="text" 
            class="form-control init-name" 
            placeholder="Type your name and press enter" 
            name="initName" 
            v-model="initName"
        >
    </div>
    <div @click="winner = null" v-if="winner">
        <div class="overlay">
            <h1 :class="`${winner}-team header`">
                {{winner}} team wins!
            </h1>
            <h3 class="assassinated" v-if="assassin">
                <br>
                The assassin killed the {{getOtherTeam(winner)}} team...
            </h3>
        <br>
        <h4 class="pointer" @click="newGame">New Game? </h4>
        </div>
    </div>
  </div>
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
    import { v4 as uuidv4 } from 'uuid';
    import functions from '../mixins/functions';
    import database from '../mixins/database';
    import helpers from '../mixins/helpers';
    const wordList = require('../static/words');

    export default {
        mixins: [functions,database,helpers],
        name: 'Room',
        data() {
            return{
               room: null,
               myPlayerId: null,
               docRef: null,
               playerRef: null,
               players: [],
               board: {
                   values: [],
                   state: [],
                   owner: []
               },
               score: {},
               turn: null,
               assassin: false,
               winner: null,
               teams: ['red','blue'],
               initName: null,
               localName: null,
               clockInterval: null,
               clock: null,
               timer: null,
               timerInput: 180,
               timerOn: false,
               timesUp: false,
               words: wordList.find(m=>m.key==='basic').wordList,
               selectedWordPacks: ['basic'],
               masterWordPacks: require('../static/words.json'),
               stylingSeparator: '|',
            }
        },
        created(){
            window.addEventListener('beforeunload', () => {
                this.remoteRemovePlayer({id: this.myPlayerId});
                // this.updateRemoteRoom();
            }, false)
        },
        async mounted() {
            this.words = this.masterWordPacks.find(m=>m.key==='basic').wordList;
            this.room = this.$route.params.room;
            this.injectStyles();
            await this.initUser();
            this.initPlayers();
            await this.initRoom();

        },
        watch: {
            myName(n){
                if (n)
                    this.setUser();
            },
            selectedWordPacks(n){
                this.words = [];
                if (n && n.length > 0){
                    for (let i=0; i<n.length; i++){
                        const wordPack = this.masterWordPacks.find(w=>w.key===n[i]);
                        this.words = this.words.concat(wordPack.wordList.map(word=>`${wordPack.key}${this.stylingSeparator}${word}`));
                    }
                }
                else{ 
                    this.words = this.masterWordPacks.find(w=>w.key==='basic').wordList;
                }
            },
            timer(n, o){
                if (n != o){
                    this.resetTimer(this.timer);
                }
                if (!n){
                    this.timerOn = false;
                }
            },
            turn(n, o){
                if (n != o){
                    this.resetTimer(this.timer);
                }
            }
        },
        computed: {
            wordPacks(){
                return this.masterWordPacks
                    .filter(p=>!p.disabled)
                    .map(p=>{ 
                        return {text: `${p.title} (${p.wordList.length})`, value: p.key}
                });
            },
            blueTeam(){
                return this.players.filter(p=>p.team == 'blue');
            },
            redTeam(){
                return this.players.filter(p=>p.team == 'red');
            },
            audience(){
                return this.players.filter(p=>!['red','blue'].includes(p.team)) || [];
            },
            myTeam(){
                const player = this.players.find(p=>p.id === this.myPlayerId) || {};
                return player.team;
            },
            myRole(){
                const player = this.players.find(p=>p.id === this.myPlayerId) || {};
                return player.role;
            },
            myPlayer(){
                const player = this.players.find(p=>p.id === this.myPlayerId) || {};
                return player;
            },
            myName(){
                const player = this.players.find(p=>p.id === this.myPlayerId) || {};
                return player.name;
            },
            otherTeam(){
                return this.getOtherTeam(this.turn);
            },
        },
        methods: {
            initUser(){
                this.getUser();
            },
            getUser(){
                const id = localStorage.getItem('id');
                if(id){
                    this.myPlayerId = id;
                    this.localName = localStorage.getItem('name') || null;
                }
                else {
                    this.setUser();
                }
            },
            setUser(){
                this.myPlayerId = this.myPlayerId || uuidv4();
                if (this.myPlayerId){
                    localStorage.setItem('id', this.myPlayerId);
                }
                localStorage.setItem('name', this.myName);
            },
            tileClass(state, owner){
                if (this.myRole == 'spyMaster' || state == 'selected'){
                    return `${state} ${owner}`;
                }
                else if (state == 'unselected'){
                    return 'unknown';
                }
            },
            activateTimer(activate, sendToRemote=true){
                this.timerOn = activate;
                if (!this.timerOn){
                    this.timer = null;
                    this.clock = null;
                }
                if (sendToRemote)
                    this.setTimer(!this.timerOn ? null : this.timeInput);
            },
            resetTimer(time){
                this.clock = time;
                clearInterval(this.clockInterval);
                this.clockInterval = setInterval(()=>{
                    this.clock -= 1;
                    if (this.clock <= 0){
                        this.clock = "Time's Up!";
                        clearInterval(this.clockInterval);
                    }
                }, 1000);
            },
            async setTimer(time){
                const data = {
                    timer: time || 'off',
                    lastUpdated: new Date().toISOString(),
                };
                await fb.collection('rooms').doc(this.room).update(data);
            },
            initPlayers(){
                let ref = fb.collection('rooms').doc(this.room).collection('players');
                this.playerRef = ref;
                ref.onSnapshot(this.playersTick);
            },
            playersTick(snapshot){
                snapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        const rec = change.doc.data();
                        rec.docId = change.doc.id;
                        this.players.push(rec);
                    }
                    if (change.type === "modified") {
                        const rec = change.doc.data();
                        const idx = this.players.findIndex(p=>p.id===rec.id);
                        rec.docId = change.doc.id;
                        this.$set(this.players, idx, rec);
                    }
                    if (change.type === "removed") {
                        const idx = this.players.findIndex(p=>p.id===change.doc.data().id);
                        this.players.splice(idx,1);
                    }
                });
            },
            async initRoom(){
                let ref = fb.collection('rooms').doc(this.room);
                this.docRef = ref;
                const room = await ref.get();
                let currentData = room.data();
                // if room doesn't exist, or last activity was more than 12 hours ago.
                if (!room.exists || new Date() - new Date(currentData.lastUpdated) > 4.32e+7){
                    await this.clearRoom();
                    this.newGame();
                }
                else {
                    this.update(currentData);
                }
                this.remoteUpdatePlayer({
                    name: this.$route.params.name || this.localName || this.myName || null,
                    id: this.myPlayerId,
                    role: 'peasant',
                    team: null,
                });
                ref.onSnapshot(this.tick);
            },
            tick(snapshot){
                const data = snapshot.data();
                this.update(data);
            },
            update(data){
                this.updateTurn(data.turn);
                this.updateBoard(data.board);
                this.updateScore(data.score);
                this.updateWinner(data.winner);
                this.updateAssassin(data.assassin);
                this.updateTimer(data.timer);

            },
            // newGame() is in helpers.js
            endTurn(){
                this.remoteChangeTurn({currentTurn: this.turn});
            },
            // Methods to call on tick
            updateTurn(turn){
                this.turn = turn;
            },
            updateBoard(board){
                if (board)
                this.board = JSON.parse(board);
            },
            updateScore(score){
                if (score)
                this.score = score ;
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
            },
            injectStyles(){
                const style = document.createElement("style");
                style.appendChild(document.createTextNode(""));
                document.head.appendChild(style);
                const styleSheet = style.sheet;
                for (let i=0; i<this.masterWordPacks.length; i++){
                    const wordPack = this.masterWordPacks[i];
                    if (wordPack.styles)
                    styleSheet.insertRule(`.${wordPack.key}{${wordPack.styles}}`);
                }
            },
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
    .assassinated {
        color: gray;
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