import React from 'react';
import { StyleSheet, View, Button, TextInput } from 'react-native';

export default class RaiseModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      raiseBy: 0
    };
  }

  componentDidMount() {
    this.setState({raiseBy: this.getMinBet()});
  }

  getMinBet() {
    const { pokerGame } = this.props;

    return pokerGame.highestBetThisRound - pokerGame.currentPlayer.betThisRound;
  }

  getMaxBet() {
    const { pokerGame } = this.props;

    return pokerGame.currentPlayer.chips;
  }

  onRaiseInputChange(newText) {
    let raiseBy = parseInt(newText.replace(/[^0-9]/g, '')) || 0;
    raiseBy = Math.max(raiseBy, this.getMinBet());
    raiseBy = Math.min(raiseBy, this.getMaxBet());

    this.setState({raiseBy: raiseBy});
  }

  render() {
    return (
      <React.Fragment>
        <TextInput
          style={styles.raiseModalNumericInput}
          value={`${this.state.raiseBy}`}
          onChangeText={(newText) => this.onRaiseInputChange(newText)}
          keyboardType='numeric'
        ></TextInput>
        <View style={styles.raiseModalButtons}>
          <View style={styles.raiseModalButton}>
            <Button
              title="Raise"
              color="#26a69a"
              style={styles.raiseModalButton}
              onPress={() => this.props.onRaise(this.state.raiseBy)}
            ></Button>
          </View>
          <View style={styles.raiseModalButton}>
            <Button
              title="Cancel"
              color="#26a69a"
              style={styles.raiseModalButton}
              onPress={() => this.props.onCancel()}
            ></Button>
          </View>
        </View>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  raiseModalNumericInput: {
    fontSize: 28,
    marginBottom: 10
  },
  raiseModalButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  raiseModalButton: {
    margin: 5,
  }
});