require("../config");
const CroupierMessageHandler = require("../Croupier/CroupierMessageHandler");


class CroupierHelper {

    /**
     * Fonction static qui extrait au hasard depuis un objet deck passé en entree un nbr de cartes determine et les retourne sous la forme d"un tableau de json prevue à savoir
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
        console.log("\ninside getRandomCards");
        console.log("\nsourceDeck length = "+sourceDeck.length);
        console.log("\ncardsNb = "+cardsNb);
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

    static getNextPlayer(){
        if(!config.CURR_PLAYER){
            console.log("inside getNextPlayer => !config.CURR_PLAYER");
            //config.PLAYERS.forEach( function(player){
                let iter;
                for (iter in config.PLAYERS){
                console.log("config.PLAYERS.forEach player = "+config.PLAYERS[iter].details.id +" state = "+config.PLAYERS[iter].details.state);
                if(config.PLAYERS[iter].details.state === "ACTIVE" && config.PLAYERS[iter].details.chips > 0){
                    console.log("inside player.details.state === ACTIVE");
                    config.CURR_PLAYER = config.PLAYERS[iter];
                    return config.CURR_PLAYER;
                }
            }
            
        }
        else{
            console.log("inside getNextPlayer => config.CURR_PLAYER");
            //on prend le joueur actif suivant
            let foundPrecedingPlayer = false;
            let iter;
            for (iter in config.PLAYERS){
                if(foundPrecedingPlayer && config.PLAYERS[iter].details.state === "ACTIVE" && config.PLAYERS[iter].details.chips > 0){
                    return config.PLAYERS[iter];
                }
                if(config.PLAYERS[iter].details.id === config.CURR_PLAYER.details.id){
                    foundPrecedingPlayer = true;
                }
            };
            console.log("inside getNextPlayer => 2e boucle => foundPrecedingPlayer = "+foundPrecedingPlayer);
            for (iter in config.PLAYERS){
                console.log("inside getNextPlayer => 2e boucle => state = "+config.PLAYERS[iter].details.state+" id = "+config.PLAYERS[iter].details.id);
                if(foundPrecedingPlayer && config.PLAYERS[iter].details.state === "ACTIVE" && config.PLAYERS[iter].details.chips > 0){
                    return config.PLAYERS[iter];
                }
            };
        }
    }
}

module.exports = CroupierHelper;