import React from 'react';
import { StyleSheet } from 'react-native';
import Svg from 'react-native-svg';

const { Circle, G, Text, LinearGradient, Stop } = Svg;

const AVATAR_FILL_GRADIENT_ID = 'avatar_fill_gradient_id';

function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

function formatChipsText(chips) {
  if (chips > 10E9) {
    return `$${round(chips / 10E9, 1)}B`;
  } else if (chips > 10E6) {
    return `$${round(chips / 10E6, 1)}M`;
  } else if (chips > 10E3) {
    return `$${round(chips / 10E3, 1)}k`;
  } else {
    return `$${round(chips, 1)}`;
  }
}

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
    const { x, y, radius, player } = this.props;
    const fontSizePlayerName = 18;
    const chipCountFontSize = 8;

    return (
      <G>
        <Circle
          cx={x}
          cy={y}
          r={radius}
          fill={`url(#${AVATAR_FILL_GRADIENT_ID})`}
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