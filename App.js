import { createStackNavigator, createAppContainer } from 'react-navigation';

// components
import HomeScreen from './components/HomeScreen';
import NewGameScreen from './components/NewGameScreen';
import GameScreen from './components/GameScreen';

const MainNavigator = createStackNavigator({
  Home: {screen: HomeScreen},
  NewGameScreen: {screen: NewGameScreen},
  GameScreen: {screen: GameScreen},
});

const App = createAppContainer(MainNavigator);

export default App;