import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import { registerRootComponent } from 'expo';
import { Alert } from 'react-native';
import App from './App';

// Catch any fatal JS errors during module load or outside React
const defaultErrorHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  if (isFatal) {
    Alert.alert(
      'Fatal JS Error',
      `${error.name}: ${error.message}\n\nPlease take a screenshot of this and send it to support.`,
      [{ text: 'OK' }]
    );
  }
  defaultErrorHandler(error, isFatal);
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
