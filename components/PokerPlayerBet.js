import React from 'react';
import { StyleSheet } from 'react-native';
import Svg from 'react-native-svg';

const { Text, Image } = Svg;

export default class PokerPlayerBet extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {playerXPos, playerYPos, offset, width, height, isOnLeftSide, player} = this.props;
    let x, y;

    let bet = 1; //player.betThisRound;
    let pctOfChipsBet = 100; // bet / (player.chips + bet);

    if (player.hasFolded || true) {
      x = (isOnLeftSide ? playerXPos + offset : playerXPos - offset);
      y = (playerYPos);

      return (
        <Text
          x={x}
          y={y}
          fill="#ffda0c"
          fontSize={10}
          fontWeight="bold"
          textAnchor={isOnLeftSide ? 'start' : 'end'}
        >
          Folded
        </Text>
      );
    }

    x = (isOnLeftSide ? playerXPos + offset : playerXPos - offset - width);
    y = (playerYPos - (height / 2));

    return (
      <React.Fragment>
        {pctOfChipsBet <= 0 ? null :
          <Image
            x={x}
            y={y}
            width={width}
            height={width}
            href={require('../assets/chips.png')}
          />
        }
        {pctOfChipsBet < 33 ? null :
          <Image
            x={x}
            y={y + 5}
            width={width}
            height={width}
            href={require('../assets/chips.png')}
          />
        }
        {pctOfChipsBet < 66 ? null :
          <Image
            x={x}
            y={y + 10}
            width={width}
            height={width}
            href={require('../assets/chips.png')}
          />
        }

      </React.Fragment>
    )
  }
}

const styles = StyleSheet.create({

});