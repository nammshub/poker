require("../config");
const NeuronalNetworkListener = require("./NeuronalNetworkListener");
/**
 * Ce listener gere l"event cards. Il doit stocker nos cartes du tour
 */
class NeuronalNetworkHelper  {
    insertNeuronalAnswer(actionNbrIter, turnNumber, output) {
        neuronalNetworkListener.launchCompute( actionNbrIter, function(output){
            
        });
        //console.log("object game contains" + JSON.stringify(game));
    }
}

module.exports = CardsListener;