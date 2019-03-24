import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default class AwardPotModal extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.awardPotContainer}>
        <Text>Game Over!</Text>
        {/* <Svg width={100} height={200}>

        </Svg> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  awardPotContainer: {

  }
});