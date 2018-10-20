var fs = require('fs');
require("../config");

class NetworkTrainingHelper {
    //entraine le reseau sauvegarde ensuite le reseau sous forme de file json
    static trainNetwork(network, dataArray, jsonTrainedPath) {
        const before = new Date();
        console.log('before train = ' + before);
        network.train(dataArray, {
            iterations: config.TRAINING_ITERATION,
            log: true,
        });
        const after = new Date();
        console.log('after train = ' + after);
        //svg en JSON
        const jsonTrainedNetwork = network.toJSON();
        fs.writeFileSync(jsonTrainedPath, JSON.stringify(jsonTrainedNetwork));

    }
}

module.exports = NetworkTrainingHelper;