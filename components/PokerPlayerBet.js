import React from 'react';
import { StyleSheet } from 'react-native';
import Svg from 'react-native-svg';

import { formatChipsText } from '../utils/utils'

const { Text, Image } = Svg;

const POKER_PLAYER_CHIP_IMG_SIZE = 30;

export default class PokerPlayerBet extends React.Component {
  constructor(props) {
    super(props);
  }

  renderHasFolded() {
    const {playerXPos, playerYPos, offset, isOnLeftSide} = this.props;
    const width = height = POKER_PLAYER_CHIP_IMG_SIZE;
    
    let imgX = (isOnLeftSide ? playerXPos + offset : playerXPos - offset - width);
    let imgY = (playerYPos - (height / 2));
    
    return (
      <Image
        x={imgX}
        y={imgY}
        width={width}
        height={height}
        href={require('../assets/folded.png')}
      />
    );
  }

  renderBet() {
    const {playerXPos, playerYPos, offset, isOnLeftSide, player} = this.props;
    const width = height = POKER_PLAYER_CHIP_IMG_SIZE;
    
    let imgX = (isOnLeftSide ? playerXPos + offset : playerXPos - offset - width);
    let imgY = (playerYPos - (height / 2));

    let textX = imgX + (width / 2);
    let textY = imgY + height + 5;
    
    return (
      <React.Fragment>
        <Image
          x={imgX}
          y={imgY}
          width={width}
          height={height}
          href={require('../assets/chips.png')}
        />
        <Text
          x={textX}
          y={textY}
          fill="white"
          fontSize={8}
          fontWeight="bold"
          textAnchor='middle'
        >
          {formatChipsText(player.betThisRound)}
        </Text>
      </React.Fragment>
    );
  }

  render() {
    const {player} = this.props;

    if (player.hasFolded) {
      return this.renderHasFolded();
    } else if (player.betThisRound > 0) {
      return this.renderBet();
    } else {
      return (null);
    }
  }
}

const styles = StyleSheet.create({

});