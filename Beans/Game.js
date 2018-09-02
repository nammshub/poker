module.exports = {
    'player' : '',
    'nbJoueursActifs' : 0,
    'turnPosition' : 0,
    'hand': [],
    'totalHands' : 0,
    'listPlayers' : [],
    'turnsDetails': [
        //infos detaillées sur chaque tour
        {
            'tourNumber' :0,
            //cet iterateur garde en memoire le numero de l'action en cours. Chaque fois qu'un joueur joue cela augmente de 1 (CALL ou FOLD)
            'actionNbrIter' :0,
            //tapis: liste des cartes sur le tapis
            'tapis' : [
                //carte1, carte2...
            ],
            'neuronalResponses' : [],
            'randomResponse' : 0
        }
    ]
}
