import React from 'react';
import { StyleSheet, Text, View} from 'react-native';

export default class NewGameScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.containerMain}>
        <Text>Let's Create a New Game!</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerMain: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50
  }
});
