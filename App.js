import { createStackNavigator, createAppContainer } from 'react-navigation';

// components
import NewGameScreen from './components/NewGameScreen';

const MainNavigator = createStackNavigator({
  Home: {screen: NewGameScreen}
});

const App = createAppContainer(MainNavigator);

export default App;