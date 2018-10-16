//{input: { h1: 0.03, h2: 0.7, t1: 0.5, t2: 0.16, t3: 0.09 ,p1_a1 : 0,p2_a1 : 0.006 ,m_a1 : 0.006, p4_a1 : 0,p2_a2 :0.002 g : 0.7  }, output: { chips: 0.005 }}
const fs = require('fs'); 
/**
 * class en charge de logs les coups joues dans un fichier propre à chaque joueur
 */
class LogHelper{

        static logNeuronalInput(neuronalInput, file){
            fs.appendFile(file, neuronalInput + ",", function (err) {
                if (err) throw err;
                console.log('Saved!');
              });
        }
}

module.exports = LogHelper;