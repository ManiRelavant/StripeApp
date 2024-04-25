/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {Component} from 'react';
import {
  StripeTerminalProvider,
  withStripeTerminal,
} from '@stripe/stripe-terminal-react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import StripeApp from './stripe_app';

const Stack = createNativeStackNavigator();

export class App extends Component {
  //Fetch token provide
  fetchTokenProvider = async () => {
    const requestOptionsValue = {
      method: 'POST',
      redirect: 'follow',
    };
    //Replace the URL to use your server url must to return the connection token.
    const responseValue = await fetch('', requestOptionsValue);
    const dataValue = await responseValue.json();
    const jsonString = dataValue.data.stripe_connection_token;
    const {secret} = JSON.parse(jsonString);
    return secret;
  };
  render() {
    return (
      <StripeTerminalProvider
        logLevel="verbose"
        tokenProvider={this.fetchTokenProvider}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={StripeApp} />
          </Stack.Navigator>
        </NavigationContainer>
      </StripeTerminalProvider>
    );
  }
}

export default withStripeTerminal(App);
