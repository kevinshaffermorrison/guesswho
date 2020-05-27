const shuffle = require('lodash.shuffle');

export default {
    methods: {   
        getOtherTeam(team){
            return this.teams.find(t=>t != team);
        },
        newGame(){
            const people = JSON.parse(JSON.stringify(this.words));
            const teams = shuffle(['red','blue']);
            let values = [];
            console.log(people);
            var blueTarget = people[Math.floor(Math.random() * people.length)];
            var redTarget = people[Math.floor(Math.random() * people.length)];
            while(people.length) values.push(people.splice(0,8));
            const turn = teams[0];
            const board = {
                // eslint-disable-next-line no-unused-vars
                state: [...Array(3)].map(x=>Array(8).fill('unselected')),
                values: values,
            }
            this.remoteInitGame({board, redTarget, blueTarget, turn});
        }
    }
}