var net = require("net");

var HOST = "127.0.0.1";
var PORT = 6969;

var client = new net.Socket();
client.connect(PORT, HOST, function() {

    console.log("CONNECTED TO: " + HOST + ":" + PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
    //client.write("I am Chuck Norris!");
    //Test game start
    const player1 = {
        "id": 666,
        "name": "D.E.V.",
        "chips": 500,
        "state": "ACTIVE",
        "dealer": false
    }

    const player2 = {
        "id": 777,
        "name": "Losers",
        "chips": 500,
        "state": "ACTIVE",
        "dealer": false
    }
    
    const player3 = {
        "id": 888,
        "name": "Losers",
        "chips": 500,
        "state": "ACTIVE",
        "dealer": true
    }
    
    const gameStart = {
        "id": "server.game.start",
        "data": {
        "info": player1,
        "count": 4
        }
    };

    const cardsMessage = {
        "id": "server.game.cards",
        "data": {
          "cards": [
            {
                "kind": "KING",
                "color": "DIAMOND"
              },
              {
                "kind": "KING",
                "color": "SPADE"
              }
          ]
        }
      }

      const handStartMessage = {
        "id": "server.game.hand.start",
        "data": {
          "players": [player1,player2,player3]
        }
      }
    
      //test start
    client.write(JSON.stringify(gameStart));
    
    //test cards received
    setTimeout(function () {
        client.write(JSON.stringify(cardsMessage));
    }, 5000);

    //hand start
    setTimeout(function () {
        client.write(JSON.stringify(handStartMessage));
    }, 10000);

});

// Add a "data" event handler for the client socket
// data is what the server sent to this socket
client.on("data", function(data) {
    
    console.log("DATA: " + data);
    // Close the client socket completely
    client.destroy();
    
});

// Add a "close" event handler for the client socket
client.on("close", function() {
    console.log("Connection closed");
});