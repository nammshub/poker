const EventEmitter = require('events');
const NeuronalNetworkListener = require('./NeuronalNetworkListener');
/**
 * Ce listener gere l'event play. Il doit activer les calculs et repondre au croupier dans les temps impartis
 */
class PlayListener extends EventEmitter {


    async handleMessage(playerMemo, callback) {
        /*
        lance le machine learning => quand fini emit event pour repondre
		- lance le hardcoded
		- lance le chrono => a total - 2 secondes  oblige envoie reponse => si timeout => on annule le listener sur l'event et on renvoie la reponse random
        */
        //config.NEURONAL_NETWORK_LISTENER.launchCompute( function(output){
        //let randomValue = this.getRandomInt(0,playerMemo.player.chips);
        //test check
        let messageJson = {
            "id": "player.action",
            "data": {
                "action": {
                    "value": playerMemo.turnsDetails[playerMemo.totalHands].randomResponse
                }
            }
        }
        //on cree la reponse neuronale
        let timeout = false;
        const timerControl = setTimeout(function () {
            console.log('le timeout est passe');
            callback(messageJson);
            //on annule la reponse neuronale
            timeout = true;
        }, (1000 * config.MAX_SEC_TO_ANSWER) - 1000);

        //calcul random
        let randomValue = this.getRandomInt(0, playerMemo.player.chips);;
        playerMemo.player.chips = playerMemo.player.chips - randomValue;
        playerMemo.turnsDetails[playerMemo.totalHands].randomResponse = randomValue
        //let randomSecondes = this.getRandomInt(1, config.MAX_SEC_TO_ANSWER - 1);
        console.log('random value = ' + randomValue);

        //lancement de la partie neuronale
        const rawNeuronal = await this.getNeuronalAnswer();
        console.log('on a la reponse neuronale');
        const pureNeuronal = this.getPureAnswer(rawNeuronal);
        messageJson.data.action.value = pureNeuronal;
        clearTimeout(timerControl);
        if (!timeout) {
            callback(messageJson);
        }
    }

    /**
     * retourne la reponse du reseau de neurone sous la forme d'un nombre de chips à jouer
     */
    async getNeuronalAnswer() {
        //const neuronalAnswer = net.run({ r: 1, g: 0.4, b: 0 });  // { white: 0.99, black: 0.002 }
        //return neuronalAnswer.chips;
        //return 3;
        await this.sleep((1000 * config.MAX_SEC_TO_ANSWER) + 1000);
        return 3;
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
    getPureAnswer(rawNeuronal) {
        return rawNeuronal * 3;
        return 0;
    }


    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = PlayListener;