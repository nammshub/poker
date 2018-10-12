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
            "id": "player.action",
            "data": {
                "action": {
                    "value": 0
                }
            }
        };
        //on cree la reponse neuronale
        let timeout = false;
        const timerControl = setTimeout(function () {
            console.log("le timeout est passe");
            callback(messageJson);
            //on annule la reponse neuronale
            timeout = true;
        }, (1000 * config.MAX_SEC_TO_ANSWER) - 1000);

        //calcul random
        console.log("before random player chips = "+playerMemo.player.chips);
        let randomValue = Math.max(0,playerMemo.player.chips - 1400); //this.getRandomInt(0, playerMemo.player.chips);
        playerMemo.player.chips = playerMemo.player.chips - randomValue;
        playerMemo.turnsDetails[playerMemo.totalHands].randomResponse = randomValue;
        messageJson.data.action.value = randomValue;

        //lancement de la partie neuronale
        const pureNeuronal = await this.getNeuronalAnswer(net,playerMemo);
        console.log("on a la reponse neuronale");
        messageJson.data.action.value = pureNeuronal;
        clearTimeout(timerControl);
        if (!timeout) {
            callback(messageJson);
        }
    }

    /**
     * retourne la reponse du reseau de neurone sous la forme d"un nombre de chips à jouer
     */
    async getNeuronalAnswer(net,playerMemo) {
        const neuronalAnswer = net.run({ r: 1, g: 0.4, b: 0 });  // { white: 0.99, black: 0.002 }
        const pureAnswer = this.getPureAnswer(neuronalAnswer,playerMemo);
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
    getPureAnswer(rawNeuronal,playerMemo) {
        //FOLD
        if(rawNeuronal < 0.333){
            return 0;
        }
        //CHECK
        if(rawNeuronal < 0.666){
            return this.getCheck(playerMemo);
        }
        return this.getRaise(playerMemo);
    }

    getCheck(playerMemo){
        const toCheck = playerMemo.currMaxBet - playerMemo.currBet;
        if(toCheck <  playerMemo.player.chips){
            playerMemo.player.chips = playerMemo.player.chips - toCheck;
            return toCheck;
        }
        //sinon random entre fold et all in
        const random = this.getRandomInt(0,1);
        if(random === 0){
            return 0;
        }
        toCheck = playerMemo.player.chips;
        playerMemo.player.chips = 0;
        return toCheck;
    }


    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = PlayListener;