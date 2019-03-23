import React from 'react';
import { StyleSheet } from 'react-native';
import Svg from 'react-native-svg';

import { formatChipsText } from '../utils/utils'

const { Circle, G, Text, LinearGradient, Stop } = Svg;

const AVATAR_FILL_GRADIENT_ID = 'avatar_fill_gradient_id';

export default class PokerPlayerAvatar extends React.Component {
  constructor(props) {
    super(props);
  }

  static renderDefs() {
    return (
      <LinearGradient id={AVATAR_FILL_GRADIENT_ID}  x1="0" y1="0" x2="100%" y2="100%">
        <Stop offset="0" stopColor="white" stopOpacity="1"/>
        <Stop offset="100" stopColor="#aaaaaa" stopOpacity="1"/>
      </LinearGradient>
    );
  }

  render() {
    const { x, y, radius, player, pokerGame } = this.props;
    const fontSizePlayerName = 14;
    const chipCountFontSize = 8;

    let isCurrentPlayer = (pokerGame.currentPlayer === player);

    return (
      <G>
        <Circle
          cx={x}
          cy={y}
          r={radius}
          fill={`url(#${AVATAR_FILL_GRADIENT_ID})`}
          stroke={isCurrentPlayer ? '#ffda0c' : 'none'}
          strokeWidth={5}
        ></Circle>
        <Text 
          x={x}
          y={y - (1.5 * radius) - (.25 * fontSizePlayerName)}
          fill="#ffda0c"
          fontSize={fontSizePlayerName}
          fontWeight="bold"
          textAnchor="middle"
        >
          {player.name}
        </Text>
        <Text 
          x={x}
          y={y + (0.25 * chipCountFontSize)}
          fill="black"
          fontSize={chipCountFontSize}
          fontWeight="bold"
          textAnchor="middle"
        >
          {formatChipsText(player.chips)}
        </Text>
      </G>
    );
  }
}

const styles = StyleSheet.create({

});