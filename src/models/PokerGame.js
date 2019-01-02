import { Deck } from './Deck';
import { Player } from './Player';
import _ from 'lodash';

const StagesOfAHand = Object.freeze({
  PRE_FLOP: Symbol('pre-flop'),
  FLOP: Symbol('flop'),
  TURN: Symbol('turn'),
  RIVER: Symbol('river'),
  END: Symbol('end')
});

const PlayerActions = Object.freeze({
  CHECK: Symbol('check'),
  CALL: Symbol('call'),
  RAISE: Symbol('raise'),
  FOLD: Symbol('fold')
});

class Player {
  constructor(name, chips) {
    this.name = name;
    this.chips = chips;
    this.hasFolded = false;
    this.isAllIn = false;

    // this is the total amount bet for a full HAND (across all stages of a hand "pre-flop" to "flop" to "end")
    // this is NOT the amount displayed per round next to the player
    this.betThisHand = 0;
  }
}

class Pot {
  constructor() {
    this.players = new Set();
    this.chips = 0;
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
    this.availableActions = [];

    // this is the hightest bet for a full HAND! (not per round - it's different the amount displayed to call)
    this.highestBetThisHand = 0;

    this.stageOfHand = null;
    this.pot = null;
    this.sidePots = [];
  }

  getPlayerNextTo(player) {
    return this.players[(_.indexOf(this.players, player) + 1) % _.size(this.players)];
  }

  onCurrentPlayerCheck() {
    
  }

  onCurrentPlayerCall() {

  }

  onCurrentPlayerRaise(chips) {

  }

  onCurrentPlayerFold() {

  }

  onCurrentPlayerTurnFinished() {

  }

  onStageOfHandFinished() {

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
    player.betThisHand = newBet;
    player.isAllIn = (player.betThisHand == player.chips);
  }

  startNewHand() {
    this.stageOfHand = StagesOfAHand.PRE_FLOP;

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

  finishHand(playersOrderedByBestHand) {

  }

  recalculatePots() {
    // TODO - Work on this
    let playersOrderedByBet = _.orderBy(this.players, ['betThisHand'], ['asc']);
    let highestPlayerBetSoFar = 0;

    this.pots = [];

    _.forEach(playersOrderedByBet, (player, playerIndex) => {
      _.forEach(this.pots, (pot) => pot.players.add(player));

      if (player.bet < this.highestBetThisHand && !player.hasFolded) {
        let sidePot = new Pot();

        sidePot.players.add(player);
        sidePot.chips = (playersOrderedByBet.length - playerIndex) * (highestPlayerBetSoFar * player.bet);
        this.pots.push(sidePot);
      }
    }, this);
  }
}

export { PokerGame }
