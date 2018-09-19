global.config = {

    PORT: 1300,
    HOST: "127.0.0.1",
    NEURONAL_NETWORK: null,
    NEURONAL_NETWORK_LISTENER: null,
    NEURONAL_NETWORK_HELPER: null,


    //constantes partagées
    MAX_SEC_TO_ANSWER : 15,



    //croupier
    NB_PLAYERS: 0,
    START_MONEY: 1500,
    WAIT_BEFORE_START: 10,
    CURRENT_HAND: 0,
    MAX_HANDS: 5,
    //les joueurs ordonnés pour le tour en cours avec un parametre position qui peut etre SMALL_BLIND, BIG_BLIND, FIRST ou 
    ORDERED_PLAYERS_BKP: [],
    ALL_COLORS: ["SPADE", "HEART", "DIAMOND", "CLUB"],
    ALL_KINDS: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING"],
    //contient les details courants du joueur + son socket
    PLAYERS: [],
    //gestion des mises et du pot d'un tour
    CURRENT_BETS: new Map(),
    CURRENT_MAX_BET : 0,
    CURR_SMALL_BLIND: 10,
    CURR_BIG_BLIND: 20,
    BLIND_EVOLUTION: new Map([
        [1, [10, 20]],
        [16, [20, 40]],
        [31, [30, 60]],
        [51, [40, 80]],
        [81, [50, 100]],
        [121, [75, 150]],
        [136, [100, 200]]
    ]),
    CARDS_ON_TABLE : [],
    CURR_PLAYER_VALID_ANSWER : false,
    CURR_PLAYER_CHRONO : null,
    CURR_PLAYER : null,


    //Exceptions
    DECK_EMPTY_EXCEPTION: "Le deck est vide !"
};