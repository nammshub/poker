require('../config');
var fs = require("fs");
<<<<<<< HEAD
var game = ['r: 0.03', 'g: 0.7', 'b: 0.5'];
=======
//var game = [r: 0.03, g: 0.7, b: 0.5];
>>>>>>> 315c1fe42ed9a1b67baec4e21d3976ce592059ab


/**
 * Ce listener gere l'event end. Il doit stocker nos résultats de partie
 */
class HandEndListener {
    handleMessage(endMessage) {

        var input = game.join(', ');
        saveTxt = '{input: ' + input + ', output: '+ outputResult + '}';



        fs.writeFileSync("pokerIA.txt", saveTxt, "UTF-8");
    }

}

module.exports = HandEndListener;