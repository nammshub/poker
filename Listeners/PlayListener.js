const EventEmitter = require("events");
require("../config");
const HandValueHelper = require("../Helpers/HandValueHelper");
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
            "id": "client.game.player.play",
            "data": {
                "value": 0
            }
        };
        //on cree la reponse neuronale
        let timeout = false;
        const _this = this;
        const timerControl = setTimeout(function () {
            //on annule la reponse neuronale
            timeout = true;
            //console.log("le timeout est passe");
            const pureRandom = _this.getPureAnswer(randomValue, playerMemo);
            messageJson.data.value = pureRandom[0];
            playerMemo.turnsDetails[playerMemo.totalHands].randomResponse = pureRandom;
            _this.updatePlayerMemo(playerMemo, pureRandom[0], pureRandom[1]);
            callback(messageJson);
        }, (1000 * config.MAX_SEC_TO_ANSWER) - 1000);

        //calcul random
        //console.log("before random player chips = " + playerMemo.player.chips);
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
            case 3:
                randomValue = 1;
                break;
        }

        //lancement de la partie neuronale
        let pureNeuronal;
        if (config.DISABLE_NEURONAL) {
            pureNeuronal = this.getPureAnswer(randomValue, playerMemo);
        }
        else {
            const bluffValue = this.getRandomInt(1, config.BLUFF_RATIO)
            if (bluffValue === 1) {
                //on va bluff
                pureNeuronal = this.getSomeBluff(playerMemo);
            }
            else {
                pureNeuronal = await this.getNeuronalAnswer(net, playerMemo);
            }
        }
        //console.log("on a la reponse neuronale timeout = " + timeout);
        if (!timeout) {
            messageJson.data.value = pureNeuronal[0];
            clearTimeout(timerControl);
            this.updatePlayerMemo(playerMemo, pureNeuronal[0], pureNeuronal[1]);
            callback(messageJson);
        }
    }

    /**
     * retourne la reponse du reseau de neurone sous la forme d"un nombre de chips à jouer
     */
    async getNeuronalAnswer(net, playerMemo) {
        const moveToPlay = this.getBestMove(net, playerMemo);
        return this.getPureAnswer(moveToPlay, playerMemo);
    }

    /**
     * Pour les params d'entrees donnés, on va tester les 3 moves (FOLD?CHECK,RAISE) 
     * et selon le meilleur ratio win/lose retourne par le reseau on sait quel est le meilleur move
     * @param {*} net 
     * @param {*} playerMemo 
     */
    async getBestMove(net, playerMemo) {
        const threeMoves = [0, 0.5, 1];
        let maxWin = 0;
        let bestMove = 0;
        threeMoves.forEach(function(move){
            playerMemo.turnsDetails[playerMemo.totalHands].currInput.input.move = move;
            let winLose = net.run(playerMemo.turnsDetails[playerMemo.totalHands].currInput.input).winLose;
            console.log("move = " + move + " winLose = " + winLose );
            if(winLose > maxWin){
                maxWin = winLose;
                bestMove = move;
            }
        });
        return bestMove;
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
        if (rawNeuronal < 0.333) {
            //console.log("should fold");
            playerMemo.turnsDetails[playerMemo.totalHands].state = "FOLDED";
            return [0, 0];
        }
        playerMemo.turnsDetails[playerMemo.totalHands].state = "ACTIVE";
        //CHECK
        if (rawNeuronal < 0.666) {
            //console.log("should check");
            return [this.getCheck(playerMemo), 0.5];
        }
        if (config.HOLDEM_LIMIT && this.hasAlreadyRaised(playerMemo)) {
            //console.log("should check");
            return [this.getCheck(playerMemo), 0.5];
        }
        //console.log("should raise");
        return [this.getRaise(playerMemo), 1];
    }

    getCheck(playerMemo) {
        const toCheck = this.getStepMaxBet(playerMemo);
        if (toCheck < playerMemo.player.chips - (this.getHandMyBet(playerMemo) - this.getStepMyBet(playerMemo))) {
            return toCheck;
        }
        //sinon all in
        return playerMemo.player.chips - (this.getHandMyBet(playerMemo) - this.getStepMyBet(playerMemo));
    }

    getRaise(playerMemo) {
        const toCheck = this.getCheck(playerMemo);
        let toRaise = toCheck + this.getRandomInt(1, config.MAX_RAISE_MULTIPLIER) * playerMemo.bigBlind;
        //si jeu en holdem limit raise de la grosse blind
        if (config.HOLDEM_LIMIT && !this.hasAlreadyRaised(playerMemo)) {
            toRaise = toCheck + playerMemo.bigBlind;
        }
        return Math.min(toRaise, playerMemo.player.chips - (this.getHandMyBet(playerMemo) - this.getStepMyBet(playerMemo)));
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

    getHandMyBet(playerMemo) {
        let sum = 0;
        playerMemo.turnsDetails[playerMemo.totalHands].betsMap.forEach(function (currArray, playerId) {
            if (playerId === playerMemo.player.id) {
                let iterStep = -1;
                while (iterStep < playerMemo.turnsDetails[playerMemo.totalHands].turnStep) {
                    iterStep++;
                    currArray[iterStep].forEach(function (bet) {
                        sum += bet;
                    });
                }
            }
        });
        return sum;
    }

    getSomeBluff(playerMemo) {
        playerMemo.turnsDetails[playerMemo.totalHands].currInput.input.bluff = 1;
        const checkOrRaise = this.getRandomInt(0, 1);
        if (checkOrRaise === 0) {
            return this.getPureAnswer(0.5, playerMemo);
        }
        return this.getPureAnswer(1, playerMemo);
    }

    updatePlayerMemo(playerMemo, chipsPlayed, foldCheckRaise) {
        let myCurrBetsSum = this.getHandMyBet(playerMemo);
        //chips played est le total du step donc le delta est chips played - bet step
        let deltaChips = chipsPlayed - this.getStepMyBet(playerMemo);
        console.log("player id = " + playerMemo.player.id + " chips begin hand = " + playerMemo.player.chips);
        console.log("chips played hand = " + this.getHandMyBet(playerMemo));
        console.log("chips played = " + chipsPlayed + "getStepMyBet " + this.getStepMyBet(playerMemo) + " delta = " + deltaChips);
        playerMemo.turnsDetails[playerMemo.totalHands].betsMap.get(playerMemo.player.id)[playerMemo.turnsDetails[playerMemo.totalHands].turnStep].push(deltaChips);
        playerMemo.turnsDetails[playerMemo.totalHands].currInput.input.move = foldCheckRaise;
        playerMemo.turnsDetails[playerMemo.totalHands].currInput.input.myCurrBet = myCurrBetsSum / playerMemo.potTotal;
        playerMemo.turnsDetails[playerMemo.totalHands].currInput.input
        const currStep = playerMemo.turnsDetails[playerMemo.totalHands].currInput.input.step;
        playerMemo.turnsDetails[playerMemo.totalHands].currInput.input.position = playerMemo.turnsDetails[playerMemo.totalHands].positionMap.get(playerMemo.player.id) / playerMemo.turnsDetails[playerMemo.totalHands].positionMap.size;
        this.injectPlayersChipsRatio(playerMemo);
        //on injecte ce currInput dans le tableau et ensuite on reset le currInput
        playerMemo.turnsDetails[playerMemo.totalHands].neuronalInputs.push(playerMemo.turnsDetails[playerMemo.totalHands].currInput);
        playerMemo.turnsDetails[playerMemo.totalHands].currInput = {
            "input": {
                "myCurrBet": myCurrBetsSum / playerMemo.potTotal,
                "step": currStep,
                "position": playerMemo.turnsDetails[playerMemo.totalHands].positionMap.get(playerMemo.player.id) / playerMemo.turnsDetails[playerMemo.totalHands].positionMap.size,
                "bluff": 0,
                "maxHandsRatio": playerMemo.totalHands / config.MAX_HANDS,
                "handStrength": playerMemo.turnsDetails[playerMemo.totalHands].currInput.input.handStrength,
            },
            "output": {
            }
        }
        //HandValueHelper.handValueToNeuronalInput(playerMemo)
    }

    hasAlreadyRaised(playerMemo) {
        let alreadyRaise = false;
        const currStep = playerMemo.turnsDetails[playerMemo.totalHands].turnStep / 4;
        playerMemo.turnsDetails[playerMemo.totalHands].neuronalInputs.forEach(function (currInput) {
            if (currInput.input.step === currStep && currInput.output.chips === 1) {
                alreadyRaise = true;
            }
        })
        //console.log("alreadyRaise = " + alreadyRaise);
        return alreadyRaise;
    }

    injectPlayersChipsRatio(playerMemo) {
        const totalChips = playerMemo.potTotal;
        playerMemo.listPlayers.forEach(function (player) {
            const playerPosition = playerMemo.turnsDetails[playerMemo.totalHands].positionMap.get(player.id);
            const turnChips = player.chips;
            let variableName = "myChipsRatio"
            if (player.id !== playerMemo.player.id) {
                variableName = "totalChipsRatio_" + playerPosition;
            }
            playerMemo.turnsDetails[playerMemo.totalHands].currInput.input[variableName] = turnChips / totalChips;
        });
    }
}

module.exports = PlayListener;