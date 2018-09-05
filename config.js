global.config = {

    PORT : 6969,
    HOST : "127.0.0.1",
    NEURONAL_NETWORK : null,
    NEURONAL_NETWORK_LISTENER : null,
    NEURONAL_NETWORK_HELPER : null,


    //croupier
    NB_PLAYERS : 0,
    START_MONEY : 1500,
    WAIT_BEFORE_START : 15,
    CURRENT_HAND : 0,
    MAX_HANDS : 15,
    PLAYER_DETAILS_BKP :[],
    ALL_COLORS : ["SPADE", "HEART", "DIAMOND", "CLUB"],
    ALL_KINDS : ["1","2","3","4","5","6","7","8","9","10","JACK","QUEEN","KING"],
    //garde en memoire le fait qu'un joueur aie repondu à temps à chaque tour
    ANSWERS_IN_TIME : new Map(),
    

    //Exceptions
    DECK_EMPTY_EXCEPTION : "Le deck est vide !"
};