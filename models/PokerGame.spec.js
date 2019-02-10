import _ from 'lodash';
import { PokerGame, PokerGameEvents, RoundsOfAHand } from './PokerGame';

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

    pokerGame.subscribeToEvent(PokerGameEvents.TURN_FINISHED, function () {
      if (actionIndex < actions.length) {
        actions[actionIndex++]();
      } else {
        pokerGame.unsubscribeToEvent(PokerGameEvents.TURN_FINISHED, this);
        resolve();
      }
    });
  
    pokerGame.subscribeToEvent(PokerGameEvents.ROUND_FINISHED, function () {
      if (actionIndex < actions.length) {
        pokerGame.startNewRound();
        actions[actionIndex++]();
      } else {
        pokerGame.unsubscribeToEvent(PokerGameEvents.ROUND_FINISHED, this);
        resolve();
      }
    });
  
    pokerGame.subscribeToEvent(PokerGameEvents.HAND_FINISHED, function() {
      pokerGame.unsubscribeToEvent(PokerGameEvents.HAND_FINISHED, this);
      resolve();
    });

    actions[actionIndex++]();
  });
}

describe('PokerGame', () => {
  describe('creating a new instance', () => {
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

  describe('starting the first hand of the game', () => {
    let pokerGame;
    let expectedSmallBlind;
    let expectedBigBlind;

    beforeEach(() => {
      pokerGame = new PokerGame(['dealer', 'small', 'big', 'first']);
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

    test('should set the current player to be right of big blind', () => {
      expect(pokerGame.currentPlayer.name).toBe('first');
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

  describe('starting a new hand after previous hand has finished', () => {
    let pokerGame;
    let expectedSmallBlind
    let expectedBigBlind;
    let expectedFirstPlayer;

    beforeEach(async () => {
      pokerGame = new PokerGame(['player1', 'player2', 'player3', 'player4']);
      pokerGame.startNewHand();

      // player 4 raises every round
      // player 1 & 2 call
      // player 3 folds on river
      await playHand(pokerGame, [
        // hand 1 (small=player2, big=player3)
        // pre-flop
        () => pokerGame.raise(10),  // player4
        () => pokerGame.call(),     // player1
        () => pokerGame.call(),     // player2
        () => pokerGame.call(),     // player3
        // flop
        () => pokerGame.raise(10),  // player4
        () => pokerGame.call(),     // player1
        () => pokerGame.call(),     // player2
        () => pokerGame.call(),     // player3
        // turn
        () => pokerGame.raise(10),  // player4
        () => pokerGame.call(),     // player1
        () => pokerGame.call(),     // player2
        () => pokerGame.call(),     // player3
        // river
        () => pokerGame.raise(10),  // player4
        () => pokerGame.call(),     // player1
        () => pokerGame.call(),     // player2
        () => pokerGame.fold(),     // player3
      ]);

      // award player2 the hand & then start a new hand
      pokerGame.pots.forEach((pot) => pokerGame.awardPot(pot, [pokerGame.players[1]]));
      pokerGame.startNewHand();

      // set expected players for small & big blind
      expectedSmallBlind = pokerGame.players[2];
      expectedBigBlind = pokerGame.players[3];
      expectedFirstPlayer = pokerGame.players[0];

      // a bit of a sanity check here...
      console.assert(expectedSmallBlind.name === 'player3');
      console.assert(expectedBigBlind.name === 'player4');
    });

    test('should set dealer to be next player', () => {
      expect(pokerGame.dealer.name).toBe('player2');
    });
    
    test('should set the current player to be the new big blind', () => {
      expect(pokerGame.currentPlayer.name).toBe(expectedFirstPlayer.name);
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

  describe('staring a hand when small blind doesn\'t have enough chips', () => {
    let pokerGame;
    let playerSmall;

    beforeEach(async () => {
      pokerGame = new PokerGame(['dealer', 'small', 'big', 'first'], 100, 20, 40);

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

  describe('starting a hand when big blind doesn\'t have enough chips', () => {
    let pokerGame;
    let playerBig;

    beforeEach(async () => {
      pokerGame = new PokerGame(['dealer', 'small', 'big', 'first'], 100, 20, 40);

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

  test('starting a hand should remove players with 0 chips', () => {
    let pokerGame = new PokerGame(['player1', 'player2', 'player3', 'player4', 'player5']);

    // set chips for player 2 & 4 to 0
    pokerGame.players[1].chips = 0;
    pokerGame.players[3].chips = 0;

    console.assert(pokerGame.players.length === 5);

    pokerGame.startNewHand();
    expect(pokerGame.players).toHaveLength(3);
    expect(pokerGame.players[0].name).toBe('player1');
    expect(pokerGame.players[1].name).toBe('player3');
    expect(pokerGame.players[2].name).toBe('player5');
  });

  test('starting a hand should throw error when only one player remains', () => {
    let pokerGame = new PokerGame(['p1', 'p2', 'p3', 'p4']);

    // set player 1 & 2's chips to 0
    pokerGame.players[0].chips = 0;
    pokerGame.players[1].chips = 0;
    pokerGame.players[2].chips = 0;

    expect(() => pokerGame.startNewHand()).toThrow('Only one player remaining.. Game over.');
  });

  test('starting a hand should throw an error when previous hand hasn\'t finished', async () => {
    let pokerGame = new PokerGame(['dealer', 'small', 'big', 'first']);
    pokerGame.startNewHand();
    
    // first raises round one, dealer/small/big call, everyone checks after
    // we hold of on last player checking on river though so the hand doesn't finish
    await playHand(pokerGame, [
      // pre-flop
      () => pokerGame.raise(10),  // first
      () => pokerGame.call(),     // dealer
      () => pokerGame.call(),     // small
      () => pokerGame.call(),     // big
      // flop
      () => pokerGame.check(),    // first
      () => pokerGame.check(),    // dealer
      () => pokerGame.check(),    // small
      () => pokerGame.check(),    // big
      // turn
      () => pokerGame.check(),    // first
      () => pokerGame.check(),    // dealer
      () => pokerGame.check(),    // small
      () => pokerGame.check(),    // big
      // river
      () => pokerGame.check(),    // first
      () => pokerGame.check(),    // dealer
      () => pokerGame.check(),    // small
      // skipping big here so hand isn't over
    ]);
      
    expect(() => pokerGame.startNewHand()).toThrow('Current hand hasn\'t finished yet.');
  });

  describe('starting a hand when not all pots have been awarded', () => {
    let pokerGame;

    beforeEach(async () => {
      pokerGame = new PokerGame(['dealer', 'small', 'big', 'first'], 100, 1, 2);
      pokerGame.startNewHand();

      // set small to have less chips so we can create a side pot
      pokerGame.players[1].chips = 50;

      // first & dealer check
      // small goes all in (50 chips) to create a side pot
      // big goes all in after & dealer/first call
      // first/big/dealer check for the rest of the rounds
      await playHand(pokerGame, [
        // pre-flop
        () => pokerGame.call(),  // first
        () => pokerGame.call(),  // dealer
        () => pokerGame.allIn(),  // small (all in with only 50 chips)
        () => pokerGame.raise(pokerGame.highestBetThisHand + 10),   // big
        () => pokerGame.call(),   // first
        () => pokerGame.call(),   // dealer
        // flop
        () => pokerGame.check(),  // first
        () => pokerGame.check(),  // big
        () => pokerGame.check(),  // dealer
        // turn
        () => pokerGame.check(),  // first
        () => pokerGame.check(),  // big
        () => pokerGame.check(),  // dealer
        // river
        () => pokerGame.check(),  // first
        () => pokerGame.check(),  // big
        () => pokerGame.check()   // dealer
      ]);

      console.assert(pokerGame.pots.length === 2);
    });

    test('should throw an error if no pots awarded', () => {
      expect(() => pokerGame.startNewHand()).toThrow('There are still pots that haven\'t been awarded. Cannot start new hand until all pots have been awarded');
    });

    test('should throw an error if unawarded pots remain', () => {
      pokerGame.awardPot(pokerGame.pots[0], [pokerGame.players[0]]);

      expect(() => pokerGame.startNewHand()).toThrow('There are still pots that haven\'t been awarded. Cannot start new hand until all pots have been awarded');
    });

    test('should succeed if all pots awarded', () => {
      pokerGame.awardPot(pokerGame.pots[0], [pokerGame.players[0]]);
      pokerGame.awardPot(pokerGame.pots[1], [pokerGame.players[0]]);

      expect(() => pokerGame.startNewHand()).not.toThrow('There are still pots that haven\'t been awarded. Cannot start new hand until all pots have been awarded');
    });
  });

  describe('starting a hand when there are 3 players', () => {
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

    test('should set the current player to be the dealer', () => {
      expect(pokerGame.currentPlayer.name).toBe('dealer');
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

  describe('starting a hand when there are only 2 players', () => {
    let pokerGame;
    let dealer;
    let otherPlayer;

    beforeEach(() => {
      pokerGame = new PokerGame(['dealer', 'other']);
      pokerGame.startNewHand();

      dealer = pokerGame.players[0];
      otherPlayer = pokerGame.players[1];

      // a bit of a sanity check here...
      console.assert(dealer.name === 'dealer');
      console.assert(otherPlayer.name === 'other');
    });

    test('should set the dealer to the first player', () => {
      expect(pokerGame.dealer.name).toBe(dealer.name);
    });

    test('should set the current player to be the dealer', () => {
      expect(pokerGame.currentPlayer.name).toBe(dealer.name);
    });

    test('should setup dealer as small blind', () => {
      expect(pokerGame.dealer.betThisHand).toBe(pokerGame.smallBlind);
      expect(pokerGame.dealer.betThisRound).toBe(pokerGame.smallBlind);
      expect(pokerGame.dealer.hasPlayedThisRound).toBe(false);
    });

    test('should setup big blind', () => {
      expect(otherPlayer.betThisHand).toBe(pokerGame.bigBlind);
      expect(otherPlayer.betThisRound).toBe(pokerGame.bigBlind);
      expect(otherPlayer.hasPlayedThisRound).toBe(false);
    });

    test('should add blinds to the pot', () => {
      expect(pokerGame.pots).toHaveLength(1);
      
      let mainPot = pokerGame.pots[0];
      expect(mainPot.chips).toBe(pokerGame.smallBlind + pokerGame.bigBlind);
      expect(mainPot.players).toHaveLength(2);
      expect(mainPot.players[0].name).toBe(dealer.name);
      expect(mainPot.players[1].name).toBe(otherPlayer.name);
    });
  });

  describe('big blind on pre-flop', () => {
    let pokerGame;
    let playerBig;
    
    beforeEach(async () => {
      pokerGame = new PokerGame(['dealer', 'small', 'big', 'first']);
      pokerGame.startNewHand();

      playerBig = pokerGame.players[2];
      console.assert(playerBig.name === 'big');

      await playHand(pokerGame, [
        // pre-flop
        () => pokerGame.call(),   // first
        () => pokerGame.call(),   // dealer
        () => pokerGame.call()    // small
      ]);

      // still at pre-flop, currently big's turn
    });

    test('should finish round if big blind checks', () => {
      let onRoundFinishedSpy = jest.fn();

      pokerGame.subscribeToEvent(PokerGameEvents.ROUND_FINISHED, onRoundFinishedSpy);
      pokerGame.check(); // big checks

      expect(playerBig.betThisHand).toBe(pokerGame.bigBlind);
      expect(playerBig.hasFolded).toBe(false);
      expect(onRoundFinishedSpy).toHaveBeenCalled();
    });

    test('should continue with round if big blind raises', () => {
      let onRoundFinishedSpy = jest.fn();

      pokerGame.subscribeToEvent(PokerGameEvents.ROUND_FINISHED, onRoundFinishedSpy);
      pokerGame.raise(10);

      expect(playerBig.betThisHand).toBe(pokerGame.bigBlind + 10);
      expect(playerBig.hasFolded).toBe(false);
      expect(onRoundFinishedSpy).not.toHaveBeenCalled();

      expect(pokerGame.isRoundOver).toBe(false);
      expect(pokerGame.currentPlayer.name).toBe('first');
    });
  });

  describe('small blind on pre-flop', () => {
    let pokerGame;
    let playerSmall;
    
    beforeEach(async () => {
      pokerGame = new PokerGame(['dealer', 'small', 'big', 'first'], 100, 5, 10);
      pokerGame.startNewHand();

      playerSmall = pokerGame.players[1];
      console.assert(playerSmall.name === 'small');

      await playHand(pokerGame, [
        // pre-flop
        () => pokerGame.call(),   // first
        () => pokerGame.call()    // dealer
      ]);

      // still at pre-flop, currently small's turn
    });

    test('should allow small to fold', () => {
      pokerGame.fold(); // small folds

      expect(playerSmall.betThisHand).toBe(pokerGame.smallBlind);
      expect(playerSmall.betThisRound).toBe(pokerGame.smallBlind);
      expect(playerSmall.hasFolded).toBe(true);
    });

    test('should allow small to call for remainder of big blind', () => {
      pokerGame.call() // small calls

      expect(playerSmall.betThisHand).toBe(pokerGame.bigBlind);
      expect(playerSmall.betThisRound).toBe(pokerGame.bigBlind);
      expect(playerSmall.hasFolded).toBe(false);
    });

    test('should allow small to raise for more than remainder of big blind', () => {
      pokerGame.raise(15); // small raises up to big blind + 10

      expect(playerSmall.betThisHand).toBe(20);
      expect(playerSmall.betThisRound).toBe(20);
      expect(playerSmall.hasFolded).toBe(false);
    });

    test('should fail if small attempts to check', () => {
      expect(() => pokerGame.check()).toThrow('Player must have a bet of at least 5 or go all in');
    });

    test('should fail if small attempts to raise less than remainder of big blind', () => {
      expect(() => pokerGame.raise(1)).toThrow('Player must have a bet of at least 5 or go all in');
    });
  });

  test('should throw error when a player attempts to check on the pre-flop', async () => {
    let pokerGame = new PokerGame(['dealer', 'small', 'big', 'first'], 100, 5, 10);
    pokerGame.startNewHand();

    // first - attempt to check initially then just fold
    expect(() => pokerGame.check()).toThrow('Player must have a bet of at least 10 or go all in');
    pokerGame.fold();

    // dealer - expect the same error when checking
    expect(() => pokerGame.check()).toThrow('Player must have a bet of at least 10 or go all in');
  });

  describe('when a player attempts to check after a raise', () => {

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

  describe('when all players go all in', () => {
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
