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
    <h5 class="header" v-if="result.winner">
        {{ result.message }}
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
                    <h5 class="pointer" @click="update({player:{team:'red'}})"> Red </h5>
                    <hr>
                    <div v-for="player in redTeam" :key="player.id">
                        <font-awesome-icon v-if="player.role=='spyMaster'" icon="user-secret" />&nbsp;
                        <p class="player" :class="player.id === myPlayerId ? 'me' : ''">{{player.name}}</p>
                    </div>
                </b-col>
                <b-col class="blue-team">
                    <h5 class="pointer" @click="update({player:{team:'blue'}})"> Blue </h5>
                    <hr>
                    <div v-for="player in blueTeam" :key="player.id">
                        <font-awesome-icon v-if="player.role=='spyMaster'" icon="user-secret" />&nbsp;
                        <p class="player" :class="player.id === myPlayerId ? 'me' : ''">{{player.name}}</p>
                    </div>
                </b-col>
            </b-row>
            <b-row v-if="audience.length > 0">
                <b-col>
                    <h5 class="pointer" @click="update({player:{team:'audience'}})"> Audience </h5>
                    <hr>
                    <div v-for="player in audience" :key="player.id">
                        <font-awesome-icon v-if="player.role=='spyMaster'" icon="user-secret" />&nbsp;
                        <p class="player" :class="player.id === myPlayerId ? 'me' : ''">{{player.name}}</p>
                    </div>
                </b-col>
            </b-row>

            <hr>

            <b-row>
                <b-col>
                    <label for="myName">Update Your Name:</label>
                    <input @change="update({player: {name: myName}})" type="text" class="form-control" name="myName" v-model="myName">
                </b-col>
            </b-row>
            <br>
            <b-row>
                <b-col>
                    <b-button 
                        :variant="myRole=='spyMaster' ? 'dark' : 'outline-dark'" 
                        @click="update({player:{role:'spyMaster'}})"
                    >Spy Master
                    </b-button>
                    <b-button 
                        :variant="myRole=='spyMaster' ? 'outline-dark' : 'dark'" 
                        @click="update({player:{role:'peasant'}})"
                    >Peasant
                    </b-button>
                </b-col>
            </b-row>
            <hr>
            <b-button class="mt-2" variant="danger" @click="update({newGame: true})">New Game</b-button>
        </b-col>

        <b-col sm="8">
            <hr>
            <div class="board">
                <b-row v-for="(row,i) in board.values" :key="i">
                    <b-col sm v-for="(col,j) in row" :key="`${i}${j}`">
                            <div
                                @click="update({click: {i,j}})"
                                class="square"
                                :class="tileClass(board.state[i][j], board.owner[i][j])"
                            >
                                <span class="word">{{ col }}</span>
                            </div>
                    </b-col>
                </b-row>
            </div>
            <b-button 
                v-if="myTeam == turn || (timer && clock == 'Time\'s Up!')"
                block
                :variant="turn == 'red' ? 'outline-danger':'outline-primary'"  
                @click="update({endTurn:true})"
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
                        :stacked="false"
                        buttons
                        button-variant="light"
                    ></b-form-checkbox-group>
                </b-col>
            </b-row>
            <hr>
            <b-button class="mt-2" variant="dark" @click="update({removePlayer: true})">Leave Game</b-button>
        </b-col>
    </b-row>

    <div v-if="!myName" class="overlay">
        <h1>Enter your name </h1>
        <input 
            @change="update({player: {name: initName}})"
            type="text" 
            class="form-control init-name" 
            placeholder="Type your name and press enter" 
            name="initName" 
            v-model="initName"
        >
    </div>
    <div @click="result.winner = null" v-if="result.winner">
        <div class="overlay">
            <h1 :class="`${result.winner}-team header`">{{ result.message }}</h1>
        <br>
        <h4 class="pointer" @click="update({newGame: true})">New Game? </h4>
        </div>
    </div>
  </div>
  </div>
</template>

<script>
    import fb from '@/firebase/init';
    const shuffle = require('lodash.shuffle');
    import { v4 as uuidv4 } from 'uuid';
    import functions from '../mixins/functions';

    export default {
        mixins: [functions],
        name: 'Room',
        data() {
            return{
               room: null,
               myName: null,
               myPlayerId: null,
               players: [],
               board: {
                   values: [],
                   state: [],
                   owner: []
               },
               score: {},
               turn: null,
               assassin: false,
               result: {
                   "message": null,
                   "winner": null,
               },
               teams: ['red','blue'],
               initName: null,
               clockInterval: null,
               clock: null,
               timer: null,
               timerInput: 180,
               timerOn: false,
               timesUp: false,
               wordPacks: [{text: 'Basic', value: 'basic'}, {text: 'NSFW', value: 'nsfw'}],
               selectedWordPacks: ['basic'],
            }
        },
        created(){
            window.addEventListener('beforeunload', () => {
                this.removePlayer();
                this.updateRemoteRoom();
            }, false)
        },
        async mounted() {
            this.room = this.$route.params.room;
            await this.getUser();
            await this.initRoom();
        },
        computed: {
            words(){
                if (this.selectedWordPacks.length > 0)
                    return [...new Set(this.selectedWordPacks.map(s=>{return require(`../static/${s}`)}).flat())];
                else 
                    return require(`../static/basic`);
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
        },
        methods: {
            async getUser(){
                const name = this.$route.params.name || localStorage.getItem('name');
                const id = localStorage.getItem('id');
                if(name && id){
                    this.myName = name;
                    this.myPlayerId = id;
                }
                else {
                    await this.setUser();
                }
            },
            async setUser(){
                this.myPlayerId = this.myPlayerId || uuidv4();
                this.myName = this.myName || this.$route.params.name;
                if (this.myName){
                    localStorage.setItem('name', this.myName);
                    localStorage.setItem('id', this.myPlayerId);
                }
            },
            tileClass(state, owner){
                if (this.myRole == 'spyMaster' || state == 'selected'){
                    return `${state} ${owner}`;
                }
                else if (state == 'unselected'){
                    return 'unknown';
                }

            },
            async update({
                click= null,
                player=null,
                newGame=null,
                newPlayer=null,
                endTurn=null,
                removePlayer=null,
            }){
                if (click){

                    if (this.turn != this.myTeam || this.result.winner || this.myRole == 'spyMaster'){
                        click = false;
                    }
                    else {
                        // console.log(`Clicked: ${this.board.values[click.i][click.j]} (${click.i},${click.j})`);
                        const result = this.selected(click.i, click.j);
                        if (result){
                            // console.log('Game Over');
                            this.gameOver(result);
                        }
                    }
                }
                if (player){
                    // console.log(`Updating Player`);
                    this.updatePlayer(player);
                }
                if (newPlayer){
                    // console.log('New Player');
                    this.newPlayer();
                }
                if (removePlayer){
                    // console.log('Remove Player');
                    this.removePlayer();
                    await this.updateRemoteRoom();
                    this.$router.push({name: 'Home'});
                    return;
                }
                if (newGame){
                    // console.log('New Game');
                    this.newGame();
                    this.resetTimer(this.timer);
                }
                if (endTurn){
                    this.turn = this.getOtherTeam(this.turn);
                }
                if (click || player || newGame || newPlayer || endTurn){
                    // console.log('Updating Remote Room');
                    await this.updateRemoteRoom();
                }
            },
            selected(i,j){
                if (this.turn != this.myTeam || this.result.winner || this.myRole == 'spyMaster'){
                    return;
                }
                if (this.board.state[i][j] == 'unselected'){
                    this.$set(this.board.state[i], j, 'selected');
                    const owner = this.board.owner[i][j];
                    if (owner == 'assassin'){
                        this.assassin = true;
                    }
                    else if (owner == 'neutral'){
                        this.turn = this.getOtherTeam(this.turn);// == 'blue' ? 'red' : 'blue';
                    }
                    else if (owner != this.turn){
                        this.turn = this.getOtherTeam(this.turn);//this.turn == 'blue' ? 'red' : 'blue';
                    }
                    return this.updateScore();
                }
            },
            getOtherTeam(team){
                return this.teams.find(t=>t != team);
            },
            gameOver(cause){
                let winner = this.turn;
                if (cause === 'assassin'){
                    winner = this.getOtherTeam(this.turn);// == 'blue' ? 'red' : 'blue';
                }
                this.result = {
                        winner: winner,
                        message: `${winner} team wins!`
                }
            },
            updateScore(){
                if (this.assassin){
                    return 'assassin';
                }
                this.score = {
                    red: 0,
                    blue: 0
                };
                for (let i=0; i<this.board.state.length; i++){
                    for (let j=0; j<this.board.state[0].length; j++){
                        const team = this.board.owner[i][j];
                        const state = this.board.state[i][j];
                        if (state == 'unselected'){
                            if (this.score[team]){
                                this.score[team] += 1
                            }
                            else {
                                this.score[team] = 1
                            }
                        }
                    }
                }
                if (this.score.red === 0){
                    return 'red';
                }
                if (this.score.blue === 0){
                    return 'blue';
                }
            },
            updatePlayer({role=null, team=null, name=null}){
                const me = this.players.findIndex(f=>f.id === this.myPlayerId);
                if (role && role != this.myRole){
                    this.players[me].role = role;
                }
                if (team && team != this.myTeam){
                    this.players[me].team = team;
                }
                if (name){
                    this.players[me].name = name;
                    this.myName = name;
                    this.setUser();
                }
            },
            newPlayer(){
                this.players.push({
                    name: this.myName,
                    id: this.myPlayerId,
                    role: 'peasant',
                    team: null,
                });
            },
            removePlayer(){
                this.players = this.players.filter(p=>p.id != this.myPlayerId);
            },
            newGame(){
                this.players = this.players.map(p=>{
                    p.role='peasant';
                    return p;
                });
                this.result = {
                   message: null,
                   winner: null,
                };
                this.assassin = false;
                this.randomizeBoard();
            },
            randomizeBoard(){
                const words = shuffle(this.words).slice(0,25);
                const teams = shuffle(['red','blue']);
                let owner = [], values = [];
                const items = shuffle([].concat(
                        Array(9).fill(teams[0]),
                        Array(8).fill(teams[1]),
                        Array(7).fill('neutral'),
                        Array(1).fill('assassin')
                ));
                while(items.length) owner.push(items.splice(0,5));
                while(words.length) values.push(words.splice(0,5));
                const board = {
                    // eslint-disable-next-line no-unused-vars
                    values: values,  
                    // eslint-disable-next-line no-unused-vars
                    state: [...Array(5)].map(x=>Array(5).fill('unselected')),
                    // eslint-disable-next-line no-unused-vars
                    owner: owner,
                }
                this.score = {
                    [teams[0]]: 9,
                    [teams[1]]: 8
                };
                this.board = board;
                this.turn = teams[0];
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
            async updateRemoteRoom(){
                const data = {
                    board: JSON.stringify(this.board),
                    players: this.players,
                    assassin: this.assassin,
                    turn: this.turn,
                    result: this.result,
                    lastUpdated: new Date().toISOString(),
                };
                await fb.collection('rooms').doc(this.room).set(data);
            },
            async initRoom(){
                let ref = fb.collection('rooms').doc(this.room);
                const room = await ref.get();
                let currentData = room.data();
                // if room doesn't exist, or last activity was more than 12 hours ago.
                if (!room.exists || new Date() - new Date(currentData.lastUpdated) > 4.32e+7){
                    await this.update({newGame: true, newPlayer: true});
                }
                else {
                    this.updateBoard(currentData);
                    const myPlayerIdx = currentData.players.findIndex(p=>p.id===this.myPlayerId);
                    if (myPlayerIdx === -1){
                        await this.update({newPlayer: true});
                    }
                }
                ref.onSnapshot(this.tick);
            },
            updateBoard(data){
                this.board = JSON.parse(data.board);
                this.players = data.players;
                this.assassin = data.assassin;
                this.turn = data.turn;
                this.result = data.result;
                const timerBefore = this.timer;
                this.timer = data.timer === 'off' ? null : (data.timer ||  this.timer);
                if (this.timer != timerBefore){
                    this.activateTimer(true, false);
                }
                const result = this.updateScore();
                if (result){
                    this.gameOver(result);
                }
            },
            async tick(snapshot){
                this.info = snapshot.data();
                this.updateBoard(this.info);
            },
        },
        watch: {
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
    }
</script>
<style>
    .room {
        margin: 12px;
    }
    .notes {
        min-height: 35% !important;
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
</style>