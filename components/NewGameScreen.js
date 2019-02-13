import React from 'react';
import _ from 'lodash';
import { StyleSheet, Button, Text, TextInput, ScrollView, View } from 'react-native';

export default class NewGameScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chipsPerPlayer: 100,
      bigBlind: 10,
      smallBlind: 5,
      players: [
        {id: 1, name: 'Player 1'},
        {id: 2, name: 'Player 2'}
      ],
      form: {isValid: true, errors: {}}
    };

    this.LAST_PLAYER_ID = 2;
  }

  validateForm() {
    console.log('validateForm()');
    this.setState((newState) => {
      let isValid = true;
      let formErrors = {
        chipsPerPlayer: [],
        bigBlind: [],
        smallBlind: [],
        players: []
      };

      if (newState.chipsPerPlayer <= 0) {
        formErrors.chipsPerPlayer.push('Chips per player must be greater than 0.');
        isValid = false;
      }

      if (newState.bigBlind > newState.chipsPerPlayer) {
        formErrors.bigBlind.push('Big blind must be less than chips per player.');
        isValid = false;
      }
      
      if (newState.smallBlind > newState.bigBlind) {
        formErrors.smallBlind.push('Small blind must be less than big blind.');
        isValid = false;
      }

      if (newState.players.length < 2) {
        formErrors.players.push('Must be at least 2 players.');
        isValid = false;
      }

      let numUniqPlayerNames = _(newState.players).map('name').uniq().size();
      if (numUniqPlayerNames < newState.players.length) {
        formErrors.players.push('Players must have unique names.');
        isValid = false;
      }

      console.log(`newState.chipsPerPlayer: ${newState.chipsPerPlayer}`);
      console.log(`newState.bigBlind: ${newState.bigBlind}`);
      console.log(`newState.smallBlind: ${newState.smallBlind}`);
      console.log(`newState.players.length: ${newState.players.length}`);
      console.log(`numUniqPlayerNames: ${numUniqPlayerNames}`);

      return {form: {isValid: isValid, errors: formErrors}};
    });
  }

  onNumericInputChanged(inputName, newText) {
    this.setState({
      [inputName]: parseInt(newText.replace(/[^0-9]/g, '')) || 0
    });
    this.validateForm();
  }

  onPlayerNameChange(playerId, newName) {
    this.setState((prevState) => ({
      players: _.map(prevState.players, (player) => {
        return player.id === playerId ? {id: playerId, name: newName} : player;
      })
    }));

    this.validateForm();
  }

  onAddPlayer() {
    let newPlayerId = ++this.LAST_PLAYER_ID;
    let newPlayer = {id: newPlayerId, name: `Player ${newPlayerId}`};

    this.setState((prevState) => ({
      players: [...prevState.players, newPlayer]
    }));

    this.validateForm();
  }

  onRemovePlayer(playerId) {
    this.setState((prevState) => ({
      players: _.reject(prevState.players, {id: playerId})
    }));

    this.validateForm();
  }

  onStartGameClick() {
    console.log('Start Game!');
  }

  render() {
    return (
      <View contentContainerStyle={styles.mainView}>
        <ScrollView>
          {this.renderNumericInput('chipsPerPlayer', 'Chips Per Player:')}
          {this.renderFormErrors('chipsPerPlayer')}

          {this.renderNumericInput('bigBlind', 'Big Blind:')}
          {this.renderFormErrors('bigBlind')}

          {this.renderNumericInput('smallBlind', 'Small Blind:')}
          {this.renderFormErrors('smallBlind')}

          {this.renderPlayerList()}
          {this.renderFormErrors('players')}

          {this.renderStartGameButton()}
          {/* <Text>{JSON.stringify(this.state)}</Text> */}
        </ScrollView>
      </View>
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
          value={`${this.state[inputName]}`}
          onChangeText={(newText) => this.onNumericInputChanged(inputName, newText)}
          keyboardType='numeric'
        ></TextInput>
      </View>
    );
  }

  renderPlayerList() {
    return (
      <View style={styles.playerListView}>
        <View style={styles.addPlayerBtnWrap}>
          <Button
            title='+ Add Player'
            color='#26a69a'
            onPress={() => this.onAddPlayer()}
          ></Button>
        </View>
        {_.map(this.state.players, (player) => (
          <View key={player.id} style={styles.playerView}>
            {this.renderPlayer(player)}
          </View>
        ))}
      </View>
    );
  }
  
  renderPlayer(player) {
    return (
      <View style={styles.playerView}>
        <Button
          title='-'
          color='#78909c'
          onPress={() => this.onRemovePlayer(player.id)}
        ></Button>
        <TextInput 
          style={styles.editPlayerNameInput}
          value={player.name}
          onChangeText={(newText) => this.onPlayerNameChange(player.id, newText)}
        ></TextInput>
      </View>
    );
  }

  renderStartGameButton() {
    return (
      <View style={styles.startGameBtnWrap}>
        <Button
          title='Start Game'
          color='#26a69a'
          disabled={!this.state.form.isValid}
          onPress={() => this.onStartGameClick()}
        ></Button>
      </View>
    );
  }

  renderFormErrors(inputName) {
    const formErrors = this.state.form.errors[inputName] || [];

    if (_.isEmpty(formErrors)) {
      return;
    }

    return (
      <View style={styles.formErrors}>
        {_.map(formErrors, (errorMsg) => (
          <Text key={errorMsg} style={styles.formError}>{errorMsg}</Text>
        ))}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  numericInputView: {
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  numericInputLabel: {
    marginRight: 20,
    fontSize: 28,
  },
  numericInputInput: {
    fontSize: 28,
  },
  playerListView: {
    margin: 20,
  },
  playerView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  addPlayerBtnWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  editPlayerNameInput: {
    fontSize: 20,
    marginLeft: 20,
  },
  startGameBtnWrap: {
    margin: 20,
  },
  formErrors: {
    marginLeft: 20,
  },
  formError: {
    color: 'red'
  }
});
