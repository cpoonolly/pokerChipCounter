import _ from 'lodash';

const RoundsOfAHand = Object.freeze({
  PRE_FLOP: Symbol('pre-flop'),
  FLOP: Symbol('flop'),
  TURN: Symbol('turn'),
  RIVER: Symbol('river')
});

const RoundsOfAHandOrdered = [
  RoundsOfAHand.PRE_FLOP,
  RoundsOfAHand.FLOP,
  RoundsOfAHand.TURN,
  RoundsOfAHand.RIVER
];

class Player {
  constructor(name, chips) {
    this.name = name;
    this.chips = chips;
    this.hasFolded = false;
    this.hasPlayedThisRound = false;
    this.isAllIn = false;

    // this is the total amount bet for a full HAND (across all rounds of a hand "pre-flop" to "flop" to "end")
    this.betThisHand = 0;
    // this is the total amount bet for a single round of betting
    this.betThisRound = 0;
  }
}

class Pot {
  constructor() {
    this.players = new Set();
    this.chips = 0;

    // this is the total bet FOR THIS HAND that a player needs to be included in this pot
    this.toCall = 0;
    this.isAwarded = false;
  }
}

class PokerGame {
  constructor(playerNames, chipsPerPlayer = 100, smallBlind = 5, bigBlind = 10) {
    if (_.size(playerNames) < 2) {
      throw new Error('At least 2 players need to be present!');
    } else if (smallBlind > bigBlind) {
      throw new Error('Small blind must be less than big blind!');
    } else if (bigBlind > chipsPerPlayer) {
      throw new Error('Big blind must be less than the available chips per player!');
    }

    // Set game properties
    this.chipsPerPlayer = chipsPerPlayer;
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;

    // Initialize players
    this.players = playerNames.map((playerName) => new Player(playerName, chipsPerPlayer));
    this.dealer = null;
    this.playerWhoseTurnItIs = null;

    // this is the hightest bet for a full HAND! (not per round - it's different the amount displayed to call)
    this.highestBetThisHand = 0;

    // highest bet this/last round
    this.highestBetThisRound = 0;
    this.highestBetLastRound = 0;

    this.round = null;
    this.pots = [];

    this.isRoundOver = true;
    this.isHandOver = true;
  }

  getPlayerNextTo(player) {
    return this.players[(_.indexOf(this.players, player) + 1) % _.size(this.players)];
  }

  // TODO - double check the logic for these canCurrentPlayer* methods
  canCurrentPlayerCheck() {
    return !this.playerWhoseTurnItIs.hasFolded && !this.playerWhoseTurnItIs.isAllIn && this.playerWhoseTurnItIs.betThisHand === this.highestBetThisHand;
  }

  canCurrentPlayerCall() {
    return !this.playerWhoseTurnItIs.hasFolded && !this.playerWhoseTurnItIs.isAllIn && this.playerWhoseTurnItIs.betThisHand < this.highestBetThisHand;
  }

  canCurrentPlayerRaise() {
    return !this.playerWhoseTurnItIs.hasFolded && !this.playerWhoseTurnItIs.isAllIn;
  }

  canCurrentPlayerFold() {
    return !this.playerWhoseTurnItIs.hasFolded;
  }

  check() {
    this.setPlayerBet(this.playerWhoseTurnItIs, this.playerWhoseTurnItIs.betThisHand);
    this.finishTurn();
  }

  call() {
    this.setPlayerBet(this.playerWhoseTurnItIs, this.highestBetThisHand);
    this.finishTurn();
  }

  raise(chips) {
    this.setPlayerBet(this.playerWhoseTurnItIs, chips);
    this.finishTurn();
  }

  fold() {
    this.playerWhoseTurnItIs.hasFolded = true;
    this.finishTurn();
  }

  finishTurn() {
    this.playerWhoseTurnItIs.hasPlayedThisRound = true;

    // find the next player
    let nextPlayer = this.playerWhoseTurnItIs(this.playerWhoseTurnItIs);
    
    while (!nextPlayer.hasFolded && !nextPlayer.isAllIn && nextPlayer !== this.playerWhoseTurnItIs) {
      nextPlayer = this.getPlayerNextTo(nextPlayer);
    }

    // console.assert(nextPlayer.betThisHand > this.highestBetThisHand, 'something went wrong...');

    // hand is automatically over because everyone else has folded
    if (nextPlayer === this.playerWhoseTurnItIs) {
      this.onHandFinished();
    
    // if next player has already gone and their bet is === to the current highest bet we're done with the round
    // TODO - double check this logic...
    } else if (nextPlayer.betThisHand === this.highestBetThisHand && nextPlayer.hasPlayedThisRound) {
      this.onRoundFinished();

    // otherwise just move on to the next player
    } else {
      this.playerWhoseTurnItIs = nextPlayer;
      this.onNextPlayerTurn();
    }
  }

  onNextPlayerTurn() {
    // notify subscribers
  }

  onRoundFinished() {
    this.isRoundOver = true;

    if (this.round === RoundsOfAHand.RIVER) {
      this.onHandFinished();
    } else {
      // notify subscribers...
    }
  }

  onHandFinished() {
    this.isHandOver = true;

    // notify subscribers
  }

  awardPot(pot, player) {
    // distribute winnings and mark pot as awarded

    pot.isAwarded = true;
  }

  setPlayerBet(player, newBet) {
    if (player.hasFolded || player.isAllIn) {
      throw new Error('Player can no longer bet');
    } else if (newBet > player.chips) {
      throw new Error('Cannot bet more chips than what player has!');
    } else if (newBet < this.highestBetThisHand)  {
      throw new Error(`Player must have a bet of at least ${this.highestBetThisHand}`);
    }

    this.highestBetThisHand = newBet;
    this.highestBetThisRound = (newBet - this.highestBetLastRound);
    player.betThisHand = newBet;
    player.betThisRound = (newBet - this.highestBetLastRound);
    player.isAllIn = (player.betThisHand === player.chips);

    this.recalculatePots();
  }

  startNewHand() {
    if (!this.isHandOver) {
      throw new Error(`Current hand hasn't finished yet.`);
    } else if (!_.every(this.pots, 'isAwarded')) {
      throw new Error(`There are still pots that haven't been awarded. Cannot start new hand until all pots have been awarded`);
    }

    this.pots = [];
    this.round = RoundsOfAHand.PRE_FLOP;
    this.highestBetThisHand = 0;
    this.highestBetThisRound = 0;
    this.highestBetLastRound = 0;
    this.isRoundOver = false;
    this.isHandOver = false;

    // reset player's bets for the round/hand
    this.players.forEach((player) => {
      player.betThisHand = 0;
      player.betThisRound = 0;
      player.hasPlayedThisRound = false;
    });

    // if a new game no dealer exists so choose the first player otherwise choose the player next to the current dealer
    this.dealer = (this.dealer ? this.getPlayerNextTo(this.dealer) : _.first(this.players));

    // player next to the dealer is small blind, person next to that is big blind
    let playerWhoIsSmallBlind = this.getPlayerNextTo(this.dealer);
    let playerWhoIsBigBlind = this.getPlayerNextTo(playerWhoIsSmallBlind);

    this.setPlayerBet(playerWhoIsSmallBlind, Math.min(playerWhoIsSmallBlind.chips, this.smallBlind));
    this.setPlayerBet(playerWhoIsBigBlind, Math.min(playerWhoIsBigBlind.chips, this.bigBlind));

    // big blind goes first
    this.playerWhoseTurnItIs = playerWhoIsBigBlind;
  }

  startNewRound() {
    if (!this.isRoundOver) {
      throw new Error(`Current round hasn't finished yet.`);
    } else if (this.isHandOver || this.round === RoundsOfAHand.RIVER) {
      throw new Error(`Current hand is finished. Start new hand instead of new round.`);
    }

    this.highestBetLastRound = this.highestBetThisRound;
    this.highestBetThisRound = 0;
    this.isRoundOver = false;

    // reset player's bets for the round
    this.players.forEach((player) => {
      player.betThisRound = 0;
      player.hasPlayedThisRound = false;
    });

    // set to next round
    this.round = RoundsOfAHandOrdered[_.indexOf(RoundsOfAHandOrdered, this.round) + 1];
  }

  recalculatePots() {
    let playersOrderedByBet = _.orderBy(this.players, ['betThisHand'], ['asc']);

    // create main pot
    let mainPot = new Pot();
    mainPot.toCall = this.highestBetThisHand;

    // create side pots (side pots are created for players who are all in but still have bet less than highest bet for the hand)
    let sidePots = _(playersOrderedByBet)
      .reject('hasFolded')
      .filter('isAllIn')
      .filter((player) => player.bet < this.highestBetThisHand)
      .map((player) => {
        let sidePot = new Pot();
        sidePot.toCall = player.bet;

        return sidePot;
      })
      .value();

    // combine them
    this.pots = _.concat(sidePots, mainPot);

    // calculate total chips in all pots
    let toCallForLastPot = 0;

    _.forEach(this.pots, (pot) => {
      pot.players = _(playersOrderedByBet)
        .reject('hasFolded')
        .filter((player) => player.bet >= pot.toCall)
        .value();

      pot.chips = (pot.toCall - toCallForLastPot) * pot.players.length;

      // need to include any players that bet then folded
      pot.chips += _(playersOrderedByBet) 
        .filter('hasFolded')
        .filter((player) => player.bet > toCallForLastPot)
        .filter((player) => player.bet < pot.toCall)
        .map('bet')
        .sum();

      toCallForLastPot = pot.toCall;
    });
  }
}

export { PokerGame }