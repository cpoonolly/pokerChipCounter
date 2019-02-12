import React from 'react';
import { StyleSheet, Text, TextInput, ScrollView, View} from 'react-native';

export default class NewGameScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      players: [],
      chipsPerPlayer: '100',
      bigBlind: '10',
      smallBlind: '5'
    };
  }

  onNumericInputChanged(inputName, newText) {
    this.setState({[inputName]: newText.replace(/[^0-9]/g, '')});
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.containerMain}>
        {this.renderNumericInput('chipsPerPlayer', 'Chips Per Player:')}
        {this.renderNumericInput('bigBlind', 'Big Blind:')}
        {this.renderNumericInput('smallBlind', 'Small Blind:')}
      </ScrollView>
    );
  }

  renderNumericInput(inputName, inputLabel) {
    return (
      <View style={styles.numericInputView}>
        <Text style={styles.numericInputLabel}>
          {inputLabel}
        </Text>
        <TextInput
          style={styles.numericInputInput}
          keyboardType='numeric'
          value={this.state[inputName]}
          onChangeText={(newText) => this.onNumericInputChanged(inputName, newText)}
        ></TextInput>
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
  },
  numericInputView: {
    height: 50,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  numericInputLabel: {
    marginRight: 20,
    fontSize: 28,
  },
  numericInputInput: {
    fontSize: 28
  },
});
