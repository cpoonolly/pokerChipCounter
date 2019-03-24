import React from 'react';
import { StyleSheet, View, Button, TextInput, Text } from 'react-native';

export default class RaiseModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      raiseBy: 0,
      form: {isValid: true, errors: {}}
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

    this.setState({raiseBy: raiseBy});
    this.validateForm();
  }

  validateForm() {
    this.setState((newState) => {
      const raiseBy = newState.raiseBy;
      const maxBet = this.getMaxBet();
      const minBet = this.getMinBet();

      let isValid = true;
      let formErrors = {raiseBy: []};

      if (raiseBy > maxBet) {
        isValid = false;
        formErrors.raiseBy.push(`Maximum Bet: ${maxBet}`);
      } else if (raiseBy < minBet) {
        isValid = false;
        formErrors.raiseBy.push(`Minimum Bet: ${minBet}`);
      }

      return {form: {isValid: isValid, errors: formErrors}};
    });    
  }

  render() {
    const isValid = this.state.form.isValid;
    const formErrors = this.state.form.errors.raiseBy || [];

    return (
      <React.Fragment>
        <TextInput
          style={styles.raiseModalNumericInput}
          value={`${this.state.raiseBy}`}
          onChangeText={(newText) => this.onRaiseInputChange(newText)}
          keyboardType='numeric'
          selectTextOnFocus={true}
        ></TextInput>
        <View style={styles.raiseModalButtons}>
          <View style={styles.raiseModalButton}>
            <Button
              title="Raise"
              color="#26a69a"
              style={styles.raiseModalButton}
              disabled={!isValid}
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
        <View style={styles.raiseModalErrors}>
            {formErrors.map((errorMsg) => (
              <Text key={errorMsg} style={styles.formError}>{errorMsg}</Text>
            ))}
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
  },
  raiseModalErrors: {

  },
  formError: {
    color: 'red'
  }
});