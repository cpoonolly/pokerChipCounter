import _ from 'lodash';
import { PokerGame } from './PokerGame';

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

    test('should initialize first hand of the game', () => {
      let pokerGame = new PokerGame(['dealer', 'small', 'big', 'first']);

      pokerGame.startNewHand();
    });

    test('should initialize big and small blinds correctly', () => {

    });

    test('should reinitialize on successive hands of a game', () => {

    });

    test('should fail if not at the start of a game or the end of a previous hand', () => {

    });

    test('should fail if not all pots from the previous hand have been awarded', () => {

    });
  });
});
