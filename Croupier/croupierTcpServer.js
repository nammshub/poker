/**
 * Cette classe main lance une partie.
 * Attend que les joueurs se connectent pendant  minute ensuite lance les tours jusqu' a ce qu'il y aie un gagnant ou que  tours soient passés
 */

var net = require("net");
require('../config');
require('../deck');
//const DeckHelper = require('../Helpers/DeckHelper');
const CroupierHelper = require('../Helpers/CroupierHelper');
const CroupierMessageHandler = require('./CroupierMessageHandler');
const PORT = config.PORT;
const croupierMessageHandler = new CroupierMessageHandler();

//deck du tour
let currentDeck = [];
//map des joueurs et de leurs 2 cartes du tour
let playerCardsMap = new Map();

//generate new deck file
//DeckHelper.generateNewDeckFile();

// Start a TCP Server
net.createServer(function (socket) {

  config.NB_PLAYERS++;
  // Identify this client
  let playerDetails = {
    "id": config.NB_PLAYERS,
    "name": "Player"+config.NB_PLAYERS,
    "chips": config.START_MONEY,
    "state": "ACTIVE",
    "dealer": false
  }
  let currPlayer = {
    'details' : playerDetails,
    'socket' : socket
  };

  // Put this new player in the list
  config.PLAYERS.push(currPlayer);

  // Send a nice welcome message and announce
  console.log("\nWelcome " + currPlayer.details.name + "\n");

  // Handle incoming messages from clients.
  socket.on('data', function (data) {
    croupierMessageHandler.handleData(data);
  });

  // Remove the client from the list when it leaves
  socket.on('end', function () {
    config.PLAYERS.forEach( function(player, iter){
      if(player.socket === socket){
        console.log(player.details.name + " leaves the game.\n");
        config.PLAYERS.splice(iter, 1);
        break;
      }
    })
  });

  // Remove the client from the list when it leaves
  socket.on('error', function (data) {
   console.log('\nException : ' + data);
  });

}).listen(PORT);

// Put a friendly message on the terminal of the server.
console.log("Poker server running at port "+PORT+"\n");


function actualizeBlinds(){
  let iterBlindValues = config.BLIND_EVOLUTION.keys();
  let currValue = iterBlindValues.next().value;
  while( currValue < config.CURRENT_HAND){
    currValue = iterBlindValues.next().value
  }
  config.CURR_SMALL_BLIND = config.BLIND_EVOLUTION.get(currValue)[0];
  config.CURR_BIG_BLIND = config.BLIND_EVOLUTION.get(currValue)[1];
}
// Send a message to all clients
function broadcast(message, sender) {
  config.PLAYERS.forEach(function (player) {
    // Don't want to send it to sender
    if (player === sender) return;
    player.socket.write(message);
  });
  // Log it to the server output too
  process.stdout.write(message)
}

/**
 * return true if only 1 play is not FORFAIT
 */
function hasWinner(){
  let nbForfait = 0;
  config.PLAYERS.forEach( function(player){
    if(player.details.chips === 0){
      nbForfait++;
    }
  })
  return nbForfait === config.PLAYERS.length-1;
}

function launchPlayCurrHand(){
  /*
  une main se decompose en 4 phases de mises entrecoupées de pose de cartes sur le tapis par le croupier
  Une main peut se terminer prematurement si tous les joueurs sauf un se couchent
  */
 //prise de petites et grande blinde chez joueur 1 et 2
  takeBlinds()
  /* TODO
  let step = 1;
  while (!hasHandWinner() && step < 4){
    playerBets();
    switch (step){
      //flop
      case 1:
          CroupierHelper.giveCards(3);
          break;
      default:
          CroupierHelper.giveCards(1);
          break;
    }
    step++;
  }
  */
 console.log(config.ORDERED_PLAYERS_BKP.toString());
}

function startGame(){
  //on attend un nombre de secondes determines en config avant de lancer la partie afin que les joueurs se connectent
  setTimeout(function () {
    //message de debut de game à chaque joueur
    sendStartGameMessage();
    /*on va ensuite boucler les sequences suivantes
    tant que une condition suivante n'est pas remplie:
    - nbr de tours max joues
    - il reste un seul player qui n'est pas FORFAIT => un winner
    */
    config.CURRENT_HAND = 1;
    while (config.CURRENT_HAND <= config.MAX_HANDS && !hasWinner()){
      console.log('\nMain en cours = '+config.CURRENT_HAND);
      //message de debut de main
      sendNewHandMessage();
      
      //distribution des cartes à chaque joueur
      sendCardsMessage();

      //On appelle les joueurs dans l'ordre pour donner leur action jusqu à la resolution de la main
      launchPlayCurrHand();

      config.CURRENT_HAND++;
    }
	if(hasWinner()){
		console.log('\non a un gagnant !!');
  }
  else{
    console.log('\nTous les tours sont épuisés');
  }

  }, 1000*config.WAIT_BEFORE_START);
}

/**
 * distribution de 2 cartes à chaque joueur actif
 */
function sendCardsMessage(){
  config.ORDERED_PLAYERS_BKP.forEach( function(player){
    if(player.state === 'ACTIVE'){
      let twoRandomCards = CroupierHelper.getRandomCards(currentDeck,2);
      //on stock ces 2 cartes dnas notre map joueur - cartes du tour
      playerCardsMap.set(player.id, twoRandomCards);
      console.log('\nles cartes donnees au joueur '+player.id+' sont : '+JSON.stringify(twoRandomCards[0]) + ' et '+JSON.stringify(twoRandomCards[1]));
      console.log('\ncartes restantes dans le deck en cours '+currentDeck.length);
      console.log('\ncartes restantes dans le deck modele '+DECK.length);
    }
  })

}

function sendStartGameMessage(){
  config.PLAYERS.forEach(function (player){
    let startMessage = {
      "id": "server.game.start",
      "data": {
        "info": player.playerDetails,
        "count": config.NB_PLAYERS
      }
    }
    player.socket.write(JSON.stringify(startMessage));

  })
}

/**
 * Message pour annoncer à tous les joueurs le debut d'une nouvelle main
 */
function sendNewHandMessage(){
  //nouvelle main => on genere un nouveau deck pour cette main à partir du deck modele (DEEP COPY)
  currentDeck =  DECK.slice(0);
  //on etablit l'ordre de jeu de cette main
  let currentOrderedPlayers = []
  let previousOrderedPlayers = config.ORDERED_PLAYERS_BKP;
  if (previousOrderedPlayers.length === 0){
    config.PLAYERS.forEach( function(player){
      previousOrderedPlayers.push(player);
    })
  }
	console.log('previousOrderedPlayers length = '+previousOrderedPlayers.length);
  currentOrderedPlayers.push(previousOrderedPlayers[previousOrderedPlayers.length-1]);
  for (i = 0; i < previousOrderedPlayers.length-1; i++) {
    currentOrderedPlayers.push(previousOrderedPlayers[i]);
  }  
  
  	console.log('currentOrderedPlayers length = '+currentOrderedPlayers.length);

  //assigne dealer
  currentOrderedPlayers.forEach( function(player,pos){
	if(pos === currentOrderedPlayers.length - 1){
		player.details.dealer = true;
	} 
	else{
		player.details.dealer = false;
	}
  });
  config.ORDERED_PLAYERS_BKP = currentOrderedPlayers;
  let orderedPlayersDetails = [];
  config.ORDERED_PLAYERS_BKP.forEach( function(player){
    orderedPlayersDetails.push(player.details);
  })
  let newHandMessage = {
    "id": "game.hand.start",
    "data": {
      "players":orderedPlayersDetails
    }
  }
  
  broadcast(JSON.stringify(newHandMessage));
  
}

//prise des blindes aupres des joueurs 1 et 2
function takeBlinds(){
  //modifie les blindes au besoin se lon le tour en cours
  actualizeBlinds();
  let iterBlinds = 0;
  config.ORDERED_PLAYERS_BKP.every( function(player){
    if(player.details.state === 'ACTIVE' && iterBlinds === 0){
      if(player.details.chips >= config.CURR_SMALL_BLIND){
        player.details.chips = player.details.chips - config.CURR_SMALL_BLIND;
        config.CURRENT_BETS.set(player.details.id,config.CURR_SMALL_BLIND);
        config.CURRENT_BETS.set('POT',config.CURR_SMALL_BLIND);
      } else {
        player.details.state = 'ALL_IN';
        config.CURRENT_BETS.set(player.details.id,player.details.chips);
        config.CURRENT_BETS.set('POT',player.details.chips);
        player.details.chips = 0;
      }
      iterBlinds++;
    }
    if(player.details.state === 'ACTIVE' && iterBlinds === 1){
      if(player.details.chips >= config.CURR_BIG_BLIND){
        player.details.chips = player.details.chips - config.CURR_BIG_BLIND;
        config.CURRENT_BETS.set(player.details.id,config.CURR_BIG_BLIND);
        config.CURRENT_BETS.set('POT',config.CURRENT_BETS.get('POT') + config.CURR_BIG_BLIND);
      } else {
        player.details.state = 'ALL_IN';
        config.CURRENT_BETS.set(player.details.id,player.details.chips);
        config.CURRENT_BETS.set('POT',config.CURRENT_BETS.get('POT') + player.details.chips);
        player.details.chips = 0;
      }
      iterBlinds++;
    }
    if(iterBlinds == 2){
      return false;
    }
  })

}


////////////////////////////////////////////////

//launch a game
startGame();