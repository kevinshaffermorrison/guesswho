import fb from '@/firebase/init';

export default {
    methods: {
        async clearRoom(){
            await this.docRef.set({lastUpdated: new Date().toISOString()});
        },
        remoteUpdatePlayer({id, name=null, team=null, role=null}){
            this.playerRef.doc(id).get().then(data=>{
                const player = data.data() || {id};
                if (name) player.name = name;
                if (team) player.team = team;
                if (role) player.role = role;
                player.lastUpdated = new Date().toISOString();
                this.playerRef.doc(id).set(player);
            }).catch((err) => {
                console.log(err);
                this.error = 'Could not update player';
            });
        },
        remoteRemovePlayer({id}){
            this.playerRef.doc(id).delete();
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
        resetPlayerRoles(){
            // might want to fetch all players from db first...
            var batch = fb.batch();
            for (let i=0; i<this.players.length; i++){
                batch.update(this.playerRef.doc(this.players[i].id), {"role": "peasant"});
            }
            // Might want to error check here.
            batch.commit();         
        },
        remoteInitGame({board, redTarget, blueTarget, turn}){
            this.docRef.get().then(data=>{
                const roomData = data.data();
                this.resetPlayerRoles();
                const timer = roomData.timer || 'off';

                // eslint-disable-next-line no-unused-vars
                this.docRef.update({
                    blueBoard: JSON.stringify(board),
                    redBoard: JSON.stringify(board),
                    redTarget: redTarget,
                    blueTarget: blueTarget,
                    turn,
                    timer,
                    winner: null,
                    lastUpdated: new Date().toISOString()
                });
            })
        },
        remoteUpdateBoard(team, i, j){
            console.log(team, i, j);
            this.docRef.get().then(data=>{
                const gameData = data.data();
                let board = (team === 'blue' ? gameData.blueBoard : gameData.redBoard);
                board = board ? JSON.parse(board) : {state: [[]]};
                board.state[i][j] = board.state[i][j]  === 'selected' ? 'unselected' : 'selected';
                const payload = {
                    [`${team}Board`]: JSON.stringify(board),
                    lastUpdated: new Date().toISOString(),
                };
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