import React from 'react';
import { StyleSheet } from 'react-native';
import Svg from 'react-native-svg';

const { Rect, LinearGradient, Stop } = Svg;

const TABLE_FILL_GRADIENT_ID = 'table_fill_gradient_id';

export default class PokerTable extends React.Component {
  constructor(props) {
    super(props);
  }

  static renderDefs() {
    return (
      <LinearGradient id={TABLE_FILL_GRADIENT_ID}  x1="0" y1="0" x2="100%" y2="100%">
        <Stop offset="0" stopColor="rgb(48, 116, 30)" stopOpacity="1"/>
        <Stop offset="100" stopColor="rgb(12, 42, 4)" stopOpacity="1"/>
      </LinearGradient>
    );
  }

  render() {    
    const {x, y, width, height, borderRadius} = this.props;

    return (
      <Rect 
        x={x}
        y={y}
        width={width}
        height={height}
        rx={borderRadius}
        ry={borderRadius}
        fill={`url(#${TABLE_FILL_GRADIENT_ID})`}
      ></Rect>
    );
  }
}

const styles = StyleSheet.create({

});