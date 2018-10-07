require("../config");
var fs = require("fs");

//var game = [r: 0.03, g: 0.7, b: 0.5];

/**
 * Ce listener gere l"event end. Il doit stocker nos résultats de partie
 */
class HandEndListener {
    handleMessage(endMessage) {

        var input = game.join(", ");
        saveTxt = "{input: " + input + ", output: "+ outputResult + "}";



        fs.writeFileSync("pokerIA.txt", saveTxt, "UTF-8");
    }

}

module.exports = HandEndListener;