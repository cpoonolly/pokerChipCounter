import React from 'react';
import { StyleSheet } from 'react-native';
import Svg from 'react-native-svg';

const { Rect, Defs, LinearGradient, Stop } = Svg;

export default class PokerTable extends React.Component {
  constructor(props) {
    super(props);

    this.gradientGreenId = `${this.props.id}_gradient_green`;
  }

  render() {
    const { width, height } = this.props;
    const paddingWidth = 100, paddingHeight = 100;
    const tableCornerRounding = 50;

    console.log(`width=${width}\theight=${height}`);

    return (
      <React.Fragment>
        <Defs>
          <LinearGradient id={this.gradientGreenId}  x1="0" y1="0" x2="100%" y2="100%">
            <Stop offset="0" stopColor="rgb(48, 116, 30)" stopOpacity="1"/>
            <Stop offset="100" stopColor="rgb(12, 42, 4)" stopOpacity="1"/>
          </LinearGradient>
        </Defs>
        <Rect 
          x={paddingWidth / 2}
          y={paddingHeight / 2}
          width={width - paddingWidth}
          height={height - paddingHeight}
          rx={tableCornerRounding}
          ry={tableCornerRounding}
          fill={`url(#${this.gradientGreenId})`}
        ></Rect>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({

});