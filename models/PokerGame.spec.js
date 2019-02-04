import _ from 'lodash';
import { PokerGame, PokerGameEvents, RoundsOfAHand } from './PokerGame';

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

    describe('on the first hand of the game', () => {
      let pokerGame;

      beforeEach(() => {
        pokerGame = new PokerGame(['dealer', 'small', 'big', 'first']);

        pokerGame.startNewHand();
      });

      test('should set the dealer to the first player', () => {
        expect(pokerGame.dealer.name).toBe('dealer');
      });

      test('should setup big and small blinds', () => {
        let expectedSmallBlind = pokerGame.players[1];
        let expectedBigBlind = pokerGame.players[2];

        // a bit of a sanity check here... pokerGame.players will be set in the same order as the array of player names
        // passed in to the constructor
        expect(expectedSmallBlind.name).toBe('small');
        expect(expectedBigBlind.name).toBe('big');

        expect(expectedSmallBlind.betThisHand).toBe(pokerGame.smallBlind);
        expect(expectedSmallBlind.betThisRound).toBe(pokerGame.smallBlind);
        expect(expectedSmallBlind.hasPlayedThisRound).toBe(false);

        expect(expectedBigBlind.betThisHand).toBe(pokerGame.bigBlind);
        expect(expectedBigBlind.betThisRound).toBe(pokerGame.bigBlind);
        expect(expectedBigBlind.hasPlayedThisRound).toBe(false);

        expect(pokerGame.pots).toHaveLength(1);

        let mainPot = pokerGame.pots[0];
        expect(mainPot.chips).toBe(pokerGame.smallBlind + pokerGame.bigBlind);
        expect(mainPot.players).toHaveLength(2);
        expect(mainPot.players[0].name).toBe('small');
        expect(mainPot.players[1].name).toBe('big');
      });

      test('should set the current player to be the big blind', () => {
        expect(pokerGame.currentPlayer.name).toBe('big');
      })
    });

    describe('on successive hands of the game', () => {
      let pokerGame;
      let winningPlayer;

      beforeEach(() => {
        pokerGame = new PokerGame(['player1', 'player2', 'player3', 'player4']);
        winningPlayer = pokerGame.players[0];

        // play through one hand of the game

        // player 3 raises by 10 each round then goes all-in on river
        // player 1 & 2 always call
        // player 4 folds after the flop
        pokerGame.subscribeToEvent(PokerGameEvents.TURN_FINISHED, () => {
          let currentPlayer = pokerGame.currentPlayer;

          if (currentPlayer.name === 'player3') {
            pokerGame.raise(pokerGame.round === RoundsOfAHand.RIVER ? currentPlayer.chips : 10);
          } else if (currentPlayer.name === 'player4' && pokerGame.round === RoundsOfAHand.FLOP) {
            pokerGame.fold();
          } else {
            pokerGame.raise(10);
          }
        });

        // start each new round immediately with a check
        pokerGame.subscribeToEvent(PokerGameEvents.ROUND_FINISHED, () => {
          pokerGame.startNewRound();
          pokerGame.check();
        });

        // award all pots and call startNewHand again (it's this second call that we're testing)
        pokerGame.subscribeToEvent(PokerGameEvents.HAND_FINISHED, () => {
          pokerGame.pots.forEach((pot) => pokerGame.awardPot(pot, [winningPlayer]));
          pokerGame.startNewHand();
        });

        pokerGame.startNewHand();
        pokerGame.check();
      });

      test('should set dealer to be next player', () => {
        expect(pokerGame.dealer.name).toBe('player2');
      });

      test.skip('should setup next big and small blinds', () => {
        let expectedSmallBlind = pokerGame.players[2];
        let expectedBigBlind = pokerGame.players[3];

        // a bit of a sanity check here... pokerGame.players will be set in the same order as the array of player names
        // passed in to the constructor
        expect(expectedSmallBlind.name).toBe('player3');
        expect(expectedBigBlind.name).toBe('player4');

        expect(expectedSmallBlind.betThisHand).toBe(pokerGame.smallBlind);
        expect(expectedSmallBlind.betThisRound).toBe(pokerGame.smallBlind);
        expect(expectedSmallBlind.hasPlayedThisRound).toBe(false);

        expect(expectedBigBlind.betThisHand).toBe(pokerGame.bigBlind);
        expect(expectedBigBlind.betThisRound).toBe(pokerGame.bigBlind);
        expect(expectedBigBlind.hasPlayedThisRound).toBe(false);

        expect(pokerGame.pots).toHaveLength(1);

        let mainPot = pokerGame.pots[0];
        expect(mainPot.chips).toBe(pokerGame.smallBlind + pokerGame.bigBlind);
        expect(mainPot.players).toHaveLength(2);
        expect(mainPot.players[0].name).toBe(expectedSmallBlind.name);
        expect(mainPot.players[1].name).toBe(expectedBigBlind.name);
      });
      
      test.skip('should set the current player to be the new big blind', () => {
        expect(pokerGame.currentPlayer.name).toBe('player4');
      });
    });

    test.skip('should fail if not all pots have been awarded', () => {
      // expect(() => pokerGame.startNewHand).toThrowError(`There are still pots that haven't been awarded. Cannot start new hand until all pots have been awarded`);
    });

    test.skip('should fail if not at the start of a game or the end of a previous hand', () => {

    });
  });
});
