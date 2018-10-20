global.config = {

    PORT: 1300,
    HOST: "127.0.0.1",
    NEURONAL_NETWORK: null,
    NEURONAL_NETWORK_LISTENER: null,
    NEURONAL_NETWORK_HELPER: null,


    //constantes partagées
    MAX_SEC_TO_ANSWER: 15,
    MAX_RAISE_MULTIPLIER:10,
    DISABLE_NEURONAL:true,
    TRAINING_NEEDED:false,
    TRAINING_ITERATION: 200000,



    //croupier
    NB_PLAYERS: 0,
    START_MONEY: 1500,
    WAIT_BEFORE_START: 60,
    CURRENT_HAND: 0,
    MAX_HANDS: 150,
    ALL_COLORS: ["SPADE", "HEART", "DIAMOND", "CLUB"],
    ALL_KINDS: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING", "1"],
    CARDS_VALUE_MAP: new Map([
        ["SPADE", 1],
        ["HEART", 2],
        ["DIAMOND", 3],
        ["CLUB", 4],
        ["2", 1],
        ["3", 2],
        ["4", 3],
        ["5", 4],
        ["6", 5],
        ["7", 6],
        ["8", 7],
        ["9", 8],
        ["10", 9],
        ["JACK", 10],
        ["QUEEN", 11],
        ["KING", 12],
        ["1", 13]
    ]),
    //contient les details courants du joueur + son socket
    PLAYERS: [],
    //gestion des mises et du pot d'un tour
    CURRENT_BETS: new Map(),
    CURRENT_MAX_BET: 0,
    CURR_SMALL_BLIND: 10,
    CURR_BIG_BLIND: 20,
    BLIND_EVOLUTION: new Map([
        [136, [100, 200]],
        [121, [75, 150]],
        [81, [50, 100]],
        [51, [40, 80]],
        [31, [30, 60]],
        [16, [20, 40]],
        [1, [10, 20]]
    ]),
    CARDS_ON_TABLE: [],
    CURR_PLAYER_VALID_ANSWER: false,
    CURR_PLAYER_CHRONO: null,
    CURR_PLAYER: null,
    //map des joueurs et de leurs 2 cartes du tour
    PLAYERS_CARDS_MAP: new Map(),


    //Exceptions
    DECK_EMPTY_EXCEPTION: "Le deck est vide !"
};