const EventEmitter = require("events");
const BlindHelper = require("../Helpers/BlindHelper");

require("../config");
/**
 * Ce listener gere l"event start. Il doit stocker nos infos joueur pour la partie en cours et stocker le nbr de joueur de la partie
 */
class HandStartListener extends EventEmitter {
    handleMessage(startMessage, playerMemo) {
        startMessage.data.players.forEach(function (player) {
            console.log("inside HandStartListener player " + player.id);
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
        console.log("la position du joueur pour ce tour est " + positionMap.get(playerMemo.player.id))
        //gestion de la prise des petites et grandes blindes chez les joueurs prevus et considere comme mise de preflop
        let betsMap = this.getNewBetsMap(playerMemo);
        playerMemo.turnsDetails.push({
            "nbrBlindPayed":0,
            "positionMap": positionMap,
            "betsMap": betsMap,
            //turn step: 0=> preflop, 1=> flop, 2 => turn , 3=> river
            "turnStep": 0,
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
                    "Win": config.WIN_RATIO,
                    "Lose": 0,
                    "myCurrBet": 0,
                    "step": 0,
                    "position": positionMap.get(playerMemo.player.id) / positionMap.size,
                    "bluff": 0,
                    "maxHandsRatio": playerMemo.totalHands / config.MAX_HANDS,
                },
                "output": {
                }
            },
            "neuronalInputs": [],
        });
        this.handleActionRatioMap(playerMemo);
        console.log("\n Hand Start event. playerMemo = " + JSON.stringify(playerMemo));
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
            console.log("position player id = " + player.id + " position = " + position);
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

}

module.exports = HandStartListener;