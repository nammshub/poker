/**
 * Cette classe main lance une partie.
 * Attend que les joueurs se connectent pendant  minute ensuite lance les tours jusqu' a ce qu'il y aie un gagnant ou que  tours soient passés
 */

var net = require("net");
require('../config');
const CroupierMessageHandler = require('./CroupierMessageHandler');
const PORT = config.PORT;
const croupierMessageHandler = new CroupierMessageHandler();

// Keep track of the players
let players = [];

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
  console.log("Welcome " + socket.playerDetails.name + "\n");

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
   console.log('Exception : ' + data);
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
      //message de debut de main
	sendNewHandMessage();

      config.CURRENT_HAND++;
    }
	if(hasWinner()){
		console.log('on a un gagnant !!');
	}

  }, 1000*config.WAIT_BEFORE_START);
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

function sendNewHandMessage(){
  let currentPlayersDetails = []
  let previousPlayerDetails = config.PREVIOUS_PLAYER_DETAILS;
  if (previousPlayerDetails.length === 0){
	previousPlayerDetails = players;
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
		player.playerDetails.dealer = true;
	} 
	else{
		player.playerDetails.dealer = false;
	}
  });
  config.PREVIOUS_PLAYER_DETAILS = currentPlayersDetails;

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