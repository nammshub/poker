const fs = require("fs");
require("../config");

class HandValueHelper {

    /**
     * retourne une map de joueur : chips gagnés pour ce tour
     */
    static getWinners() {
        let winnersMap = new Map();
        let playersHandValues = new Map();
        //pour chaque joueur actif, on va calculer la valeur de sa main
        //on recupere les cartes du tapis
        const tapis = config.CARDS_ON_TABLE;
        for (let player of config.PLAYERS) {
            if (player.details.state === "ACTIVE") {
                //console.log("analyse des cartes du joueur " + player.details.id);
                let allCards = config.PLAYERS_CARDS_MAP.get(player.details.id);
                allCards = allCards.concat(tapis);
                //console.log("all cards for this player are ");
                allCards.forEach(function (card) {
                    //console.log(card.kind + " " + card.color);
                })
                playersHandValues.set(player.details.id, this.getHandValue(allCards));
                //console.log("meilleur combinaison de la main " + playersHandValues.get(player.details.id)[0] + " et la valeur vaut " + playersHandValues.get(player.details.id)[1]);
            }
        }
        //classement des joueurs sous forme d'un tableau de tableau de id
        let winnerArray = [];
        let bestHand = [0, 0];
        playersHandValues.forEach(function (score, playerId) {
            if (score[0] === bestHand[0] && score[1] === bestHand[1]) {
                winnerArray.push(playerId);
            }
            if (score[0] > bestHand[0] || (score[0] === bestHand[0] && score[1] > bestHand[1])) {
                bestHand = score;
                winnerArray = [];
                winnerArray.push(playerId);
            }
        })
        const chipsByWinner = Math.floor(config.CURRENT_BETS.get("POT") / winnerArray.length);
        winnerArray.forEach(function (id) {
            winnersMap.set(id, chipsByWinner);
        })
        return winnersMap;
    }


    //initialise un tableau vide à 2 entres avec les couleurs et les types + 1 colonne par dimension pour garder en memoire le total de chaque couleur/type
    /*
    exemple:        |PIQUE  | COEUR     | CARREAU   | TREFLE    | TOTAL
                2   |       |           |           |           |
                ....
                Roi |       |           |           |           |
                1   |       |           |           |           |
            TOTAL   |       |           |           |           |
    */
    static initValueCardsArray() {
        //console.log("inside initValueCardsArray");

        let currArray = [];
        for (let i = 0; i < 5; i++) {
            currArray[i] = [];
            for (let j = 0; j < 14; j++) {
                currArray[i][j] = 0;
            }
        }
        //console.log("ending initValueCardsArray");
        return currArray;
    }

    static fillCardsArray(cards) {
        //console.log("inside fillCardsArray");
        let currArray = this.initValueCardsArray();
        //on remplit le tableau à double entree selon le kind et color de la carte
        cards.forEach(function (card) {
            currArray[config.CARDS_VALUE_MAP.get(card.color)][config.CARDS_VALUE_MAP.get(card.kind)]++;
            currArray[config.CARDS_VALUE_MAP.get(card.color)][0]++;
            currArray[0][config.CARDS_VALUE_MAP.get(card.kind)]++;
            //console.log("on ajoute la carte " + card.kind + " " + card.color);
        });
        return currArray;
    }
    static getHandValue(cards) {
        //console.log("inside getHandValue")
        let valueCardsArray = this.fillCardsArray(cards);
        let mainFinal = null;
        for (let main = 8; main >= 0; main--) {
            //console.log(" main = " + main);
            switch (main) {
                case 8:
                    //confirme
                    mainFinal = this.haveQuinteFlush(valueCardsArray);
                    break;
                case 7:
                    //confirme
                    mainFinal = this.haveFour(valueCardsArray);
                    break;
                case 6:
                    //confirme
                    mainFinal = this.haveFull(valueCardsArray);
                    break;
                case 5:
                    //confirme
                    mainFinal = this.haveFlush(valueCardsArray);
                    break;
                case 4:
                    //confirme
                    mainFinal = this.haveQuinte(valueCardsArray);
                    break;
                case 3:
                    //confirme
                    mainFinal = this.haveBrelan(valueCardsArray);
                    break;
                case 2:
                    //confirme
                    mainFinal = this.haveDouble(valueCardsArray);
                    break;
                case 1:
                    //confirme
                    mainFinal = this.havePair(valueCardsArray);
                    break;
                case 0:
                    //confirme
                    mainFinal = this.haveHigh(valueCardsArray);
                    break;
            }
            if (mainFinal) {
                return mainFinal;
            }
        }
    }

    static haveBrelan(valueCardsArray) {
        let ponderation = [100, 1];
        let iterPonderation = 0;
        let complement = 0;
        let hauteur = 0;
        for (let valeur = 13; valeur >= 1; valeur--) {
            if (valueCardsArray[0][valeur] === 3) {
                hauteur = valeur;
            }
            if (valueCardsArray[0][valeur] === 1 && iterPonderation < 2) {
                complement = complement + valeur * ponderation[iterPonderation];
                iterPonderation++;
            }
        }
        if (hauteur > 0) {
            return [4, hauteur * (100 * 100) + complement];
        }
        return;
    }

    static haveDouble(valueCardsArray) {
        let complement = 0;
        let hauteur1 = 0;
        let hauteur2 = 0;
        for (let valeur = 13; valeur >= 1; valeur--) {
            if (valueCardsArray[0][valeur] === 1 && complement === 0) {
                complement = valeur;
            }
            if (valueCardsArray[0][valeur] === 2 && hauteur1 !== 0 && hauteur2 === 0) {
                hauteur2 = valeur;
            }
            if (valueCardsArray[0][valeur] === 2 && hauteur1 === 0) {
                hauteur1 = valeur;
            }
        }
        if (hauteur1 > 0 && hauteur2 > 0) {
            return [3, hauteur1 * (100 * 100) + hauteur2 * 100 + complement];
        }
        return;
    }


    static haveFlush(valueCardsArray) {
        let ponderation = [100 * 100 * 100 * 100, 100 * 100 * 100, 100 * 100, 100, 1];
        let iterPonderation = 0;
        let hauteur = 0;
        for (let couleur = 1; couleur <= 4; couleur++) {
            if (valueCardsArray[couleur][0] >= 5) {
                for (let valeur = 13; valeur >= 1; valeur--) {
                    if (valueCardsArray[couleur][valeur] === 1 && iterPonderation < 5) {
                        hauteur = hauteur + valeur * ponderation[iterPonderation];
                        iterPonderation++;
                    }
                }
                return [6, hauteur];
            }
        }
        return;
    }
    static haveFull(valueCardsArray) {
        let hauteur = 0;
        let complement = 0;
        for (let valeur = 13; valeur >= 1; valeur--) {
            if (valueCardsArray[0][valeur] === 3 && hauteur === 0) {
                hauteur = valeur;
            }
            if (valueCardsArray[0][valeur] === 2 && complement === 0) {
                complement = valeur;
            }
        }
        if (hauteur > 0 && complement > 0) {
            return [7, hauteur * 100 + complement];
        }
        return;
    }
    static haveFour(valueCardsArray) {
        let hauteur = 0;
        let complement = 0;
        for (let valeur = 13; valeur >= 1; valeur--) {
            if (valueCardsArray[0][valeur] === 4 && hauteur === 0) {
                hauteur = valeur;
            }
            if (valueCardsArray[0][valeur] >= 1 && valueCardsArray[0][valeur] < 4 && complement === 0) {
                complement = valeur;
            }
        }
        if (hauteur > 0) {
            return [8, hauteur * 100 + complement];
        }
        return;
    }
    static haveHigh(valueCardsArray) {
        let ponderation = [100 * 100 * 100 * 100, 100 * 100 * 100, 100 * 100, 100, 1];
        let iterPonderation = 0;
        let hauteur = 0;
        for (let valeur = 13; valeur >= 1; valeur--) {
            if (valueCardsArray[0][valeur] === 1 && iterPonderation < 5) {
                hauteur = hauteur + valeur * ponderation[iterPonderation];
            }
        }
        return [1, hauteur];
    }

    static havePair(valueCardsArray) {
        let ponderation = [100 * 100, 100, 1];
        let iterPonderation = 0;
        let hauteur = 0;
        let complement = 0;
        for (let valeur = 13; valeur >= 1; valeur--) {
            if (valueCardsArray[valeur] === 2 && hauteur === 0) {
                hauteur = valeur;
            }
            if (valueCardsArray[valeur] === 1 && iterPonderation < 3) {
                complement = complement + valeur * ponderation[iterPonderation];
                iterPonderation++;
            }
        }
        if (hauteur > 0) {
            return [2, hauteur * (100 * 100 * 100) + complement];
        }
        return;
    }

    static haveQuinte(valueCardsArray) {
        let compteurAffile = 0;
        let hauteur = 0;
        for (let valeur = 14; valeur >= 1; valeur--) {
            valeur = valeur - 1;
            //permet de consider 1 comme As et 1
            if (valeur === 0) {
                valeur = 13;
            }
            if (valueCardsArray[0][valeur] >= 1) {
                if (hauteur === 0) {
                    hauteur = valeur;
                }
                compteurAffile++;
                if (compteurAffile === 5) {
                    return [5, hauteur];
                }
            } else {
                compteurAffile = 0;
                hauteur = 0;
            }
        }
        return;
    }

    static haveQuinteFlush(valueCardsArray) {
        //console.log("inside haveQuinteFlush");
        let compteurAffilé = 0;
        let valeurFirst = 0;
        for (let couleur = 1; couleur <= 4; couleur++) {
            //si on a au moins 5 cartes pour cette couleur on peut tester
            if (valueCardsArray[couleur][0] >= 5) {
                for (let valeur = 14; valeur >= 1; valeur--) {
                    valeur = valeur - 1;
                    //permet de consider 1 comme As et 1
                    if (valeur === 0) {
                        valeur = 13;
                    }
                    if (valueCardsArray[couleur][valeur] === 1) {
                        if (valeurFirst === 0) {
                            valeurFirst = valeur;
                        }
                        compteurAffilé++;
                        if (compteurAffilé === 5) {
                            return [9, valeurFirst];
                        }
                    } else {
                        compteurAffilé = 0;
                        valeurFirst = 0;
                    }
                }
            }
            compteurAffilé = 0;
            valeurFirst = 0;
        }
        //console.log("ending haveQuinteFlush");
        return;
    }




    ////////////////// FOR PLAYER //////////////////////
    static handValueToNeuronalInput(playerMemo) {
        const hand = playerMemo.turnsDetails[playerMemo.totalHands].hand;
        const tapis = playerMemo.turnsDetails[playerMemo.totalHands].tapis;
        const cards = hand.concat(tapis);
        let handValueArray;
        if (tapis.length === 0) {
            handValueArray = this.getHandValuePreflop(hand);
        }
        else {
            handValueArray = this.getHandValue(cards);
        }
        //console.log("hand value array = " + handValueArray[0] + " et " + handValueArray[1]);
        let neuronalInput = (handValueArray[0] / 10) + (handValueArray[1] / 1000000000000);
        //console.log("neuronalInput = " + neuronalInput);
        //playerMemo.turnsDetails[playerMemo.totalHands].currInput.input["handValue"] = neuronalInput;
    }

    static getHandValuePreflop(hand){
        let valueCardsArray = this.fillCardsArray(hand);
        let mainFinal = null;
        for (let main = 4; main >= 0; main--) {
            //console.log(" main = " + main);
            switch (main) {
                case 4:
                    //confirme
                    mainFinal = this.havePairWithHand(valueCardsArray);
                    break;
                case 3:
                    //confirme
                    mainFinal = this.haveSameColor(valueCardsArray);
                    break;
                case 2:
                    //confirme
                    mainFinal = this.haveFollow(valueCardsArray);
                    break;
                case 1:
                    //confirme
                    mainFinal = this.haveBigFigures(valueCardsArray);
                    break;
                case 0:
                    //confirme
                    mainFinal = this.getHandValue(hand);
                    break;
            }
            if (mainFinal) {
                return mainFinal;
            }
        }
    }

    static havePairWithHand(valueCardsArray) {
        let ponderation = [100 * 100, 100, 1];
        let iterPonderation = 0;
        let hauteur = 0;
        let complement = 0;
        for (let valeur = 13; valeur >= 1; valeur--) {
            if (valueCardsArray[valeur] === 2 && hauteur === 0) {
                hauteur = valeur;
            }
            if (valueCardsArray[valeur] === 1 && iterPonderation < 3) {
                complement = complement + valeur * ponderation[iterPonderation];
                iterPonderation++;
            }
        }
        if (hauteur > 0) {
            return [8, hauteur * (100 * 100 * 100) + complement];
        }
        return;
    }

    static haveFollow(valueCardsArray){
        let compteurAffile = 0;
        let hauteur = 0;
        for (let valeur = 14; valeur >= 1; valeur--) {
            valeur = valeur - 1;
            //permet de consider 1 comme As et 1
            if (valeur === 0) {
                valeur = 13;
            }
            if (valueCardsArray[0][valeur] >= 1) {
                if (hauteur === 0) {
                    hauteur = valeur;
                }
                compteurAffile++;
                if (compteurAffile === 2) {
                    return [5, hauteur];
                }
            } else {
                compteurAffile = 0;
                hauteur = 0;
            }
        }
        return;
    }

    static haveBigFigures(valueCardsArray){
        let iterHigh = 0;
        let hauteur = 0;
        for (let valeur = 14; valeur >= 10; valeur--) {
            valeur = valeur - 1;
            //permet de consider 1 comme As et 1
            if (valeur === 0) {
                valeur = 13;
            }
            if (valueCardsArray[0][valeur] >= 1) {
                if (hauteur === 0) {
                    hauteur = valeur;
                }
                iterHigh++;
                if (iterHigh === 2) {
                    return [4, hauteur];
                }
            } 
        }
        return;
    }

    static haveSameColor(valueCardsArray){
        let ponderation = [100 * 100 * 100 * 100, 100 * 100 * 100, 100 * 100, 100, 1];
        let iterPonderation = 0;
        let hauteur = 0;
        for (let couleur = 1; couleur <= 4; couleur++) {
            if (valueCardsArray[couleur][0] >= 2) {
                for (let valeur = 13; valeur >= 1; valeur--) {
                    if (valueCardsArray[couleur][valeur] === 1 && iterPonderation < 2) {
                        hauteur = hauteur + valeur * ponderation[iterPonderation];
                        iterPonderation++;
                    }
                }
                return [6, hauteur];
            }
        }
        return;
    }
}

module.exports = HandValueHelper;
