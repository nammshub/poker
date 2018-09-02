class Player {
  constructor(playerId, name, chips, state, dealer) {
    this.playerId = playerId;
    this.name = name;
    this.chips = chips;
    this.state = state;
    defaultStatus(dealer);
  }

  get totalChips() {
    return this.chips;
  }

  get dealerStatus() {
    return this.dealer;
  }

  get stateStatus() {
    return this.state;
  }

  set dealerStatus(dealer) {
    this.dealer = dealer;
  }
}

module.exports = Player;