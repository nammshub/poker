const EventEmitter = require("events");
const StartListener = require("./StartListener");
const CardsListener = require("./CardsListener");
const HandStartListener = require("./HandStartListener");
const HandEndListener = require("./HandEndListener");
const PlayListener = require("./PlayListener");
const BoardListener = require("./BoardListener");
const ServerPlayerActionListener = require("./ServerPlayerActionListener");
const BlindChangeListener = require("./BlindChangeListener");

const startListener = new StartListener();
const cardsListener = new CardsListener();
const handStartListener = new HandStartListener();
const handEndListener = new HandEndListener();
const playListener = new PlayListener();
const boardListener = new BoardListener();
const serverPlayerActionListener = new ServerPlayerActionListener();
const blindChangeListener = new BlindChangeListener();
const ERROR_REGEX = /^Unexpected token { in JSON at position (\d+)$/;

class TCPListener extends EventEmitter {
    handleTCPData(data, playerMemo, net, callback) {
        let messageArray = [];
        this.jsonMultiParse(data, messageArray);
        messageArray.forEach(function (message) {
            switch (message.id) {
                case "server.lobby.join.success":
                    //console.log("Rejoindre le lobby = succes");
                    break;
                case "server.lobby.join.failure":
                    //console.log("Rejoindre le lobby = echec " + message.data.reason);
                    break;
                case "server.game.start":
                    //console.log("Le jeu commence !! nbr joueurs = " + message.data.count);
                    startListener.handleMessage(message, playerMemo);
                    break;
                case "server.game.player.cards":
                    //console.log("Un joueur recoit ses cartes");
                    cardsListener.handleMessage(message, playerMemo);
                    break;
                case "server.game.hand.start":
                    //console.log("Une nouvelle main commence");
                    handStartListener.handleMessage(message, playerMemo);
                    break;
                case "server.game.turn.start":
                    //console.log("Un nouveau tour commence");
                    break;
                case "server.game.turn.end":
                    //console.log("Un nouveau tour se termine");
                    break;
                case "server.game.blind.change":
                    //console.log("Les Blindes changent : Small blind -> " + message.data.small + ", Big Blind -> " + message.data.big);
                    blindChangeListener.handleMessage(message, playerMemo);
                    break;
                case "server.game.player.play":
                    //console.log("A vous de jouer");
                    playListener.handleMessage(playerMemo, net, callback);
                    break;
                case "server.game.player.play.timeout":
                    //console.log("Vous etes en time out !!");
                    break;
                case "server.game.player.play.success":
                    //console.log("Votre coup est valide et a bien été pris en compte par le serveur");
                    break;
                case "server.game.player.play.failure":
                    //console.log("Votre coup n'est pas valide et n'a pas été pris en compte par le serveur");
                    break;
                case "server.game.player.action":
                    //console.log("Un joueur à joué");
                    serverPlayerActionListener.handleMessage(message, playerMemo);
                    break;
                case "server.game.board.cards":
                    //console.log("Nouvelles cartes sur le board");
                    boardListener.handleMessage(message, playerMemo);
                    break;
                case "server.game.hand.end":
                    //console.log("gagnant pour la main");
                    handEndListener.handleMessage(message, playerMemo);
                    break;
                case "server.game.end":
                    //console.log("fin de la partie");
                    break;
                default:
                    //console.log("message imprevu data " + data);
            }
        })
    }

    jsonMultiParse(input, acc) {
        if (input.toString().trim().length === 0) {
            return acc;
        }
        try {
            acc.push(JSON.parse(input));
            return acc;
        } catch (error) {
            const match = error.message.match(ERROR_REGEX);
            if (!match) {
                throw error;
            }
            const index = parseInt(match[1], 10);
            acc.push(JSON.parse(input.toString().substr(0, index)));
            return this.jsonMultiParse(input.toString().substr(index), acc);
        }
    }

}

module.exports = TCPListener;
