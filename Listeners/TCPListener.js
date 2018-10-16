const EventEmitter = require("events");
const StartListener = require("./StartListener");
const CardsListener = require("./CardsListener");
const HandStartListener = require("./HandStartListener");
const HandEndListener = require("./HandEndListener");
const PlayListener = require("./PlayListener");
const BoardListener = require("./BoardListener");
const ServerPlayerActionListener = require("./ServerPlayerActionListener");


const startListener = new StartListener();
const cardsListener = new CardsListener();
const handStartListener = new HandStartListener();
const handEndListener = new HandEndListener();
const playListener = new PlayListener();
const boardListener = new BoardListener();
const serverPlayerActionListener = new ServerPlayerActionListener();
class TCPListener extends EventEmitter {
    handleTCPData(data, playerMemo, net, callback) {
        const message = JSON.parse(data);
        switch (message.id) {
            case "server.game.start":
                console.log("Le jeu commence !! nbr joueurs = " + message.data.count);
                startListener.handleMessage(message, playerMemo);
                break;
            case "server.game.cards":
                console.log("Un joueur recoit ses cartes");
                cardsListener.handleMessage(message, playerMemo);
                break;
            case "server.game.hand.start":
                console.log("Une nouvelle main commence");
                handStartListener.handleMessage(message, playerMemo);
                break;
            case "server.game.play":
                console.log("A vous de jouer");
                playListener.handleMessage(playerMemo, net, callback);
                break;
            case "server.game.board.cards":
                console.log("Nouvelles cartes sur le board");
                boardListener.handleMessage(message, playerMemo);
                break;
            case "server.game.play.timeout":
                console.log("Vous etes en time out !!");
                break;
            case "server.game.hand.end":
                console.log("gagnant pour la main");
                handEndListner.handleMessage(message, playerMemo);
                break;
            case "server.game.end":
                console.log("fin de la partie");
                break;
            case "server.lobby.join.success":
                console.log("Rejoindre le lobby = succes");
                break;
            case "server.lobby.join.failure":
                console.log("Rejoindre le lobby = echec " + message.data.reason);
                break;
            case "server.player.action":
                console.log("Un joueur à joué");
                serverPlayerActionListener.handleMessage(message, playerMemo);
                break;
            default:
                console.log("message imprevu data " + data);
        }
    }
}

module.exports = TCPListener;