import React from 'react';
import { Animated, StyleSheet, Button, View, Easing } from 'react-native';

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);

    this.pokerWheelAnimation = new Animated.Value(0);
  }

  componentDidMount() {
    // start poker wheel animation on mount
    this.pokerWheelAnimation.setValue(0);
    Animated.loop(Animated.timing(this.pokerWheelAnimation, {
      toValue: 1,
      duration: 10000,
      easing: Easing.linear,
      useNativeDriver: true
    })).start();
  }

  onNewGameBtnPress() {
    console.log('New Game!');
    this.props.navigation.navigate('NewGameScreen');
  }

  render() {
    return (
      <View style={styles.containerMain}>
        {this.renderPokerWheel()}
        {this.renderNewGameBtn()}
      </View>
    );
  }

  renderPokerWheel() {
    let pokerWheelRotation = this.pokerWheelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });

    let pokerWheelAnimatedStyle = {
      transform: [
        {rotate: pokerWheelRotation},
        {perspective: 1000}
      ]
    };

    return (
      <Animated.Image 
        source={require('../assets/poker-chip.png')} 
        style={[styles.pokerWheelImg, pokerWheelAnimatedStyle]}
      />
    );
  }

  renderNewGameBtn() {
    return (
      <View style={styles.newGameButton}>
        <Button 
          title="New Game"
          onPress={() => this.onNewGameBtnPress()}
          color="#26a69a"
        ></Button>
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
  },
  pokerWheelImg: {
    width: 200,
    height: 200
  },
  newGameButton: {
    marginTop: 20
  }
});
