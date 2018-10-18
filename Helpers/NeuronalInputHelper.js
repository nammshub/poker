var fs       = require('fs');
var Promise  = require('promise');
var promises = [];
var readline = require('readline');

function readFile(file) {
    return new Promise(function (resolve, reject) {
        var lines = [];
        var rl    = readline.createInterface({
            input: fs.createReadStream("../Logs/"+file)
        });

        rl.on('line', function (line) {
            lines.push(line);
        });

        rl.on('close', function () {
            resolve(lines)
        });
    });
};

function writeFile(data) {
    return new Promise(function (resolve, reject) {
        fs.appendFile('./neuronalInputHelper.json', data, 'utf8', function (err) {
            if (err) {
                resolve('Writing file error!');
            } else {
                reject('Writing file succeeded!');
            }
        });
    });
};

fs.readdir('../Logs', function (err, files) {
    for (var i = 0; i < files.length; i++) {
        promises.push(readFile(files[i]));

        if (i == (files.length - 1)) {
            var results = Promise.all(promises);

            results.then(writeFile)
                .then(function (data) {
                    console.log(data)
                }).catch(function (err) {
                console.log(err)
            });
        }

    }
});