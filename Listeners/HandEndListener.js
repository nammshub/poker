const LogHelper = require("../Helpers/LogHelper");

//var game = [r: 0.03, g: 0.7, b: 0.5];

/**
 * Ce listener gere l"event end. Il doit stocker nos résultats de partie
 */
class HandEndListener {
    handleMessage(endMessage,playerMemo) {
        //calcul si les coups joues ce tour ci etaient bon ou nuls

        //enregistrement des coups dans le fichier de log
        LogHelper.logNeuronalInput(JSON.stringify(playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].neuronalInput), playerMemo.logFile);
       
    }

}

module.exports = HandEndListener;