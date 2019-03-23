import React from 'react';
import { StyleSheet } from 'react-native';
import Svg from 'react-native-svg';

import { RoundsOfAHandOrdered, labelForRoundsOfHand } from '../models/PokerGame';

const { Text, Image } = Svg;

// aspect ratio is ~.6 between width/height
const POKER_CARD_IMG_WIDTH = 18;
const POKER_CARD_IMG_HEIGHT = 30;

export default class PokerCards extends React.Component {
  constructor(props) {
    super(props);
  }

  renderCard(xOffset, yOffset) {
    const { x, y } = this.props;

    const width = POKER_CARD_IMG_WIDTH;
    const height = POKER_CARD_IMG_HEIGHT;

    let xPos = x + xOffset;
    let yPos = y + yOffset;

    return (
      <Image
        x={xPos}
        y={yPos}
        width={width}
        height={height}
        href={require('../assets/card.png')}
      />
    )
  }

  renderDeck(xOffset = 0, yOffset = 0) {
    return (
      <React.Fragment>
        {this.renderCard(xOffset, yOffset)}
        {this.renderCard(xOffset + (1 * .5), yOffset - 1)}
        {this.renderCard(xOffset + (2 * .5), yOffset - 2)}
        {this.renderCard(xOffset + (3 * .5), yOffset - 3)}
        {this.renderCard(xOffset + (4 * .5), yOffset - 4)}
      </React.Fragment>
    );
  }

  renderRoundName(xOffset = 0, yOffset = 0) {
    const { x, y, pokerGame } = this.props;

    let xPos = x + xOffset;
    let yPos = y + yOffset;

    return (
      <Text
        x={xPos}
        y={yPos}
        fill="white"
        fontSize={8}
        fontWeight="bold"
        textAnchor='middle'
      >
        {pokerGame.round ? labelForRoundsOfHand(pokerGame.round) : null}
      </Text>
    )
  }

  render() {
    const { pokerGame } = this.props;
    const padding = 5;

    let roundNumber = RoundsOfAHandOrdered.indexOf(pokerGame.round);

    return (
      <React.Fragment>
        {this.renderDeck((POKER_CARD_IMG_WIDTH / -2) - (2 * POKER_CARD_IMG_WIDTH) - (2 * padding), -1 * POKER_CARD_IMG_HEIGHT)}
        {this.renderCard((POKER_CARD_IMG_WIDTH / -2) - (1 * POKER_CARD_IMG_WIDTH) - (1 * padding), -1 * POKER_CARD_IMG_HEIGHT)}

        {roundNumber > 0 ? // FLOP
          <React.Fragment>
            {this.renderCard((POKER_CARD_IMG_WIDTH / -2) - (2 * POKER_CARD_IMG_WIDTH) - (2 * padding), 0)}
            {this.renderCard((POKER_CARD_IMG_WIDTH / -2) - (1 * POKER_CARD_IMG_WIDTH) - (1 * padding), 0)}
            {this.renderCard((POKER_CARD_IMG_WIDTH / -2) - (0 * POKER_CARD_IMG_WIDTH) - (0 * padding), 0)}
          </React.Fragment>
        : null}
        {roundNumber > 1 ? // TURN
          this.renderCard((POKER_CARD_IMG_WIDTH / -2) + (1 * POKER_CARD_IMG_WIDTH) + (1 * padding), 0)
        : null}
        {roundNumber > 2 ? // RIVER
          this.renderCard((POKER_CARD_IMG_WIDTH / -2) + (2 * POKER_CARD_IMG_WIDTH) + (2 * padding), 0)
        : null}

        {this.renderRoundName(0, POKER_CARD_IMG_HEIGHT + 20)}
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({

});