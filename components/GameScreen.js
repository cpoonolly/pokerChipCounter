import React from 'react';
import _ from 'lodash';
import { StyleSheet, View, Dimensions, Button, TextInput } from 'react-native';
import { LinearGradient } from 'expo';
import Svg from 'react-native-svg';

import { PokerGame, PokerGameEvents } from '../models/PokerGame';
import PokerTable from './PokerTable'
import PokerPlayerAvatar from './PokerPlayerAvatar';
import PokerPlayerBet from './PokerPlayerBet';
import PokerPot from './PokerPot';
import PokerCards from './PokerCards';
import RaiseModal from './RaiseModal';

const { Defs, Rect, Stop } = Svg;

const BACKGROUND_GRADIENT_ID = 'background_gradient_id';
const TABLE_BORDER_RADIUS = 50;
const TABLE_PADDING = 50;

export default class GameScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      showRaiseModal: false,
      showAwardPotModal: false,
    };

    const { navigation } = this.props;
    const chipsPerPlayer = navigation.getParam('chipsPerPlayer');
    const bigBlind = navigation.getParam('bigBlind');
    const smallBlind = navigation.getParam('smallBlind');
    const playersNames = navigation.getParam('playersNames');

    this.pokerGame = new PokerGame(playersNames, chipsPerPlayer, smallBlind, bigBlind);
  }

  getTableWidth() {
    return this.state.width - (2 * TABLE_PADDING);
  }

  getTableHeight() {
    return this.state.height - (2 * TABLE_PADDING);
  }

  componentDidMount() {
    const {width, height} = Dimensions.get('window');

    this.pokerGame.subscribeToEvent(PokerGameEvents.TURN_FINISHED, () => this.onTurnEnd());
    this.pokerGame.subscribeToEvent(PokerGameEvents.ROUND_FINISHED, () => this.onRoundEnd());
    this.pokerGame.subscribeToEvent(PokerGameEvents.HAND_FINISHED, () => this.onHandEnd());

    this.pokerGame.startNewHand();
    this.setState({width: width, height: height - 50});
  }

  onCheck() {
    console.log('Check!');
    this.pokerGame.check();
  }

  onCall() {
    console.log('Call!');
    this.pokerGame.call();
  }

  onRaise() {
    console.log('Raise!');
    this.setState(() => ({showRaiseModal: true}));
  }

  onFold() {
    console.log('Fold!');
    this.pokerGame.fold();
  }

  onTurnEnd() {
    console.log('Turn End!');
    this.setState(() => ({showRaiseModal: false, showAwardPotModal: false}));
  }

  onRoundEnd() {
    console.log('Round End!');
    this.pokerGame.startNewRound();
    this.setState(() => ({showRaiseModal: false, showAwardPotModal: false}));
  }

  onHandEnd() {
    console.log('Hand End!');
    this.setState(() => ({showRaiseModal: false, showAwardPotModal: true})); 
  }

  renderDefs() {
    return (
      <Defs>
        {this.renderBackgroundDefs()}
        {PokerTable.renderDefs()}
        {PokerPlayerAvatar.renderDefs()}
      </Defs>
    )
  }

  renderTable() {
    const tableHeight = this.getTableHeight();
    const tableWidth = this.getTableWidth();

    return (
      <PokerTable
        pokerGame={this.pokerGame}
        x={TABLE_PADDING}
        y={TABLE_PADDING}
        height={tableHeight}
        width={tableWidth}
        borderRadius={TABLE_BORDER_RADIUS}
      ></PokerTable>
    );
  }

  renderPots() {
    const pokerGame = this.pokerGame;
    if (pokerGame.pots.length < 1) {
      return (null);
    }

    let xPos = this.state.width / 2;
    let yPos = this.state.height / 2;

    return (
      <React.Fragment>
        {pokerGame.pots.map((pot, index) => (
          <PokerPot
            key={`pot_${index}`}
            x={xPos}
            y={yPos - (index * 80)}
            pokerGame={this.pokerGame}
            pot={pot}
          ></PokerPot>
        ))}
      </React.Fragment>
    );
  }

  renderCards() {
    return (
      <PokerCards
        x={this.state.width / 2}
        y={(this.state.height / 2) + 100}
        pokerGame={this.pokerGame}
      ></PokerCards>
    );
  }
  
  renderPlayers() {
    const pokerGame = this.pokerGame;
    const tableWidth = this.getTableWidth();
    const tableHeight = this.getTableHeight();

    const numPlayers = pokerGame.players.length;
    const numPlayersOnLeft = Math.floor(numPlayers / 2);
    const numPlayersOnRight = numPlayers - numPlayersOnLeft;

    // x position of players on the left side of the table
    const xPosLeft = TABLE_PADDING;
    // x position of players on the right side of the table
    const xPosRight = TABLE_PADDING + tableWidth;

    // padding between players on the left side of the table
    const yPaddingLeft = tableHeight / (numPlayersOnLeft + 1);
     // padding between players on the right side of the table (can be differnt if an odd # of players)
    const yPaddingRight = tableHeight / (numPlayersOnRight + 1);

    return (
      <React.Fragment>
        {pokerGame.players.map((player, playerIndex) => {
          let isOnLeftSide = playerIndex < numPlayersOnLeft;
          let xPos = (isOnLeftSide ? xPosLeft : xPosRight);
          let yPos = (isOnLeftSide ? 
            TABLE_PADDING + (yPaddingLeft * (playerIndex + 1)) : 
            TABLE_PADDING + (yPaddingRight * (playerIndex - numPlayersOnLeft + 1))
          );

          return (
            <React.Fragment key={player.name}>
              <PokerPlayerAvatar
                pokerGame={pokerGame}
                player={player}
                x={xPos}
                y={yPos}
                radius={20}
              ></PokerPlayerAvatar>
              <PokerPlayerBet
                playerXPos={xPos}
                playerYPos={yPos}
                offset={30}
                isOnLeftSide={isOnLeftSide}
                player={player}
                pokerGame={pokerGame}
              ></PokerPlayerBet>
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }

  renderBackground() {
    return (
      <Rect width="100%" height="100%" fill={`url(#${BACKGROUND_GRADIENT_ID})`}/>
    );
  }

  renderBackgroundDefs() {
    return (
      <Svg.LinearGradient id={BACKGROUND_GRADIENT_ID} x1="0" y1="0" x2="100%" y2="100%">
        <Stop offset="0" stopColor="rgb(56,56,56)" stopOpacity="1"/>
        <Stop offset="100" stopColor="rgb(20,20,20)" stopOpacity="1"/>
      </Svg.LinearGradient>
    );
  }

  renderActionButtons() {
    const pokerGame = this.pokerGame;

    return (
      <View style={styles.actionButtonsContainer}>
        <View style={styles.actionButtons}>
          {pokerGame.canCurrentPlayerCheck() ? 
            <Button
              style={styles.actionButton}
              color="#26a69a"
              title="Check"
              onPress={() => this.onCheck()}
            ></Button>
          : null}
          {pokerGame.canCurrentPlayerCall() ? 
            <Button
              style={styles.actionButton}
              color="#26a69a"
              title="Call"
              onPress={() => this.onCall()}
            ></Button>
          : null}
          {pokerGame.canCurrentPlayerRaise() ?
            <Button
              style={styles.actionButton}
              color="#26a69a"
              title="Raise"
              onPress={() => this.onRaise()}
            ></Button>
          : null}
          {pokerGame.canCurrentPlayerFold() ? 
            <Button
              style={styles.actionButton}
              color="#26a69a"
              title="Fold"
              onPress={() => this.onFold()}
            ></Button>
          : null}
        </View>
      </View>
    );
  }

  renderModal() {
    if (!this.state.showRaiseModal && !this.state.showAwardPotModal) {
      return (null);
    }

    return (
      <View style={styles.actionModalContainer}>
        <LinearGradient
          style={styles.actionModal}
          colors={['#ffffff', '#aaaaaa']}
        >
          {this.state.showRaiseModal ? 
            <RaiseModal
              pokerGame={this.pokerGame}
              onRaise={(raiseBy) => this.pokerGame.raise(raiseBy)}
              onCancel={() => this.setState({showRaiseModal: false})}
            ></RaiseModal>
          : null}
          {this.state.showAwardPotModal ? 
            null
          : null}
        </LinearGradient>
      </View>
    );
  }

  renderAwardPotModal() {

  }

  render() {
    if (!this.pokerGame || !this.pokerGame.round) {
      return (null);
    }

    console.log(`state: {showRaiseModal: ${this.state.showRaiseModal}, showAwardPotModal: ${this.state.showAwardPotModal}}`);

    return (
      <View>
        <Svg width={this.state.width} height={this.state.height} fill="black">
          {this.renderDefs()}
          {this.renderBackground()}
          {this.renderTable()}
          {this.renderPlayers()}
          {this.renderPots()}
          {this.renderCards()}
        </Svg>
        {this.renderActionButtons()}
        {this.renderModal()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  actionModalContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 45,
    zIndex: 1001,
  },
  actionModal: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 50,
  },
  actionButtonsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: 50,
    zIndex: 1000,
  },
  actionButtons: {
    padding: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  actionButton: {
    margin: 10,
    fontSize: 8,
  },
});