require("../config");
require("../deck");
const CroupierHelper = require("./CroupierHelper");
const HandValueHelper = require("./HandValueHelper");


class HandStrengthHelper {

    /********************************************************** 
         
         
    Hand strength is the probability that you will win the hand, given your hole cards, the community cards, and the opponents who remain in the hand. 
    Hand strength is a floating point number between 0.0 (certain loss) and 1.0 (certain win). For example, a HS of 0.33 means you have a 33% chance of winning.
    
    The easiest and most flexibly way of calculating the HS is to simulate the progress of the game a very large number of time, and count the number of those times you win. 
    Say you simulate the game 1,000 times, and in the simulation, you win 423 games, then you have a high degree of certainty of having an approximate HS of 423/1000, or 0.423.
    
    The procedure for simulating a game is very simple:
    
    Create a pack of cards
    Set score = 0
    Remove the known cards (your hole cards, and any community cards)
    Repeat 1000 times (or more, depending on CPU resources and desired accuracy)
    Shuffle the remaining pack
    Deal your opponent's hole cards, and the remaining community cards
    Evaluate all hands, and see who has the best hands
    If you have the best hand then
    Add 1/(number of people with the same hand value) to your score (usually 1)
    End if
    end repeat
    Hand Strength = score/number of loops (1000 in this case).
    
    To be more accurate, we have to run our simulation with people dropping out if they are dealt hole cards below a certain threshold. 
    In practice, the determination of if a player stays in or not in a simulation is a probabilistic function of the strength of their hole cards, 
    their table position, their stack size, the blind size and their previous behavior. For now we can just modify the simulation, so after dealing the opponents hole cards, 
    remove any non-blind players with hole cards worse than, say, a pair of sixes. While not particularly elegant, it will still give you a useful number.
         
    *****************************************************************/

    static getHandStrength(myHand, cardsOnBoard, nbrOpponents) {
        const actualDeck = this.getActualDeck(myHand.concat(cardsOnBoard));
        let nbrVictories = 0;
        for (let iter = 1; iter <= config.HAND_STRENGTH_GAMES_NBR; iter++) {
            let gameDeck = actualDeck.slice(0);
            let winner = true;
            //on donne 2 cartes à chaque adversaire
            let opponentsCards = this.giveOpponentsCards(nbrOpponents, gameDeck);
            //on complete le board avec suffisament de cartes pour faire 5 cartes
            let virtualBoard = this.createVirtualBoard(cardsOnBoard, gameDeck)
            const myHandValue = HandValueHelper.getHandValue(myHand.concat(virtualBoard));
            for (let cards of opponentsCards) {
                let opponentHandValue = HandValueHelper.getHandValue(cards.concat(virtualBoard));
                if (opponentHandValue[0] > myHandValue[0] || (opponentHandValue[0] === myHandValue[0] && opponentHandValue[1] > myHandValue[1])) {
                    winner = false;
                    break;
                }
            }
            if (winner) {
                nbrVictories++;
            }
        }
        try{
            console.log("hand strength =" + nbrVictories / config.HAND_STRENGTH_GAMES_NBR + " hand = "+myHand[0].kind+" "+myHand[0].color+" "+myHand[1].kind+" "+myHand[1].color );
        }
        catch(error){
            console.error(error);
        }
        return nbrVictories / config.HAND_STRENGTH_GAMES_NBR;
    }

    static getActualDeck(unavailableCards) {
        let actualDeck = DECK.slice(0);
        for (let unavailableCard of unavailableCards) {
            actualDeck = actualDeck.filter(card => !(card.kind === unavailableCard.kind && card.color === unavailableCard.color));
        }

        return actualDeck;
    }

    static giveOpponentsCards(nbrOpponents, originalDeck) {
        let opponentCards = [];
        for (let iterOpponent = 0; iterOpponent < nbrOpponents; iterOpponent++) {
            opponentCards.push(CroupierHelper.getRandomCards(originalDeck, 2))
        }
        return opponentCards;
    }

    static createVirtualBoard(cardsOnBoard, originalDeck) {
        const virtualBoard = cardsOnBoard.concat(CroupierHelper.getRandomCards(originalDeck, 5 - cardsOnBoard.length));
        return virtualBoard;
    }
}

module.exports = HandStrengthHelper;