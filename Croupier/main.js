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

// Keep track of the players
let players = [];
let currentDeck = [];

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
  socket.playerDetails = playerDetails;

  // Put this new player in the list
  players.push(socket);

  // Send a nice welcome message and announce
  console.log("\nWelcome " + socket.playerDetails.name + "\n");

  // Handle incoming messages from clients.
  socket.on('data', function (data) {
    croupierMessageHandler.handleData(data);
  });

  // Remove the client from the list when it leaves
  socket.on('end', function () {
    players.splice(players.indexOf(socket), 1);
    console.log(socket.playerDetails.name + " left the game.\n");
  });

  // Remove the client from the list when it leaves
  socket.on('error', function (data) {
   console.log('\nException : ' + data);
  });

}).listen(PORT);

// Put a friendly message on the terminal of the server.
console.log("Poker server running at port "+PORT+"\n");

// Send a message to all clients
function broadcast(message, sender) {
  players.forEach(function (player) {
    // Don't want to send it to sender
    if (player === sender) return;
    player.write(message);
  });
  // Log it to the server output too
  process.stdout.write(message)
}

/**
 * return true if only 1 play is not FORFAIT
 */
function hasWinner(){
  let nbForfait = 0;
  players.forEach( function(player){
    if(player.playerDetails.state === 'FORFAIT'){
      nbForfait++;
    }
  })
  return nbForfait === players.length-1;
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
  config.PLAYER_DETAILS_BKP.forEach( function(player){
    if(player.state === 'ACTIVE'){
      let twoRandomCards = CroupierHelper.getRandomCards(currentDeck,2);
      console.log('\nles cartes donnees au joueur '+player.id+' sont : '+JSON.stringify(twoRandomCards[0]) + ' et '+JSON.stringify(twoRandomCards[1]));
      console.log('\ncartes restantes dans le deck en cours '+currentDeck.length);
      console.log('\ncartes restantes dans le deck modele '+DECK.length);
    }
  })

}

function sendStartGameMessage(){
  players.forEach(function (player){
    let startMessage = {
      "id": "server.game.start",
      "data": {
        "info": player.playerDetails,
        "count": config.NB_PLAYERS
      }
    }
    player.write(JSON.stringify(startMessage));

  })
}

/**
 * Message pour annoncer à tous les joueurs le debut d'une nouvelle main
 */
function sendNewHandMessage(){
  //nouvelle main => on genere un nouveau deck pour cette main à partir du deck modele (DEEP COPY)
  currentDeck =  DECK.slice(0);
  //on etablit l'ordre de jeu de cette main
  let currentPlayersDetails = []
  let previousPlayerDetails = config.PLAYER_DETAILS_BKP;
  if (previousPlayerDetails.length === 0){
    players.forEach( function(player){
      previousPlayerDetails.push(player.playerDetails);
    })
  }
	console.log('previousPlayerDetails length = '+previousPlayerDetails.length);
  currentPlayersDetails.push(previousPlayerDetails[previousPlayerDetails.length-1]);
  for (i = 0; i < previousPlayerDetails.length-1; i++) {
    currentPlayersDetails.push(previousPlayerDetails[i]);
  }  
  
  	console.log('currentPlayersDetails length = '+currentPlayersDetails.length);

  //assigne dealer
  currentPlayersDetails.forEach( function(player,pos){
	if(pos === currentPlayersDetails.length - 1){
		player.dealer = true;
	} 
	else{
		player.dealer = false;
	}
  });
  config.PLAYER_DETAILS_BKP = currentPlayersDetails;

  let newHandMessage = {
    "id": "game.hand.start",
    "data": {
      "players":currentPlayersDetails
    }
  }
  
  broadcast(JSON.stringify(newHandMessage));
  
}


////////////////////////////////////////////////

//launch a game
startGame();