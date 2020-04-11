const shuffle = require('lodash.shuffle');

export default {
    methods: {   
        getOtherTeam(team){
            return this.teams.find(t=>t != team);
        },
        newGame(){
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
            const score = {
                [teams[0]]: 9,
                [teams[1]]: 8
            };
            const turn = teams[0];
            this.remoteInitGame({board, score, turn});
        },
        getScore(board){
            const score = {
                red: 0,
                blue: 0
            };
            for (let i=0; i<board.state.length; i++){
                for (let j=0; j<board.state[0].length; j++){
                    const team = board.owner[i][j];
                    const state = board.state[i][j];
                    if (state == 'unselected'){
                        if (score[team]){
                            score[team] += 1
                        }
                        else {
                            score[team] = 1
                        }
                    }
                }
            }

            return {
                score,
                winner: score.red === 0 || score.blue === 0
            };
        },
    }
}