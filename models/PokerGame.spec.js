import _ from 'lodash';
import { PokerGame, PokerGameEvents, RoundsOfAHand } from './PokerGame';
import { action } from 'mobx';

/**
 * plays through a hand of poker
 * @param {PokerGame} pokerGame - poker game instance
 * @param {Array<Function>} actions - an array of callbacks to be executed on each players turn
 * @returns a promise that is resolved once hand is finished
 */
function playHand(pokerGame, actions) {
  return new Promise((resolve) => {
    let actionIndex = 0;

    pokerGame.subscribeToEvent(PokerGameEvents.TURN_FINISHED, () => {
      actions[actionIndex++]();
    });
  
    pokerGame.subscribeToEvent(PokerGameEvents.ROUND_FINISHED, () => {
      pokerGame.startNewRound();
      actions[actionIndex++]();
    });
  
    pokerGame.subscribeToEvent(PokerGameEvents.HAND_FINISHED, resolve);

    actions[actionIndex++]();
  });
}

/**
 * plays through a round of poker
 * @param {PokerGame} pokerGame - poker game instance
 * @param {Array<Function>} actions - an array of callbacks to be executed on each players turn
 * @returns a promise that is resolved once round is finished
 */
function playRound(pokerGame, actions) {
  return new Promise((resolve) => {
    let actionIndex = 0;

    pokerGame.subscribeToEvent(PokerGameEvents.TURN_FINISHED, () => {
      actions[actionIndex++]();
    });

    pokerGame.subscribeToEvent(PokerGameEvents.ROUND_FINISHED, resolve);

    actions[actionIndex++]();
  });
}

// TODO - Make a linter rule for this..
// NOTE - As a rule let's not nest our describes more than 3 levels... so things remain clear
// Level 1: Class name
// Level 2: Method name
// Level 3: Scenario (optional)
describe('PokerGame', () => {
  describe('constructor', () => {
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

  describe('startNewHand', () => {
    describe('when starting the first hand of the game', () => {
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

    describe('after a game', () => {
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

    describe('after small blind doesn\'t have enough chips', () => {
      let pokerGame;

      beforeEach(() => {

      });

      test('should set small blind all in', () => {

      });

      test('should create side pots', () => {

      });
    });

    describe('after big blind doesn\'t have enough chips', () => {
      let pokerGame;

      beforeEach(() => {

      });

      test('should set small blind all in', () => {

      });

      test('should create side pots', () => {

      });
    });

    test('should set dealer to big blind when there are only 2 players', () => {

    });

    test('should remove any players who have lost all their chips', () => {

    });

    test('should fail only one player remains', () => {

    });

    test('should fail if not all pots have been awarded', () => {
      let pokerGame = new PokerGame(['p1', 'p2']);
      // expect(() => pokerGame.startNewHand).toThrowError(`There are still pots that haven't been awarded. Cannot start new hand until all pots have been awarded`);
    });

    test('should fail if not at the start of a game or the end of a previous hand', () => {

    });
  });
});
