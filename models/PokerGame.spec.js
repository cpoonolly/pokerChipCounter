import _ from 'lodash';
import { PokerGame, PokerGameEvents, RoundsOfAHand } from './PokerGame';
import { action } from 'mobx';

/**
 * Plays through a set of actions (check, call, raise/allIn, fold) for a hand.
 * If the number of actions surpasses a round a new round is automically started and more actions are made.
 * If the number of actions surpasses a hand then all remaining actions after the hand is finished are ignored.
 * 
 * @param {PokerGame} pokerGame - poker game instance
 * @param {Array<Function>} actions - an array of callbacks to be executed on each players turn
 * @returns a promise that is resolved once hand is finished
 */
function playHand(pokerGame, actions) {
  return new Promise((resolve) => {
    let actionIndex = 0;

    pokerGame.subscribeToEvent(PokerGameEvents.TURN_FINISHED, () => {
      if (actionIndex < actions.length) {
        actions[actionIndex++]();
      } else {
        resolve();
      }
    });
  
    pokerGame.subscribeToEvent(PokerGameEvents.ROUND_FINISHED, () => {
      if (actionIndex < actions.length) {
        pokerGame.startNewRound();
        actions[actionIndex++]();
      } else {
        resolve();
      }
    });
  
    pokerGame.subscribeToEvent(PokerGameEvents.HAND_FINISHED, resolve);

    actions[actionIndex++]();
  });
}

describe('PokerGame', () => {
  describe.skip('creating a new instance', () => {
    test('fails if less than 2 players passed', () => {
      expect(() => new PokerGame()).toThrowError('At least 2 players need to be present!');
      expect(() => new PokerGame([])).toThrowError('At least 2 players need to be present!');
      expect(() => new PokerGame(['foo'])).toThrowError('At least 2 players need to be present!');
    });
    
    test('fails if small blind < big blind', () => {
      expect(() => new PokerGame(['foo', 'bar'], 100, 2, 1)).toThrowError('Small blind must be less than big blind!');
    });
    
    test('fails if big blind < starting number of chips per players', () => {
      expect(() => new PokerGame(['foo', 'bar'], 10, 1, 11)).toThrowError('Big blind must be less than the available chips per player!');
    });
    
    test('should set default values', () => {
      let pokerGame = new PokerGame(['foo', 'bar']);
      
      expect(pokerGame).toBeDefined();
      expect(pokerGame.chipsPerPlayer).toBe(100);
      expect(pokerGame.smallBlind).toBe(5);
      expect(pokerGame.bigBlind).toBe(10);
    });

    test('initializes players with starting chips', () => {
      let pokerGame = new PokerGame(['foo', 'bar', 'fizz', 'buzz'], 300);

      expect(pokerGame.players).toHaveLength(4);

      expect(pokerGame.players[0].name).toBe('foo');
      expect(pokerGame.players[0].chips).toBe(300);

      expect(pokerGame.players[1].name).toBe('bar');
      expect(pokerGame.players[1].chips).toBe(300);

      expect(pokerGame.players[2].name).toBe('fizz');
      expect(pokerGame.players[2].chips).toBe(300);

      expect(pokerGame.players[3].name).toBe('buzz');
      expect(pokerGame.players[3].chips).toBe(300);
    });
  });

  describe.skip('starting the first hand of the game', () => {
    let pokerGame;
    let expectedSmallBlind;
    let expectedBigBlind;

    beforeEach(() => {
      pokerGame = new PokerGame(['dealer', 'small', 'big']);
      pokerGame.startNewHand();

      // set expected players for small & big blind
      expectedSmallBlind = pokerGame.players[1];
      expectedBigBlind = pokerGame.players[2];

      // a bit of a sanity check here...
      console.assert(expectedSmallBlind.name === 'small');
      console.assert(expectedBigBlind.name === 'big');
    });

    test('should set the dealer to the first player', () => {
      expect(pokerGame.dealer.name).toBe('dealer');
    });

    test('should set the current player to be the big blind', () => {
      expect(pokerGame.currentPlayer.name).toBe('big');
    });

    test('should setup small blind', () => {
      expect(expectedSmallBlind.betThisHand).toBe(pokerGame.smallBlind);
      expect(expectedSmallBlind.betThisRound).toBe(pokerGame.smallBlind);
      expect(expectedSmallBlind.hasPlayedThisRound).toBe(false);
    });

    test('should setup big blind', () => {
      expect(expectedBigBlind.betThisHand).toBe(pokerGame.bigBlind);
      expect(expectedBigBlind.betThisRound).toBe(pokerGame.bigBlind);
      expect(expectedBigBlind.hasPlayedThisRound).toBe(false);
    });

    test('should add blinds to the pot', () => {
      expect(pokerGame.pots).toHaveLength(1);
      
      let mainPot = pokerGame.pots[0];
      expect(mainPot.chips).toBe(pokerGame.smallBlind + pokerGame.bigBlind);
      expect(mainPot.players).toHaveLength(2);
      expect(mainPot.players[0].name).toBe(expectedSmallBlind.name);
      expect(mainPot.players[1].name).toBe(expectedBigBlind.name);
    });
  });

  describe.skip('starting a new hand after previous hand has finished', () => {
    let pokerGame;
    let expectedSmallBlind
    let expectedBigBlind;

    beforeEach(async () => {
      pokerGame = new PokerGame(['player1', 'player2', 'player3', 'player4']);
      pokerGame.startNewHand();

      // player 3 raises every round
      // player 1 & 2 call
      // player 4 folds on river
      await playHand(pokerGame, [
        // hand 1 (small=player2, big=player3)
        // pre-flop
        () => pokerGame.raise(10),  // player3
        () => pokerGame.call(),     // player4
        () => pokerGame.call(),     // player1
        () => pokerGame.call(),     // player2
        // flop
        () => pokerGame.raise(10),  // player3
        () => pokerGame.call(),     // player4
        () => pokerGame.call(),     // player1
        () => pokerGame.call(),     // player2
        // turn
        () => pokerGame.raise(10),  // player3
        () => pokerGame.call(),     // player4
        () => pokerGame.call(),     // player1
        () => pokerGame.call(),     // player2
        // river
        () => pokerGame.raise(10),  // player3
        () => pokerGame.fold(),     // player4
        () => pokerGame.call(),     // player1
        () => pokerGame.call(),     // player2
      ]);

      // award player3 the hand & then start a new hand
      pokerGame.pots.forEach((pot) => pokerGame.awardPot(pot, [pokerGame.players[2]]));
      pokerGame.startNewHand();

      // set expected players for small & big blind
      expectedSmallBlind = pokerGame.players[2];
      expectedBigBlind = pokerGame.players[3];

      // a bit of a sanity check here...
      console.assert(expectedSmallBlind.name === 'player3');
      console.assert(expectedBigBlind.name === 'player4');
    });

    test('should set dealer to be next player', () => {
      expect(pokerGame.dealer.name).toBe('player2');
    });
    
    test('should set the current player to be the new big blind', () => {
      expect(pokerGame.currentPlayer.name).toBe('player4');
    });

    test('should setup small blind', () => {
      expect(expectedSmallBlind.betThisHand).toBe(pokerGame.smallBlind);
      expect(expectedSmallBlind.betThisRound).toBe(pokerGame.smallBlind);
      expect(expectedSmallBlind.hasPlayedThisRound).toBe(false);
    });

    test('should setup big blind', () => {
      expect(expectedBigBlind.betThisHand).toBe(pokerGame.bigBlind);
      expect(expectedBigBlind.betThisRound).toBe(pokerGame.bigBlind);
      expect(expectedBigBlind.hasPlayedThisRound).toBe(false);
    });

    test('should add blinds to the pot', () => {
      expect(pokerGame.pots).toHaveLength(1);
      
      let mainPot = pokerGame.pots[0];
      expect(mainPot.chips).toBe(pokerGame.smallBlind + pokerGame.bigBlind);
      expect(mainPot.players).toHaveLength(2);
      expect(mainPot.players[0].name).toBe(expectedSmallBlind.name);
      expect(mainPot.players[1].name).toBe(expectedBigBlind.name);
    });
  });

  describe.skip('staring a hand when small blind doesn\'t have enough chips', () => {
    let pokerGame;
    let playerSmall;

    beforeEach(async () => {
      pokerGame = new PokerGame(['dealer', 'small', 'big'], 100, 20, 40);

      playerSmall = pokerGame.players[1];
      console.assert(playerSmall.name === 'small');

      playerSmall.chips = 10;
      pokerGame.startNewHand();
    });

    test('should set small blind all in', () => {
      expect(playerSmall.isAllIn).toBe(true);
      expect(playerSmall.betThisHand).toBe(10);
      expect(playerSmall.betThisRound).toBe(10);
      expect(playerSmall.chips).toBe(0);
    });

    test('should create side pot for small', () => {
      expect(pokerGame.pots).toHaveLength(2);

      let sidePot = pokerGame.pots[0];
      expect(sidePot.toCall).toBe(10);
      expect(sidePot.chips).toBe(20); // 10 from small & 10 from big
      expect(sidePot.players).toHaveLength(2);
      expect(sidePot.players[0].name).toBe('small');
      expect(sidePot.players[1].name).toBe('big');
      
      let mainPot = pokerGame.pots[1];
      expect(mainPot.toCall).toBe(40); // total bet for the hand should be 40 in order to be included in this pot
      expect(mainPot.chips).toBe(30); // 30 from big in this pot, 10 from big in the side pot
      expect(mainPot.players).toHaveLength(1);
      expect(mainPot.players[0].name).toBe('big');
    });
  });

  describe.skip('starting a hand when big blind doesn\'t have enough chips', () => {
    let pokerGame;
    let playerBig;

    beforeEach(async () => {
      pokerGame = new PokerGame(['dealer', 'small', 'big'], 100, 20, 40);

      playerBig = pokerGame.players[2];
      console.assert(playerBig.name === 'big');

      playerBig.chips = 10;
      pokerGame.startNewHand();
    });

    test('should set big blind all in', () => {
      expect(playerBig.isAllIn).toBe(true);
      expect(playerBig.betThisHand).toBe(10);
      expect(playerBig.betThisRound).toBe(10);
      expect(playerBig.chips).toBe(0);
    });

    test('should create side pot for big', () => {
      expect(pokerGame.pots).toHaveLength(2);

      let sidePot = pokerGame.pots[0];
      expect(sidePot.toCall).toBe(10);
      expect(sidePot.chips).toBe(20); // 10 from big & 10 from small
      expect(sidePot.players).toHaveLength(2);
      expect(sidePot.players[0].name).toBe('big');
      expect(sidePot.players[1].name).toBe('small');
      
      let mainPot = pokerGame.pots[1];
      expect(mainPot.toCall).toBe(40); // total bet for the hand should be 40 in order to be included in this pot
      expect(mainPot.chips).toBe(10); // 30 from big in this pot, 10 from big in the side pot
      expect(mainPot.players).toHaveLength(1);  
      expect(mainPot.players[0].name).toBe('small');
    });
  });

  describe('starting a hand when there are players who have 0 chips', () => {

  });

  describe('starting a hand when only one player remains', () => {

  });

  describe('starting a hand when not all pots have been awarded', () => {
    // expect(() => pokerGame.startNewHand).toThrowError(`There are still pots that haven't been awarded. Cannot start new hand until all pots have been awarded`);
  });

  describe('starting a hand should fail if not at the start of a game or the end of a previous hand', () => {

  });

  describe('starting a hand when there are only 2 players', () => {

  });

  describe('when big blind checks', () => {

  });

  describe('when small blind folds', () => {

  });

  describe('when a player checks for their turn', () => {

  });

  describe('when a player calls for their turn', () => {

  });

  describe('when a player folds for their turn', () => {

  });

  describe('when all players check for the round', () => {

  });

  describe('when a player raises for the round', () => {

  });

  describe('when all player check for the hand', () => {

  });

  describe('when each round is finished', () => {

  });

  describe('when all rounds have finished for the hand', () => {
    // 4 players play a hand
    // pre-flop: all players check
    // flop: 123 check, 4 raises, 1 folds, 23 call
    // turn: 234 check
    // river: 2 raises, 3 raises, 4 raises, 2 folds, 3 calls
  });

  describe.skip('when all players go all in', () => {
    let pokerGame;

    beforeEach(async () => {
      pokerGame = new PokerGame(['dealer', 'small', 'big']);
      pokerGame.startNewHand();

      // small raises so they only have 1 chip
      // dealer folds
      // big calls and ultimately wins
      await playHand(pokerGame, [
        // pre-flop
        () => pokerGame.check(),  // big
        () => pokerGame.check(),  // dealer
        () => pokerGame.allIn(),  // small
        () => pokerGame.call(),   // dealer
        () => pokerGame.call()   // big
        // flop
        // turn
        // river
      ]);
    });
  });

  describe('when all players except one fold', () => {

  });

  describe('when side pots need to be created', () => {

  });

  describe('when there are multiple side pots', () => {

  });
});
