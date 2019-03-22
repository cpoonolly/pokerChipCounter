import React from 'react';
import _ from 'lodash';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg from 'react-native-svg';

import { PokerGame } from '../models/PokerGame';
import PokerTable from './PokerTable'
import PokerPlayerAvatar from './PokerPlayerAvatar';
import PokerPlayerBet from './PokerPlayerBet';

const { Defs, Rect, LinearGradient, Stop, Image } = Svg;
const BACKGROUND_GRADIENT_ID = 'background_gradient_id';

export default class GameScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      padding: 50
    };

    const { navigation } = this.props;
    const chipsPerPlayer = navigation.getParam('chipsPerPlayer');
    const bigBlind = navigation.getParam('bigBlind');
    const smallBlind = navigation.getParam('smallBlind');
    const playersNames = navigation.getParam('playersNames');

    this.pokerGame = new PokerGame(playersNames, chipsPerPlayer, smallBlind, bigBlind);
  }

  getTableWidth() {
    return this.state.width - (2 * this.state.padding);
  }

  getTableHeight() {
    return this.state.height - (2 * this.state.padding);
  }

  componentDidMount() {
    const {width, height} = Dimensions.get('window');

    this.setState({width: width, height: height - 50});
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
        x={this.state.padding}
        y={this.state.padding}
        height={tableHeight}
        width={tableWidth}
        borderRadius={50}
      ></PokerTable>
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
    const xPosLeft = this.state.padding;
    // x position of players on the right side of the table
    const xPosRight = this.state.padding + tableWidth;

    // padding between players on the left side of the table
    const yPaddingLeft = tableHeight / (numPlayersOnLeft + 1);
     // padding between players on the right side of the table (can be differnt if an odd # of players)
    const yPaddingRight = tableHeight / (numPlayersOnRight + 1);

    return (
      <React.Fragment>
        {pokerGame.players.map((player, playerIndex) => {
          let isOnLeftSide = playerIndex < numPlayersOnLeft;
          let xPos = (isOnLeftSide ? xPosLeft : xPosRight);
          let yPos = this.state.padding + (isOnLeftSide ? yPaddingLeft * (playerIndex + 1) : yPaddingRight * (playerIndex - numPlayersOnLeft + 1));

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
                width={30}
                height={30}
                isOnLeftSide={isOnLeftSide}
                player={player}
                pokerGame={pokerGame}
              ></PokerPlayerBet>

              {/* <Image
                x={isOnLeftSide ? xPos + 20 + 10: xPos - 20 - 10 - 30}
                y={yPos - 15}
                width={30}
                height={30}
                href={require('../assets/chips.png')}
              />
              <Image
                x={isOnLeftSide ? xPos + 20 + 10 - 5: xPos - 20 - 10 - 30 + 5}
                y={yPos - 15 + 5}
                width={30}
                height={30}
                href={require('../assets/chips.png')}
              />
              <Image
                x={isOnLeftSide ? xPos + 20 + 10 - 10: xPos - 20 - 10 - 30 + 10}
                y={yPos - 15 + 10}
                width={30}
                height={30}
                href={require('../assets/chips.png')}
              /> */}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }

  renderBackground() {
    return (<Rect width="100%" height="100%" fill={`url(#${BACKGROUND_GRADIENT_ID})`}/>)
  }

  renderBackgroundDefs() {
    return (
      <LinearGradient id={BACKGROUND_GRADIENT_ID} x1="0" y1="0" x2="100%" y2="100%">
        <Stop offset="0" stopColor="rgb(56,56,56)" stopOpacity="1"/>
        <Stop offset="100" stopColor="rgb(20,20,20)" stopOpacity="1"/>
      </LinearGradient>
    );
  }

  render() {
    return (
      <View>
        <Svg width={this.state.width} height={this.state.height} fill="black">
          {this.renderDefs()}
          {this.renderBackground()}
          {this.renderTable()}
          {this.renderPlayers()}
        </Svg>
      </View>
    );
  }
}

const styles = StyleSheet.create({

});