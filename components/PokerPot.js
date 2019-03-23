import React from 'react';
import { StyleSheet } from 'react-native';
import Svg from 'react-native-svg';

import { formatChipsText } from '../utils/utils'

const { G, Image, Text } = Svg;

export default class PokerPot extends React.Component {
  constructor(props) {
    super(props);
  }

  renderChipsImg(xOffset = 0, yOffset = 0) {
    const { x, y, width, height } = this.props;
    let xPos = x - (width / 2) + xOffset;
    let yPos = y + (-1 * height / 2) + yOffset;

    return (
      <Image
        x={xPos}
        y={yPos}
        width={width}
        height={height}
        href={require('../assets/chips.png')}
      />
    )
  }

  renderSidePotText(xOffset = 0, yOffset = 0) {
    const { x, y } = this.props;

    let xPos = x + xOffset;
    let yPos = y + yOffset;

    return (
      <Text 
        x={xPos}
        y={yPos}
        fill="white"
        fontSize={8}
        fontWeight="bold"
        textAnchor="middle"
      >
        (Side Pot)
      </Text>
    );
  }

  renderChipsText(xOffset = 0, yOffset = 0) {
    const { x, y, pot } = this.props;

    let xPos = x + xOffset;
    let yPos = y + yOffset;

    return (
      <Text 
        x={xPos}
        y={yPos}
        fill="white"
        fontSize={8}
        fontWeight="bold"
        textAnchor="middle"
      >
        {formatChipsText(pot.chips)}
      </Text>
    )
  }

  render() {
    const { pokerGame, pot } = this.props;

    let isSidePot = (pokerGame.pots[0] !== pot);

    return (
      <G>
        {isSidePot ? this.renderSidePotText(0, -25) : null}
        {this.renderChipsImg(0, -10)}
        {this.renderChipsImg(0, -5)}
        {this.renderChipsImg(0, 0)}
        {this.renderChipsImg(0, 5)}
        {this.renderChipsText(0, 25)}
      </G>
    );
  }
}

const styles = StyleSheet.create({

});