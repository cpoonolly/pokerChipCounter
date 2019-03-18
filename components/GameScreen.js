import React from 'react';
import _ from 'lodash';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Svg from 'react-native-svg';

import { PokerGame } from '../models/PokerGame';
import PokerTable from './PokerTable'



export default class GameScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
    }

    const { navigation } = this.props;
    const chipsPerPlayer = navigation.getParam('chipsPerPlayer');
    const bigBlind = navigation.getParam('bigBlind');
    const smallBlind = navigation.getParam('smallBlind');
    const playersNames = navigation.getParam('playersNames');

    this.pokerGame = new PokerGame(playersNames, chipsPerPlayer, smallBlind, bigBlind);
  }

  componentDidMount() {
    const {width, height} = Dimensions.get('window');

    this.setState({width: width, height: height});
  }

  render() {
    return (
      <View>
        <Svg width={this.state.width} height={this.state.height}>
          <PokerTable pokerGame={this.pokerGame} height={this.state.height - 100} width={this.state.width}></PokerTable>
        </Svg>
        {/* <Text>{this.pokerGame.chipsPerPlayer}</Text>
        <Text>{this.pokerGame.bigBlind}</Text>
        <Text>{this.pokerGame.smallBlind}</Text>
        <Text>{this.pokerGame.players.map((player) => player.name)}</Text> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({

});