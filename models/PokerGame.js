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

const PokerGameEvents = Object.freeze({
  TURN_FINISHED: Symbol('TURN_FINISHED'),
  ROUND_FINISHED: Symbol('ROUND_FINISHED'),
  HAND_FINISHED: Symbol('HAND_FINISHED')
});

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
  chipsPerPlayer = 0;
  smallBlind = 0;
  bigBlind = 0;

  players = [];
  dealer = null;
  currentPlayer = null;

  // this is the hightest bet for a full HAND! (not per round - it's different the amount displayed to call)
  highestBetThisHand = 0;

  // highest bet this/last round
  highestBetThisRound = 0;
  highestBetLastRound = 0;

  round = null;
  pots = [];

  // setting these flags to true so we can call "startNewHand"
  isRoundOver = true;
  isHandOver = true;

  subscribersByEvent = {};

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

    // Initialize subscribers map
    _(PokerGameEvents)
      .values()
      .forEach((pokerGameEvent) => this.subscribersByEvent[pokerGameEvent] = new Set(), this);
  }

  subscribeToEvent(pokerGameEvent, callback) {
    let subscribers = this.subscribersByEvent[pokerGameEvent];
    console.assert(!_.isUndefined(subscribers), 'Invalid PokerGameEvent');

    subscribers.add(callback);
  }

  notifyForEvent(pokerGameEvent) {
    let subscribers = this.subscribersByEvent[pokerGameEvent];
    console.assert(!_.isUndefined(subscribers), 'Invalid PokerGameEvent');
    
    subscribers.forEach((callback) => callback(pokerGameEvent));
  }

  unsubscribeToEvent(pokerGameEvent, callback) {
    let subscribers = this.subscribersByEvent[pokerGameEvent];
    console.assert(!_.isUndefined(subscribers), 'Invalid PokerGameEvent');

    subscribers.delete(callback);
  }

  getPlayerNextTo(player) {
    return this.players[(_.indexOf(this.players, player) + 1) % _.size(this.players)];
  }

  // TODO - double check the logic for these canCurrentPlayer* methods
  canCurrentPlayerCheck() {
    return !this.currentPlayer.hasFolded && !this.currentPlayer.isAllIn && this.currentPlayer.betThisHand === this.highestBetThisHand;
  }

  canCurrentPlayerCall() {
    return !this.currentPlayer.hasFolded && !this.currentPlayer.isAllIn && this.currentPlayer.betThisHand < this.highestBetThisHand;
  }

  canCurrentPlayerRaise() {
    return !this.currentPlayer.hasFolded && !this.currentPlayer.isAllIn;
  }

  canCurrentPlayerFold() {
    return !this.currentPlayer.hasFolded;
  }

  check() {
    this.bet(this.currentPlayer, 0);
    this.finishTurn();
  }

  call() {
    this.bet(this.currentPlayer, this.highestBetThisHand - this.currentPlayer.betThisHand);
    this.finishTurn();
  }

  raise(chips) {
    this.bet(this.currentPlayer, chips);
    this.finishTurn();
  }

  fold() {
    this.currentPlayer.hasFolded = true;
    this.finishTurn();
  }

  finishTurn() {
    this.currentPlayer.hasPlayedThisRound = true;

    // find the next player
    let nextPlayer = this.getPlayerNextTo(this.currentPlayer);
    
    while ((nextPlayer.hasFolded || nextPlayer.isAllIn) && nextPlayer !== this.currentPlayer) {
      nextPlayer = this.getPlayerNextTo(nextPlayer);
    }

    // console.assert(nextPlayer.betThisHand > this.highestBetThisHand, 'something went wrong...');

    // hand is automatically over because everyone else has folded
    if (nextPlayer === this.currentPlayer) {
      this.onHandFinished();
    
    // if next player has already gone and their bet is === to the current highest bet we're done with the round
    // TODO - double check this logic...
    } else if (nextPlayer.betThisHand === this.highestBetThisHand && nextPlayer.hasPlayedThisRound) {
      this.onRoundFinished();

    // otherwise just move on to the next player
    } else {
      this.currentPlayer = nextPlayer;
      this.onNextPlayerTurn();
    }
  }

  onNextPlayerTurn() {
    this.notifyForEvent(PokerGameEvents.TURN_FINISHED);
  }

  onRoundFinished() {
    this.isRoundOver = true;

    if (this.round === RoundsOfAHand.RIVER) {
      this.onHandFinished();
    } else {
      this.notifyForEvent(PokerGameEvents.ROUND_FINISHED);
    }
  }

  onHandFinished() {
    this.isHandOver = true;

    this.notifyForEvent(PokerGameEvents.HAND_FINISHED);
  }

  awardPot(pot, winningPlayers) {
    if (!this.isHandOver) {
      throw new Error(`Cannot start awarding pots unless the hand is over`);
    }

    // TODO - distribute winnings and mark pot as awarded
    let winningsPerPlayer = pot.chips / winningPlayers.length;

    pot.isAwarded = true;
    winningPlayers.forEach((player) => player.chips += Math.floor(winningsPerPlayer));

    // check if the divided winnings are decimally split up.. if so add extra chip to the first player
    if (Math.floor(winningsPerPlayer) < winningsPerPlayer) {
      winningPlayers[0].chips += 1;
    }
  }

  bet(player, chips) {
    if (player.hasFolded || player.isAllIn) {
      throw new Error('Player can no longer bet');
    } else if (chips > player.chips) {
      throw new Error('Cannot bet more chips than what player has!');
    } else if (player.betThisHand + chips < this.highestBetThisHand && chips < player.chips)  {
      throw new Error(`Player must have a bet of at least ${this.highestBetThisHand} or go all in`);
    }

    player.betThisHand += chips;
    player.betThisRound += chips;
    player.chips -= chips;
    player.isAllIn = (player.chips === 0);

    this.highestBetThisHand = Math.max(this.highestBetThisHand, player.betThisHand);
    this.highestBetThisRound = Math.max(this.highestBetThisRound, player.betThisRound);

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
      player.hasFolded = false;
      player.isAllIn = false;
    });

    // if a new game no dealer exists so choose the first player otherwise choose the player next to the current dealer
    this.dealer = (this.dealer ? this.getPlayerNextTo(this.dealer) : _.first(this.players));

    // player next to the dealer is small blind, person next to that is big blind
    let playerWhoIsSmallBlind = this.getPlayerNextTo(this.dealer);
    let playerWhoIsBigBlind = this.getPlayerNextTo(playerWhoIsSmallBlind);

    // set their bets and then unset their "hasPlayedThisRound" flag
    this.bet(playerWhoIsSmallBlind, Math.min(playerWhoIsSmallBlind.chips, this.smallBlind));
    this.bet(playerWhoIsBigBlind, Math.min(playerWhoIsBigBlind.chips, this.bigBlind));

    playerWhoIsSmallBlind.hasPlayedThisRound = false;
    playerWhoIsBigBlind.hasPlayedThisRound = false;

    // big blind goes first
    this.currentPlayer = playerWhoIsBigBlind;
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
      .filter((player) => player.betThisHand < this.highestBetThisHand)
      .map((player) => {
        let sidePot = new Pot();
        sidePot.toCall = player.betThisHand;

        return sidePot;
      })
      .value();

    // combine them
    this.pots = _.concat(sidePots, mainPot);

    // calculate total chips in all pots
    let toCallForLastPot = 0;

    _.forEach(this.pots, (pot) => {
      // all players with bets higher than the last pot "contributed" to this pot
      let playersWhoContributedToPot = _.filter(playersOrderedByBet, (player) => player.betThisHand > toCallForLastPot);

      // folded players aren't included in the pot.players array as they can no longer win the pot
      // they have still "contributed" to the pot however
      pot.players = _.reject(playersWhoContributedToPot, 'hasFolded');

      // calculate chips in the pot from all "contributing" players
      pot.chips = _(playersWhoContributedToPot)
        .map((player) => Math.min(player.betThisHand - toCallForLastPot, pot.toCall))
        .sum();

      toCallForLastPot = pot.toCall;
    });
  }
}

export { PokerGame, Player, Pot, RoundsOfAHand, RoundsOfAHandOrdered, PokerGameEvents }