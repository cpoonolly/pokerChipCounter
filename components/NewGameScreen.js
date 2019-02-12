import React from 'react';
import { Animated, StyleSheet, Text, View, Easing } from 'react-native';

export default class NewGameScreenComponent extends React.Component {
  constructor(props) {
    super(props);

    this.pokerWheelAnimation = new Animated.Value(0);
  }

  componentDidMount() {
    // run poker wheel animation on mount
    this.pokerWheelAnimation.setValue(0);
    Animated.loop(Animated.timing(this.pokerWheelAnimation, {
      toValue: 1,
      duration: 4000,
      easing: Easing.linear,
      useNativeDriver: true
    })).start();
  }

  render() {
    let pokerWheelRotation = this.pokerWheelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });

    return (
      <View style={styles.containerMain}>
        <Animated.Image 
          source={require('../assets/poker-chip.png')} 
          style={{
            width: 200,
            height: 200,
            transform: [
              {rotate: pokerWheelRotation},
              {perspective: 1000}
            ]
          }}
        />
        <Text>Goodbye World</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerMain: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
