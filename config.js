global.config = {

    PORT: 6969,
    HOST: "127.0.0.1",
    NEURONAL_NETWORK: null,
    NEURONAL_NETWORK_LISTENER: null,
    NEURONAL_NETWORK_HELPER: null,


    //croupier
    NB_PLAYERS: 0,
    START_MONEY: 1500,
    WAIT_BEFORE_START: 15,
    CURRENT_HAND: 0,
    MAX_HANDS: 5,
    //les joueurs ordonnés pour le tour en cours
    ORDERED_PLAYERS_BKP: [],
    ALL_COLORS: ["SPADE", "HEART", "DIAMOND", "CLUB"],
    ALL_KINDS: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING"],
    //garde en memoire le fait qu'un joueur aie repondu à temps à chaque tour
    ANSWERS_IN_TIME: new Map(),
    //contient les details courants du joueur + son socket
    PLAYERS: [],
    //gestion des mises et du pot d'un tour
    CURRENT_BETS: new Map(),
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


    //Exceptions
    DECK_EMPTY_EXCEPTION: "Le deck est vide !"
};