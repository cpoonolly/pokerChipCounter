import React from 'react';
import { StyleSheet } from 'react-native';
import Svg from 'react-native-svg';

const { Circle, LinearGradient, Stop } = Svg;

const AVATAR_FILL_GRADIENT_ID = 'avatar_fill_gradient_id';

export default class PokerPlayerAvatar extends React.Component {
  constructor(props) {
    super(props);
  }

  static renderDefs() {
    return (
      <LinearGradient id={AVATAR_FILL_GRADIENT_ID}  x1="0" y1="0" x2="100%" y2="100%">
        <Stop offset="0" stopColor="#c4c4c4" stopOpacity="1"/>
        <Stop offset="100" stopColor="#aaaaaa" stopOpacity="1"/>
      </LinearGradient>
    );
  }

  render() {
    const { x, y, radius } = this.props;

    return (
      <Circle
        cx={x}
        cy={y}
        r={radius}
        fill={`url(#${AVATAR_FILL_GRADIENT_ID})`}
      ></Circle>
    );
  }
}

const styles = StyleSheet.create({

});