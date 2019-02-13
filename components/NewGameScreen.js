import React from 'react';
import _ from 'lodash';
import { StyleSheet, Text, TextInput, FlatList, ScrollView, View } from 'react-native';

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

      return {isValid: isValid, errors: formErrors};
    });
  }

  onNumericInputChanged(inputName, newText) {
    this.setState({
      [inputName]: parseInt(newText.replace(/[^0-9]/g, ''))
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

  onAddPlayerClick() {
    let newPlayerId = this.LAST_PLAYER_ID++;
    let newPlayer = {id: newPlayerId, name: `Player ${newPlayerId}`};

    this.setState((prevState) => ({
      players: [...prevState.players, newPlayer]
    }));

    this.validateForm();
  }

  onRemovePlayerClick(playerId) {
    this.setState((prevState) => ({
      players: _.filter(prevState.players, {id: playerId})
    }));

    this.validateForm();
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.mainView}>
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
        <Button
          title='Add Player'
          color='#26a69a'
          onPress={() => this.onAddPlayerClick()}
        ></Button>
        <FlatList
          data={this.state.players}
          renderItem={((player) => this.renderPlayer(player))}
        ></FlatList>
      </View>
    );
  }
  
  renderPlayer(player) {
    return (
      <View style={styles.playerView}>
        
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainView: {
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
  playerListView: {

  },
  playerView: {

  }
});
