const EventEmitter = require("events");
const BlindHelper = require("../Helpers/BlindHelper");

require("../config");
/**
 * Ce listener gere l"event start. Il doit stocker nos infos joueur pour la partie en cours et stocker le nbr de joueur de la partie
 */
class HandStartListener extends EventEmitter {
    handleMessage(startMessage, playerMemo) {
        startMessage.data.players.forEach(function (player) {
            //console.log("inside HandStartListener player " + player.id);
        })
        playerMemo.listPlayers = startMessage.data.players;
        let positionMap = this.getMapPosition(playerMemo);
        //Maj des chips si le corupier a pris une blinde chez le joueur
        for (let player of startMessage.data.players) {
            if (playerMemo.player.id === player.id) {
                playerMemo.player = player;
            }
        }
        //ajout d"un nouveau tour (vide pour le moment)
        playerMemo.totalHands++;
        //actualise les blindes
        const currBlinds = BlindHelper.actualizeBlinds(playerMemo.totalHands);
        //playerMemo.bigBlind = currBlinds[1];
        //console.log("la position du joueur pour ce tour est " + positionMap.get(playerMemo.player.id))
        //gestion de la prise des petites et grandes blindes chez les joueurs prevus et considere comme mise de preflop
        let betsMap = this.getNewBetsMap(playerMemo);
        playerMemo.turnsDetails.push({
            "nbrBlindPayed":0,
            "positionMap": positionMap,
            "betsMap": betsMap,
            //turn step: 0=> preflop, 1=> flop, 2 => turn , 3=> river
            "handStep": 0,
            "stepTurn": 0,
            "state": "ACTIVE",
            "tourNumber": playerMemo.totalHands,
            //"outputArray": [],
            "hand": [],
            "tapis": [
                //carte1, carte2...
            ],
            "neuronalResponses": null,
            "randomResponse": 0,
            "currInput": {
                "input": {
                    "position": positionMap.get(playerMemo.player.id) / positionMap.size,
                    "maxHandsRatio": playerMemo.totalHands / config.MAX_HANDS,
                },
                "output": {
                }
            }
        });
        this.handleActionRatioMap(playerMemo);
        //console.log("\n Hand Start event. playerMemo = " + JSON.stringify(playerMemo));
        this.injectPlayersProfiles(playerMemo);
    }

    /**
     * cree une map de joueur id => position du tour
     * @param {*} playerMemo 
     */
    getMapPosition(playerMemo) {
        let positionMap = new Map();
        let position = 0;
        playerMemo.listPlayers.forEach(function (player) {
            position++;
            positionMap.set(player.id, position);
            //console.log("position player id = " + player.id + " position = " + position);
        });
        return positionMap;
    }

    getNewBetsMap(playerMemo) {
        //recuperation de la map des bets. On va injecter pour ce joueur 
        /*
        {
            joueur 1: { [
                //mises du preflop
                [],
                //mises du flop
                [],
                //mises du turn
                [],
                //mises du river
                []

            ]},
            joueur 2 ...
        }
        */

        let betsMap = new Map();
        playerMemo.listPlayers.forEach(function (player) {
            betsMap.set(player.id, [[], [], [], []]);
        });
        return betsMap;

    }

    handleActionRatioMap(playerMemo) {
        if (!playerMemo.actionRatioMap) {
            playerMemo.actionRatioMap = new Map();
            const actionMap = new Map();
            actionMap.set("FOLD", 0);
            actionMap.set("CHECK", 0);
            actionMap.set("RAISE", 0);
            playerMemo.listPlayers.forEach(function (player) {
                playerMemo.actionRatioMap.set(player.id, new Map(actionMap));
            })
        }
    }

    /**
     * methode qui injecte dans le curr input le % de raise et de fold de chaque joueur actif afin d'etablir un profil des adversaires
     */
    injectPlayersProfiles(playerMemo){
        for (let player of playerMemo.listPlayers){
            if(player.id !== playerMemo.player.id){
                try{
                    let playerActionRatioMap = playerMemo.actionRatioMap.get(player.id);
                    let playerPos = playerMemo.turnsDetails[playerMemo.totalHands].positionMap.get(player.id);
                    let totalActions = playerActionRatioMap.get("FOLD") + playerActionRatioMap.get("CHECK") + playerActionRatioMap.get("RAISE");
                    playerMemo.turnsDetails[playerMemo.totalHands].currInput.input["Player"+playerPos+"_raiseRatio"] = playerActionRatioMap.get("RAISE") / totalActions;
                    playerMemo.turnsDetails[playerMemo.totalHands].currInput.input["Player"+playerPos+"_foldRatio"] = playerActionRatioMap.get("FOLD") / totalActions;
                }
                catch(error){
                    console.log(error);
                }
            }
        }

    }

}

module.exports = HandStartListener;