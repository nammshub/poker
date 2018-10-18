const fs = require("fs");
require("../config");
require("../deck");

class DeckHelper{

    /**
     * methode a appeler pour gener un deck complet
     */
    static generateNewDeckFile(){
        const deckPath = "../deck.js";

        let iter = -1;
        let deckContent = "global.DECK = [";
        config.ALL_COLORS.forEach( function(color){
            config.ALL_KINDS.forEach( function(kind){
                iter++;
                deckContent = deckContent.concat("{ \"kind\" : \""+kind+"\", \"color\" : \"" + color +"\", \"cardInput\" : " + (iter/52) +"},");
            })
        })
        deckContent = deckContent.substring(0,deckContent.length-1);
        deckContent = deckContent.concat("]");
      

        fs.writeFile(deckPath, deckContent, function (err) {
            if (err) throw err;
            console.log("Saved!");
          });
    }

    static compare(a,b) {
        if (a.cardInput < b.cardInput)
          return -1;
        if (a.cardInput > b.cardInput)
          return 1;
        return 0;
      }
    
      /**
       * for a give json card with kind and color, will return the corresponding card input between 0 and 1
       * @param {*} cardJson 
       */
      static getCardInput(cardJson){
        for (let card of DECK){
            if(card.kind === cardJson.kind && card.color === cardJson.color){
                return card.cardInput;
            }
        }

      }
}

module.exports =  DeckHelper;