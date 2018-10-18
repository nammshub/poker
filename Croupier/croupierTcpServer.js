/**
 * Cette classe main lance une partie.
 * Attend que les joueurs se connectent pendant  minute ensuite lance les tours jusqu" a ce qu"il y aie un gagnant ou que  tours soient passés
 */

var net = require("net");
require("../config");
require("../deck");
//const DeckHelper = require("../Helpers/DeckHelper");
const CroupierHelper = require("../Helpers/CroupierHelper");
const BlindHelper = require("../Helpers/BlindHelper");
const CroupierMessageHandler = require("./CroupierMessageHandler");
const HandValueHelper = require("../Helpers/HandValueHelper");
const PORT = config.PORT;
const timeoutMessage = {
  "id": "server.game.play.timeout"
};
const playMessage = {
  "id": "server.game.play"
};

//deck du tour
let currentDeck = [];

//generate new deck file
//DeckHelper.generateNewDeckFile();

// Start a TCP Server
net.createServer(function (socket) {

  config.NB_PLAYERS++;
  // Identify this client
  let playerDetails = {
    "id": config.NB_PLAYERS,
    "name": "Player" + config.NB_PLAYERS,
    "chips": config.START_MONEY,
    "state": "ACTIVE",
    "dealer": false
  };
  let currPlayer = {
    "details": playerDetails,
    "socket": socket
  };

  // Put this new player in the list
  config.PLAYERS.push(currPlayer);

  // Send a nice welcome message and announce
  console.log("\nWelcome " + currPlayer.details.id + "\n");

  // Handle incoming messages from clients.
  socket.on("data", function (data) {
    CroupierMessageHandler.handleData(data, socket);
  });

  // Remove the client from the list when it leaves
  socket.on("end", function () {
    config.PLAYERS.every(function (player, iter) {
      if (player.socket === socket) {
        console.log(player.details.name + " leaves the game.\n");
        config.PLAYERS.splice(iter, 1);
        config.NB_PLAYERS--;
        return true;
      }
    });
  });

  // Remove the client from the list when it leaves
  socket.on("error", function (data) {
    console.log("\nException : " + data);
  });

}).listen(PORT);

// Put a friendly message on the terminal of the server.
console.log("Poker server running at port " + PORT + "\n");

function hasAllChecked() {
  //return true SSI tous les joueurs actifs ont suivi la mise la plus haute
  for (let player of config.PLAYERS) {
    console.log("player.details.id = " + player.details.id);
    console.log(" !config.CURRENT_BETS.get(player.details.id) " + !config.CURRENT_BETS.get(player.details.id));
    console.log(" player.details.state === ACTIVE " + player.details.state === "ACTIVE");
    console.log("config.CURRENT_BETS.get(player.details.id " + config.CURRENT_BETS.get(player.details.id));

    if (!config.CURRENT_BETS.get(player.details.id) || (player.details.state === "ACTIVE" && player.details.chips > 0 && config.CURRENT_BETS.get(player.details.id) !== config.CURRENT_MAX_BET)) {
      return false;
    }
  }
  console.log("tout le monde a check au taux de " + config.CURRENT_MAX_BET);
  return true;
}

function hasHandWinner() {
  let active = 0;
  config.PLAYERS.forEach(function (player) {
    if (player.details.state === "ACTIVE") {
      active++;
    }
  })
  return active === 1;
}

/**
 * return true if only 1 play is not FORFAIT
 */
function hasWinner() {
  let nbForfait = 0;
  config.PLAYERS.forEach(function (player) {
    if (player.details.state === "ELIMINATED") {
      nbForfait++;
    }
  })
  return nbForfait === config.PLAYERS.length - 1;
}

async function launchPlayCurrHand() {
  /*
  une main se decompose en 4 phases de mises entrecoupées de pose de cartes sur le tapis par le croupier
  Une main peut se terminer prematurement si tous les joueurs sauf un se couchent
  */
  let winnerMap = new Map();
  let step = 1;
  await playerBets();
  console.log("after first player bets");
  while (!hasHandWinner() && step < 4) {
    console.log("step = " + step);
    switch (step) {
      //flop
      case 1:
        CroupierHelper.putCardsOnTable(currentDeck, 3);
        break;
      default:
        CroupierHelper.putCardsOnTable(currentDeck, 1);
        break;
    }
    step++;
    //La mise max retourne à 0 => possibilite de check
    config.CURRENT_MAX_BET = 0;
    //on dort une seconde pour eviter les accrocs de transmission trop rapide
    await sleep(1000);
    await playerBets();
  }
  if (step === 4) {
    console.log("step 4 =>who is the winner of the hand ?");
    //on est arrive en fin de main, il faut determiner le vainqueur parmi les joueurs encore ACTIFS
    winnerMap = HandValueHelper.getWinners();
  }
  else {
    config.PLAYERS.forEach(function (player) {
      if (player.details.state === "ACTIVE") {
        winnerMap.set(player.details.id, config.CURRENT_BETS.get("POT"));
      }
    })
  }
  CroupierMessageHandler.handleWinnerMap(winnerMap);

}

function orderPlayers() {
  console.log("inside orderPlayers");
  let activeArray = [];
  let eliminatedArray = [];
  let position = 0;
  for (let player of config.PLAYERS) {
    position++;
    player.details.state = "ELIMINATED"
    if (player.details.chips > 0) {
      player.details.state = "ACTIVE"
    }
    if (position > 1) {
      if (player.details.state === "ACTIVE") {
        activeArray.push(player);
      }
      else {
        eliminatedArray.push(player);
      }
    }
  }
  //on gere ensuite l"ancien 1er joueur
  if (config.PLAYERS[0].details.state === "ACTIVE") {
    activeArray.push(config.PLAYERS[0]);
  }
  else {
    eliminatedArray.push(config.PLAYERS[0]);
  }

  //on concat les 2 tableaux dans le config.PLAYERS
  activeArray.concat(eliminatedArray);
  config.PLAYERS = activeArray;
  console.log("config.PLAYERS size = " + config.PLAYERS.length)
  console.log("end orderPlayers");
}

async function playerBets() {
  /*
    On va tourner sur chaque joueur actif pour avoir son message soit de se coucher soit de suivre soit de relancer 
    et ce jusqu"a avoir tout le monde de couche sauf un ou que tout le monde aie suivi
  */
  console.log("inside playerBets");
  while (!hasHandWinner() && !hasAllChecked()) {
    //on boucle sur chaque joueur actif qui a encore des chips pour avoir son message
    let currPlayer = CroupierHelper.getNextPlayer();
    console.log(" joueur actif = " + currPlayer.details.id);
    console.log("etat des joueurs du tour : ");
    config.PLAYERS.forEach(function (player) {
      console.log(player.details);
    });
    config.CURR_PLAYER = currPlayer;
    config.CURR_PLAYER_VALID_ANSWER = false;
    currPlayer.socket.write(JSON.stringify(playMessage));

    //on laisse un nbr de secondes defini dans config au joueur pour repondre
    let timeOut = false;
    config.CURR_PLAYER_CHRONO = setTimeout(function () {
      currPlayer.socket.write(JSON.stringify(timeoutMessage));
      timeOut = true;

      if (config.CURRENT_MAX_BET > 0) {
        config.PLAYERS.every(function (player) {
          if (player.details.id === currPlayer.details.id) {
            player.details.state = "FOLDED";
            return true;
          }
        });
      }

      //on broadcast la mise de 0 aux autres joueurs
      let playerAction = {
        "id": "server.player.action",
        "data": {
          "id": currPlayer.details.id,
          "action": {
            "value": 0
          }
        }
      };


      CroupierMessageHandler.broadcast(JSON.stringify(playerAction), currPlayer);


    }, 1000 * config.MAX_SEC_TO_ANSWER);

    while (!config.CURR_PLAYER_VALID_ANSWER && !timeOut) {
      console.log("on attend un peu");
      await sleep(2000);
    }

  }
  if (hasAllChecked()) {
    console.log("tout le monde à check");
  }
  else {
    console.log("On a un gagnant pour la main");
  }

}

async function startGame() {
  //on attend un nombre de secondes determines en config avant de lancer la partie afin que les joueurs se connectent
  await setTimeout(async function () {
    //message de debut de game à chaque joueur
    sendStartGameMessage();
    /*on va ensuite boucler les sequences suivantes
    tant que une condition suivante n"est pas remplie:
    - nbr de tours max joues
    - il reste un seul player qui n"est pas FORFAIT => un winner
    */
    config.CURRENT_HAND = 1;
    while (config.CURRENT_HAND <= config.MAX_HANDS && !hasWinner()) {
      console.log("\nMain en cours = " + config.CURRENT_HAND);
      //message de debut de main
      sendNewHandMessage();
      //on dort une seconde pour eviter les accrocs de transmission trop rapide
      await sleep(1000);
      ////on prend les blindes pour ce tour
      takeBlinds();
      await sleep(1000);
      //distribution des cartes à chaque joueur
      sendCardsMessage();
      //on dort une seconde pour eviter les accrocs de transmission trop rapide
      await sleep(1000);
      //On appelle les joueurs dans l"ordre pour donner leur action jusqu à la resolution de la main
      await launchPlayCurrHand();

      config.CURRENT_HAND++;
    }
    if (hasWinner()) {
      console.log("\non a un gagnant !!");
    }
    else {
      console.log("\nTous les tours sont épuisés");
      //todo => calcul du vainqueur
    }

  }, 1000 * config.WAIT_BEFORE_START);
}

/**
 * distribution de 2 cartes à chaque joueur actif
 */
function sendCardsMessage() {
  config.PLAYERS.forEach(function (player) {
    if (player.details.state === "ACTIVE") {
      let twoRandomCards = CroupierHelper.getRandomCards(currentDeck, 2);
      //on stock ces 2 cartes dnas notre map joueur - cartes du tour
      config.PLAYERS_CARDS_MAP.set(player.details.id, twoRandomCards);
      console.log("\nles cartes donnees au joueur " + player.details.id + " sont : " + JSON.stringify(twoRandomCards[0]) + " et " + JSON.stringify(twoRandomCards[1]));
      console.log("\ncartes restantes dans le deck en cours " + currentDeck.length);
      console.log("\ncartes restantes dans le deck modele " + DECK.length);
      let giveCardsMessage = {
        "id": "server.game.cards",
        "data": {
          "cards": twoRandomCards
        }
      };
      player.socket.write(JSON.stringify(giveCardsMessage));

    }
  })

}

function sendStartGameMessage() {
  config.PLAYERS.forEach(function (player) {
    let startMessage = {
      "id": "server.game.start",
      "data": {
        "info": player.details,
        "count": config.NB_PLAYERS
      }
    }
    player.socket.write(JSON.stringify(startMessage));

  })
}

/**
 * Message pour annoncer à tous les joueurs le debut d"une nouvelle main
 */
function sendNewHandMessage() {
  //nouvelle main => on genere un nouveau deck pour cette main à partir du deck modele (DEEP COPY)
  currentDeck = DECK.slice(0);
  //on nettoie la table des cartes precedentes:
  config.CARDS_ON_TABLE = [];
  //pot a 0
  config.CURRENT_BETS = new Map();
  config.CURRENT_BETS.set("POT", 0);
  //on etablit l"ordre de jeu de cette main
  orderPlayers();
  let playersDetails = [];
  config.PLAYERS.forEach(function (player) {
    console.log(JSON.stringify(player.details));
    playersDetails.push(player.details);
  })
  let newHandMessage = {
    "id": "server.game.hand.start",
    "data": {
      "players": playersDetails
    }
  }
  CroupierMessageHandler.broadcast(JSON.stringify(newHandMessage));

}

//prise des blindes aupres des joueurs 1 et 2
function takeBlinds() {
  console.log("inside takeBlinds");
  //modifie les blindes au besoin selon le tour en cours
  BlindHelper.actualizeBlinds(config.CURRENT_HAND);
  let bigBlindPayed = false;
  let smallBlindPlayed = false;
  let playersIter = config.PLAYERS.length - 1;
  let jsonMessage = {
    "id": "server.player.action",
    "data": {
      "id": 0,
      "action": {
        "value": 0
      }
    }
  }
  //on regarde les jouers en partant de la fin et on cherche les ACTIVE 
  //le premier qu"on trouve => grosse blinde
  //le deuxieme => petite blinde
  while (playersIter >= 0 && !smallBlindPlayed) {
    if (config.PLAYERS[playersIter].details.state === "ACTIVE" && bigBlindPayed && !smallBlindPlayed) {
      //paye small blind
      smallBlindPlayed = true;
      if (config.PLAYERS[playersIter].details.chips >= config.CURR_SMALL_BLIND) {
        config.PLAYERS[playersIter].details.chips = config.PLAYERS[playersIter].details.chips - config.CURR_SMALL_BLIND;
        config.CURRENT_BETS.set(config.PLAYERS[playersIter].details.id, config.CURR_SMALL_BLIND);
        config.CURRENT_BETS.set("POT", config.CURRENT_BETS.get("POT") + config.CURR_SMALL_BLIND);
      } else {
        config.CURRENT_BETS.set(config.PLAYERS[playersIter].details.id, config.PLAYERS[playersIter].details.chips);
        config.CURRENT_BETS.set("POT", config.CURRENT_BETS.get("POT") + config.PLAYERS[playersIter].details.chips);
        config.PLAYERS[playersIter].details.chips = 0;
      }
      jsonMessage.data.id = config.PLAYERS[playersIter].details.id;
      jsonMessage.data.action.value = config.CURRENT_BETS.get(config.PLAYERS[playersIter].details.id);
      CroupierMessageHandler.broadcast(JSON.stringify(jsonMessage));

    }


    if (config.PLAYERS[playersIter].details.state === "ACTIVE" && !bigBlindPayed) {
      //paye big blind
      bigBlindPayed = true;
      if (config.PLAYERS[playersIter].details.chips >= config.CURR_BIG_BLIND) {
        config.PLAYERS[playersIter].details.chips = config.PLAYERS[playersIter].details.chips - config.CURR_BIG_BLIND;
        config.CURRENT_BETS.set(config.PLAYERS[playersIter].details.id, config.CURR_BIG_BLIND);
        config.CURRENT_BETS.set("POT", config.CURRENT_BETS.get("POT") + config.CURR_BIG_BLIND);
      } else {
        config.CURRENT_BETS.set(config.PLAYERS[playersIter].details.id, config.PLAYERS[playersIter].details.chips);
        config.CURRENT_BETS.set("POT", config.CURRENT_BETS.get("POT") + config.PLAYERS[playersIter].details.chips);
        config.PLAYERS[playersIter].details.chips = 0;
      }
      config.CURRENT_MAX_BET = config.CURR_BIG_BLIND;
      jsonMessage.data.id = config.PLAYERS[playersIter].details.id;
      jsonMessage.data.action.value = config.CURRENT_BETS.get(config.PLAYERS[playersIter].details.id);
      CroupierMessageHandler.broadcast(JSON.stringify(jsonMessage));
    }
    playersIter--;
  }
  console.log("le pot contient " + config.CURRENT_BETS.get("POT"));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


////////////////////////////////////////////////

//launch a game
startGame();