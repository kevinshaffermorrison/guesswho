export default {
    methods: {
        async clearRoom(){
            await this.docRef.set({lastUpdated: new Date().toISOString()});
        },
        remoteUpdatePlayer({id, name=null, team=null, role=null}){
            this.docRef.get().then(data=>{
                const players = data.data().players || [];
                const playerIdx = players.findIndex(f=>f.id === id);
                if (playerIdx == -1){
                    players.push({
                        id, name, team, role
                    });
                }
                else {
                    if (name) players[playerIdx].name = name;
                    if (team) players[playerIdx].team = team;
                    if (role) players[playerIdx].role = role;
                }
                this.docRef.update({players, lastUpdated: new Date().toISOString()});
            }).catch((err) => {
                console.log(err);
                this.error = 'Could not update player';
            });
        },
        remoteRemovePlayer({id}){
            this.docRef.get().then(data=>{
                const players = data.data().players || [];
                const playerIdx = players.findIndex(f=>f.id === id);
                if (playerIdx != -1){
                    players.pop(playerIdx);
                    this.docRef.update({players, lastUpdated: new Date().toISOString()});
                }
            }).catch((err) => {
                console.log(err);
                this.error = 'Could not update player';
            });
        },
        remoteChangeTurn({currentTurn}){
            this.docRef.get().then(data=>{
                const turn = data.data().turn;
                if (turn == currentTurn){
                    this.docRef.update({
                        turn: this.getOtherTeam(currentTurn), 
                        lastUpdated: new Date().toISOString()
                    });
                }
            }).catch((err) => {
                console.log(err);
                this.error = 'Could not change turn';
            });
        },
        remoteInitGame({board, score, turn}){
            this.docRef.get().then(data=>{
                const roomData = data.data();
                let players = roomData.players || [];
                players = players.map(p=>{
                    p.role='peasant';
                    return p;
                });
                const timer = roomData.timer || 'off';

                this.docRef.update({
                    board: JSON.stringify(board), 
                    score, 
                    turn,
                    players,
                    timer,
                    winner: null,
                    assassin: false,
                    lastUpdated: new Date().toISOString()
                });
            })
        },
        remoteUpdateBoard(i, j){
            this.docRef.get().then(data=>{
                let board = data.data().board;
                board = board ? JSON.parse(board) : {state: [[]], owner: [['blue']]};
                board.state[i][j] = 'selected';
                const {score, winner} = this.getScore(board);
                const owner = board.owner[i][j];
                const payload = {
                    board: JSON.stringify(board),
                    winner: winner ? this.turn : winner,
                    score,
                    lastUpdated: new Date().toISOString(),
                };
                switch(owner){
                    case 'assassin':
                        payload.assassin = true;
                        payload.winner = this.getOtherTeam(this.turn);
                        break;
                    case 'neutral':
                        payload.turn = this.getOtherTeam(this.turn);
                        break;
                    case this.turn:
                        break;
                    default:
                        payload.turn = this.getOtherTeam(this.turn); 
                        break;
                }
                this.docRef.update(payload);
            }).catch((err) => {
                console.log(err);
                this.error = 'Could not update game state';
            });
        },
    }
}




// TRANSACTIONS DON'T UPDATE LOCAL QUICKLY...
// DOING THE GET UPDATE ABOVE WORKS MUCH MORE SPEEDY... (probably some side effects though?)
// updatePlayer(playerToUpdate){
//     return fb.runTransaction(transaction => {
//         // This code may get re-run multiple times if there are conflicts.
//         return transaction.get(this.docRef).then(sfDoc => {
//             if (!sfDoc.exists) {
//                 throw "Document does not exist!";
//             }
//             // Add one person to the city population.
//             // Note: this could be done without a transaction
//             //       by updating the population using FieldValue.increment()
//             const players = sfDoc.data().players || [];
//             const playerIdx = players.findIndex(f=>f.id === playerToUpdate.id);
//             if (playerIdx == -1){
//                 players.push(playerToUpdate);
//             }
//             else {
//                 players[playerIdx] = playerToUpdate;
//             }
//             console.log('Transaction Update');
//             transaction.update(this.docRef, { players });
//             return players;
//         });
//     }).then(players => {
//         console.log("Transaction successfully committed!");
//         this.players = players;
//     }).catch(error => {
//         console.log("Transaction failed: ", error);
//     });
// },