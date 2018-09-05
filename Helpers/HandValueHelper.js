const fs = require('fs');
require('../config');

class HandValueHelper{

    /**
     * methode qui prend en entree un tableau de cartes et retourne leur valeur selon le bareme decrit dans ALGO_HAND_VALUE
     * 
     * Ex: 
     * - Quinte flush royale vaut [10,0]
     * - Brelan de 3 par les 2 vaut [4,302]
     */
    static getHandValue(cards){
        const cardsAsMAp = getCardsAsMap(cards);
        let handValue = [];
        handValue = testAllCombinaisons(cardsAsMAp);
        return handValue;
    }

    static getCardsAsMap(cards){
        let cardsMap = new Map();
        cards.forEach( function(card){
            let kindOccurences = typeof cardsMap.get(card.kind) === 'undefined' ? 0 : cardsMap.get(card.kind);
            let colorOccurences = typeof cardsMap.get(card.color) === 'undefined' ? 0 : cardsMap.get(card.color);
            cardsMap.set(card.kind, kindOccurences+1);
            cardsMap.set(card.color, colorOccurences+1);
            //gestion de l'As qui vaut 1 et AS
            if(card.kind === '1'){
                kindOccurences = typeof cardsMap.get('AS') === 'undefined' ? 0 : cardsMap.get('AS');
                cardsMap.set('AS', kindOccurences+1);
            }
        })
        return cardsMap
    }

    static testAllCombinaisons(cardsAsMAp){
        let handValue = [];

        //test quinte flush royal
        handValue = testQuinteFlushRoyale(cardsAsMAp);
        if(handValue.length > 0){
            return handValue;
        }

        //test quinte flush
        handValue = testQuinteFlush(cardsAsMAp);
        if(handValue.length > 0){
            return handValue;
        }

    }

    static testQuinteFlushRoyale(cardsAsMAp){
        if (
            //test 5 memes couleurs
            (cardsAsMap.get('SPADE') === 5 || cardsAsMap.get('HEART') === 5 || cardsAsMap.get('DIAMOND') === 5 ||cardsAsMap.get('CLUB') === 5)
            &&
            //test suite
            (cardsAsMap.get('AS') === 1 && cardsAsMap.get('KING') === 1 && cardsAsMap.get('QUEEN') === 1 && cardsAsMap.get('JACK') === 1 && cardsAsMap.get('10') === 1)
        ){
            return [10,0]
        }
        return [];
    }

    static testQuinteFlush(cardsAsMAp){
        //test 5 memes couleurs
        if (          
            (cardsAsMap.get('SPADE') === 5 || cardsAsMap.get('HEART') === 5 || cardsAsMap.get('DIAMOND') === 5 ||cardsAsMap.get('CLUB') === 5)){
            //test suites possibles
            if (cardsAsMap.get('KING') === 1 && cardsAsMap.get('QUEEN') === 1 && cardsAsMap.get('JACK') === 1 && cardsAsMap.get('10') === 1 && cardsAsMap.get('9') === 1)
                return [9,13];
            if (cardsAsMap.get('QUEEN') === 1 && cardsAsMap.get('JACK') === 1 && cardsAsMap.get('10') === 1 && cardsAsMap.get('9') === 1 && cardsAsMap.get('8') === 1)
                return [9,12];
            if (cardsAsMap.get('JACK') === 1 && cardsAsMap.get('10') === 1 && cardsAsMap.get('9') === 1 && cardsAsMap.get('8') === 1 && cardsAsMap.get('7') === 1)
                return [9,11];
            if (cardsAsMap.get('10') === 1 && cardsAsMap.get('9') === 1 && cardsAsMap.get('8') === 1 && cardsAsMap.get('7') === 1 && cardsAsMap.get('6') === 1)
                return [9,10];
            //TODO
        }
        return [];
    }
}

module.exports =  HandValueHelper;