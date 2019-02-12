import { createStackNavigator, createAppContainer } from 'react-navigation';

// components
import HomeScreen from './components/HomeScreen';
import NewGameScreen from './components/NewGameScreen';

const MainNavigator = createStackNavigator({
  Home: {screen: HomeScreen},
  NewGameScreen: {screen: NewGameScreen}
});

const App = createAppContainer(MainNavigator);

export default App;