import _ from 'lodash';
import { PokerGame } from './PokerGame';

describe('PokerGame', () => {

  describe('constructor', () => {
    test('fails if less than 2 players passed', () => {

    });

    test('fails if small blind < big blind', () => {

    });

    test('fails if big blind < starting number of chips per players', () => {

    });

    test('should set default values', () => {
      let pokerGame = new PokerGame(['foo', 'bar']);
      
      expect(pokerGame).toBeDefined();
      expect(pokerGame.chipsPerPlayer).toBe(100);
      expect(pokerGame.smallBlind).toBe(5);
      expect(pokerGame.bigBlind).toBe(10);
      expect(pokerGame.dealer).toBe(null);
      expect(pokerGame.playerWhoseTurnItIs).toBe(null);
      expect(pokerGame.highestBetThisHand).toBe(0);
      expect(pokerGame.highestBetThisRound).toBe(0);
      expect(pokerGame.highestBetLastRound).toBe(0);
      expect(pokerGame.round).toBe(null);
      expect(_.isEmpty(pokerGame.pots)).toBe(true);
      expect(pokerGame.isRoundOver).toBe(false);
      expect(pokerGame.isHandOver).toBe(false);
      expect(_.isEmpty(pokerGame.subscribersByEvent)).toBe(true);
    });
  });
});