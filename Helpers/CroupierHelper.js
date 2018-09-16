require('../config');
const CroupierMessageHandler = require('../Croupier/CroupierMessageHandler');


class CroupierHelper {

    /**
     * Fonction static qui extrait au hasard depuis un objet deck passé en entree un nbr de cartes determine et les retourne sous la forme d'un tableau de json prevue à savoir
     * [
     *  {
        "kind": "2",
        "color": "SPADE"
        },
        {
        "kind": "6",
        "color": "DIAMOND"
        }
     * ]
     * @param {*} sourceDeck 
     * @param {*} cardsNb 
     */
    static getRandomCards(sourceDeck, cardsNb){
        console.log('\ninside getRandomCards');
        console.log('\nsourceDeck length = '+sourceDeck.length);
        console.log('\ncardsNb = '+cardsNb);
        let cardsToReturn = [];
        let iter = 0;
        while (iter < cardsNb && sourceDeck.length > 0){
            let randomPos = Math.floor(Math.random() * sourceDeck.length);
            cardsToReturn.push(sourceDeck[randomPos]);
            sourceDeck.splice(randomPos,1);
            iter++;
        }
        if(iter != cardsNb){
            throw config.DECK_EMPTY_EXCEPTION;
        }
        return cardsToReturn;
    }

    static putCardsOnTable(sourceDeck,cardsNb){
        const newCards = this.getRandomCards(sourceDeck, cardsNb);
        config.CARDS_ON_TABLE =  config.CARDS_ON_TABLE.concat(newCards);
        const updateMessage = {
            "id": "server.game.board.cards",
            "data": {
              "cards": newCards
            }
        }
        CroupierMessageHandler.broadcast(JSON.stringify(updateMessage));
    }
}

module.exports = CroupierHelper;