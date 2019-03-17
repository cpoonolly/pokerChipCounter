import React from 'react';
import _ from 'lodash';
import { StyleSheet, View, Text } from 'react-native';

import { PokerGame } from '../models/PokerGame';

export default class GameScreen extends React.Component {
  constructor(props) {
    super(props);

    const { navigation } = this.props;
    const chipsPerPlayer = navigation.getParam('chipsPerPlayer');
    const bigBlind = navigation.getParam('bigBlind');
    const smallBlind = navigation.getParam('smallBlind');
    const playersNames = navigation.getParam('playersNames');

    this.pokerGame = new PokerGame(playersNames, chipsPerPlayer, smallBlind, bigBlind);
  }

  render() {
    return (
      <View>
        <Text>{this.pokerGame.chipsPerPlayer}</Text>
        <Text>{this.pokerGame.bigBlind}</Text>
        <Text>{this.pokerGame.smallBlind}</Text>
        <Text>{this.pokerGame.players.map((player) => player.name)}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({

});