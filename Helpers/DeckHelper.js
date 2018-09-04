const fs = require('fs');
require('../config');

class DeckHelper{

    /**
     * methode a appeler pour gener un deck complet
     */
    static generateNewDeckFile(){
        const deckPath = "../deck.js";


        let deckContent = 'global.DECK = [';
        config.ALL_COLORS.forEach( function(color){
            config.ALL_KINDS.forEach( function(kind){
                deckContent = deckContent.concat('{ "kind" : "'+kind+'", "color" : "' + color +'"},');
            })
        })
        deckContent = deckContent.substring(0,deckContent.length-1);
        deckContent = deckContent.concat(']');
      

        fs.writeFile(deckPath, deckContent, function (err) {
            if (err) throw err;
            console.log('Saved!');
          });
    }
}

module.exports =  DeckHelper;