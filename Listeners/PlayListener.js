const EventEmitter = require("events");
const NeuronalNetworkListener = require("./NeuronalNetworkListener");
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
            messageJson.data.action.value = randomValue;
            playerMemo.player.chips = playerMemo.player.chips - randomValue;
            playerMemo.turnsDetails[playerMemo.totalHands].randomResponse = randomValue;
            callback(messageJson);
        }, (1000 * config.MAX_SEC_TO_ANSWER) - 1000);

        //calcul random
        console.log("before random player chips = " + playerMemo.player.chips);
        const randomValue = this.getRandomInt(0, playerMemo.player.chips);

        //lancement de la partie neuronale
        const pureNeuronal = await this.getNeuronalAnswer(net, playerMemo);
        console.log("on a la reponse neuronale timeout = " + timeout);
        if (!timeout) {
            messageJson.data.action.value = pureNeuronal;
            clearTimeout(timerControl);
            console.log("aftre clearTimeout");
            playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].betsMap.get(playerMemo.player.id)[playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].turnStep].push(pureNeuronal);
            console.log("aftre turnsDetails");
            playerMemo.player.chips = playerMemo.player.chips - pureNeuronal;
            console.log("neuronale avant callback");
            callback(messageJson);
        }
    }

    /**
     * retourne la reponse du reseau de neurone sous la forme d"un nombre de chips à jouer
     */
    async getNeuronalAnswer(net, playerMemo) {
        const neuronalAnswer = net.run(playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].neuronalInput.input);
        console.log("neuronal answer = " + JSON.stringify(neuronalAnswer));
        const pureAnswer = this.getPureAnswer(neuronalAnswer, playerMemo);
        return pureAnswer;
        //return 3;
        //await this.sleep((1000 * config.MAX_SEC_TO_ANSWER) + 1000);
        //return 3;
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
            return 0;
        }
        //CHECK
        if (rawNeuronal.chips < 0.666) {
            console.log("should check");
            return this.getCheck(playerMemo);
        }
        console.log("should raise");
        return this.getRaise(playerMemo);
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
        //random entre check et all in
        return this.getRandomInt(toCheck, playerMemo.player.chips);
    }


    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getStepMaxBet(playerMemo) {
        let maxBet = 0;
        playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].betsMap.forEach(function (currArray) {
            let sum = 0;
            currArray[playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].turnStep].forEach(function (bet) {
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
        playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].betsMap.forEach(function (currArray, playerId) {
            if (playerId === playerMemo.player.id) {
                currArray[playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].turnStep].forEach(function (bet) {
                    sum += bet;
                });
            }
        });
        return sum;
    }
}

module.exports = PlayListener;