import React from 'react';
import _ from 'lodash';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Svg from 'react-native-svg';

import { PokerGame } from '../models/PokerGame';
import PokerTable from './PokerTable'
import PokerPlayerAvatar from './PokerPlayerAvatar';

const { Defs } = Svg;

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
            <PokerPlayerAvatar
              key={player.name}
              pokerGame={pokerGame}
              player={player}
              x={xPos}
              y={yPos}
              radius={30}
            ></PokerPlayerAvatar>
          );
        })}
      </React.Fragment>
    );
  }

  render() {
    return (
      <View>
        <Svg width={this.state.width} height={this.state.height}>
          {this.renderDefs()}
          {this.renderTable()}
          {this.renderPlayers()}
        </Svg>
      </View>
    );
  }
}

const styles = StyleSheet.create({

});