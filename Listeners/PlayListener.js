const EventEmitter = require("events");
require("../config");
/**
 * Ce listener gere l"event play. Il doit activer les calculs et repondre au croupier dans les temps impartis
 */
class PlayListener extends EventEmitter {


    async handleMessage(playerMemo, net, callback) {
        /*
        lance le machine learning => quand fini emit event pour repondre
		- lance le hardcoded
		- lance le chrono => a total - 2 secondes  oblige envoie reponse => si timeout => on annule le listener sur l"event et on renvoie la reponse random
        */
        //config.NEURONAL_NETWORK_LISTENER.launchCompute( function(output){
        //let randomValue = this.getRandomInt(0,playerMemo.player.chips);
        //test check
        let messageJson = {
            "id": "client.game.action",
            "data": {
                "action": {
                    "value": 0
                }
            }
        };
        //on cree la reponse neuronale
        let timeout = false;
        const timerControl = setTimeout(function () {
            //on annule la reponse neuronale
            timeout = true;
            console.log("le timeout est passe");
            const pureRandom = this.getPureAnswer(randomValue, playerMemo);
            messageJson.data.action.value = pureRandom[0];
            playerMemo.turnsDetails[playerMemo.totalHands].randomResponse = pureRandom;
            this.updatePlayerMemo(playerMemo, pureRandom[0], pureRandom[1]);
            callback(messageJson);
        }, (1000 * config.MAX_SEC_TO_ANSWER) - 1000);

        //calcul random
        console.log("before random player chips = " + playerMemo.player.chips);
        let randomValue = 0.5;
        switch (this.getRandomInt(1, 3)) {
            //fold
            case 1:
                randomValue = 0;
                break;
            //check
            case 2:
                randomValue = 0.5;
                break;
            //raise
            case 1:
                randomValue = 1;
                break;
        }

        //lancement de la partie neuronale
        let pureNeuronal;
        if (config.DISABLE_NEURONAL) {
            pureNeuronal = this.getPureAnswer(randomValue, playerMemo);
        }
        else {
            pureNeuronal = await this.getNeuronalAnswer(net, playerMemo);
        }
        console.log("on a la reponse neuronale timeout = " + timeout);
        if (!timeout) {
            messageJson.data.action.value = pureNeuronal[0];
            clearTimeout(timerControl);
            this.updatePlayerMemo(playerMemo, pureNeuronal[0], pureNeuronal[1]);
            callback(messageJson);
        }
    }

    /**
     * retourne la reponse du reseau de neurone sous la forme d"un nombre de chips à jouer
     */
    async getNeuronalAnswer(net, playerMemo) {
        const neuronalAnswer = net.run(playerMemo.turnsDetails[playerMemo.totalHands].neuronalInput.input);
        console.log("neuronal answer = " + JSON.stringify(neuronalAnswer));
        return this.getPureAnswer(neuronalAnswer, playerMemo);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * retourne une reponse propre selon la reponse brut du reseau neuronal
     * par exemple si le reseau demande jouer 32 chips et que la grosse blinde est à 40, 
     * on va jouer 40 plutot que de se coucher puisque la reponse brute est plus proche de ce resultat
     * @param {*} rawNeuronal 
     */
    getPureAnswer(rawNeuronal, playerMemo) {
        //FOLD
        if (rawNeuronal.chips < 0.333) {
            console.log("should fold");
            return [0, 0];
        }
        //CHECK
        if (rawNeuronal.chips < 0.666) {
            console.log("should check");
            return [this.getCheck(playerMemo), 0.5];
        }
        console.log("should raise");
        return [this.getRaise(playerMemo), 1];
    }

    getCheck(playerMemo) {
        const toCheck = this.getStepMaxBet(playerMemo) - this.getStepMyBet(playerMemo);
        if (toCheck < playerMemo.player.chips) {
            return toCheck;
        }
        //sinon all in
        return playerMemo.player.chips;;
    }

    getRaise(playerMemo) {
        const toCheck = this.getCheck(playerMemo);
        const toRaise = toCheck + this.getRandomInt(1, config.MAX_RAISE_MULTIPLIER) * playerMemo.bigBlind;
        return Math.min(toRaise, playerMemo.player.chips);
    }


    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getStepMaxBet(playerMemo) {
        let maxBet = 0;
        playerMemo.turnsDetails[playerMemo.totalHands].betsMap.forEach(function (currArray) {
            let sum = 0;
            currArray[playerMemo.turnsDetails[playerMemo.totalHands].turnStep].forEach(function (bet) {
                sum += bet;
            });
            if (sum > maxBet) {
                maxBet = sum;
            }
        });
        return maxBet;
    }

    getStepMyBet(playerMemo) {
        let sum = 0;
        playerMemo.turnsDetails[playerMemo.totalHands].betsMap.forEach(function (currArray, playerId) {
            if (playerId === playerMemo.player.id) {
                currArray[playerMemo.turnsDetails[playerMemo.totalHands].turnStep].forEach(function (bet) {
                    sum += bet;
                });
            }
        });
        return sum;
    }

    updatePlayerMemo(playerMemo, chipsPlayed, foldCheckRaise) {
        playerMemo.player.chips = playerMemo.player.chips - chipsPlayed;
        playerMemo.turnsDetails[playerMemo.totalHands].betsMap.get(playerMemo.player.id)[playerMemo.turnsDetails[playerMemo.totalHands].turnStep].push(chipsPlayed);
        playerMemo.turnsDetails[playerMemo.totalHands].neuronalInput.output.chips = foldCheckRaise;
    }
}

module.exports = PlayListener;