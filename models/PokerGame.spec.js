import { PokerGame } from './PokerGame';

test('a very basic test', () => {
  let pokerGame = new PokerGame(['foo', 'bar']);
  
  expect(pokerGame).toBeDefined();
});