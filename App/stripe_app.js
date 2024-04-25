import React, {Component} from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {
  CHANGE_CONNECTION_STATUS,
  FINISH_DISCOVERING_READERS,
  UPDATE_DISCOVERED_READERS,
  withStripeTerminal,
} from '@stripe/stripe-terminal-react-native';
import {HandlePermission} from './handle_permission';
import {CreatePaymentIntent} from './appoloClient';

export class StripeApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connectionStatus: '',
      readerList: [],
    };
  }

  /*
    Hanling Emitters and much more informations
  */
  handleListeners() {
    this.handleDiscoverReader();
    this.onReceiveReaders();
    this.onFinishDiscoveringReaders();
    this.handleConnectionStatus();
  }

  /*
    Discover informations
  */
  handleDiscoverReader() {
    this.props.simulateReaderUpdate('none');
    this.props.discoverReaders({
      discoveryMethod: 'localMobile',
      simulated: true,
    });
  }

  /*
    Hanling receiving readers
  */
  onReceiveReaders() {
    const discover = this.props.emitter.addListener(
      UPDATE_DISCOVERED_READERS,
      data => {
        this.setState({...this.state, readerList: data}, () => {
          console.log(data);
          discover.remove();
          this.props.cancelDiscovering();
        });
      },
    );
  }

  /*
    Hanling Finish discover readers
  */
  onFinishDiscoveringReaders() {
    const discover = this.props.emitter.addListener(
      FINISH_DISCOVERING_READERS,
      error => {
        if (
          error?.code === 'AlreadyConnectedToReader' ||
          error?.code === 'INTEGRATION_ERROR.ALREADY_CONNECTED_TO_READER'
        ) {
          // Already connected
          this.setState({...this.state, connectionStatus: error?.code});
        } else if (
          error?.code !== 'Canceled' &&
          error?.code !== 'USER_ERROR.CANCELED' &&
          error
        ) {
          console.log(error);
          Alert.alert('Error', error?.message, [
            {
              text: 'OK',
              onPress: () => {
                return null;
              },
            },
          ]);
        }
        discover.remove();
      },
    );
  }

  /*
    Hanling Reader Connection status
  */
  handleConnectionStatus() {
    this.props.emitter.addListener(CHANGE_CONNECTION_STATUS, status => {
      this.setState(
        {
          ...this.state,
          connectionStatus: status,
        },
        () => {
          console.log(status);
          setTimeout(() => {
            if (status === 'connected') {
              this.props.cancelDiscovering();
            } else if (status === 'notConnected') {
              // Disocnnect
            }
          }, 500);
        },
      );
    });
  }

  /*
    Initialize the SDK
  */
  checkInitialize() {
    /*
      Check permission
    */
    HandlePermission()
      .then(result => {
        if (result === 'success') {
          if (this.props.isInitialized) {
            this.handleListeners();
            return;
          }
          this.props
            .initialize()
            .then(e => {
              this.handleListeners();
            })
            .catch(e => console.log('Error', e));
        }
      })
      .catch(e => {
        Alert.alert('Error', e, [
          {
            text: 'OK',
            onPress: () => {
              return null;
            },
          },
        ]);
      });
  }
  /*
      Connect to the reader
  */
  connectReader(reader) {
    const {error} = this.props.connectLocalMobileReader({
      reader,
      locationId: 'tml_E3CLCQIX5a3c8G',
    });
    if (error) {
      console.log('connectBluetoothReader error', error);
      return;
    }
  }
  /*
      To handle payment
  */
  handlePayment() {
    /* The CreatePaymentIntent function async request & response will get client secret key
          Ex: pi_3P9NqzFy8kPIscdv15eQYDcP_secret_ehJ28gtSSGB6awnRvZiRf3GJA
    */
    this.setState({
      ...this.state,
      connectionStatus: 'Creating paymentIntend...',
    });
    CreatePaymentIntent({
      request: {
        siteId: 14977,
        mobileEventId: 10,
        totalAmount: 10,
        feeAmount: 0,
      },
    })
      .then(clientSecret => {
        /* The retrievePaymentIntent function Stripe SDK request with client secret key & response will get paymentIntend
          Examble response: {
            "amount": 1000,
          "charges": [],
          "created": "1714034429000",
          "currency": "usd",
           "id": "pi_3P9NqzFy8kPIscdv15eQYDcP",
           "metadata": {"billing_amount_flat": "0", "billing_amount_variable": "1000"},
           "offlineDetails": null,
           "paymentMethodId": null,
           "sdkUuid": "4C60AB9B-A8B9-4CC3-945E-B5C2EBD27368",
           "status": "requiresPaymentMethod"
          }
        */
        this.setState({
          ...this.state,
          connectionStatus: 'Retrieving PaymentIntent...',
        });
        this.props
          .retrievePaymentIntent(clientSecret)
          .then(e => {
            console.log('retrievePaymentIntent', e.paymentIntent);
            /* The collectPaymentMethod function Stripe SDK request with Payment intend from the retrievePaymentIntent response & response will get error */
            this.setState({
              ...this.state,
              connectionStatus: 'Collecting PaymentMethod...',
            });
            this.props
              .collectPaymentMethod({
                paymentIntent: e.paymentIntent,
              })
              .then(e => {
                // Here is the error which was shown
                console.log(e);
                this.setState({
                  ...this.state,
                  connectionStatus: e.error.message,
                });
                /* We commented out the confirmPaymentIntent */
                // this.props
                //   .confirmPaymentIntent(e.paymentIntent)
                //   .then(e => {
                //     const {id, paymentMethodId} = e.paymentIntent;
                //     console.log(
                //       'paymentIntend ID ==> ',
                //       id,
                //       'paymentMethod Id ===> ',
                //       paymentMethodId,
                //     );
                //   })
                //   .catch(error => {
                //     console.log('confirmPaymentIntent Error:', error);
                //   });
              })
              .catch(error => {
                console.log('collectPaymentMethod Error:', error);
              });
          })
          .catch(error => {
            console.log('retrievePaymentIntent Error', error);
          });
      })
      .catch(error => {
        console.log('Create paymentIntend Error', error);
      });
  }

  render() {
    return (
      <SafeAreaView style={styles.sectionContainer}>
        {this.props.loading && (
          <ActivityIndicator
            style={{margin: 20}}
            color={'black'}
            size={'small'}
          />
        )}
        <Pressable
          onPress={() => this.checkInitialize()}
          style={styles.tokenContainer}>
          <Text>Initialize</Text>
        </Pressable>
        {this.state.connectionStatus === '' ? null : (
          <Text
            style={
              ([styles.sectionTitle], {marginTop: 20, textAlign: 'center'})
            }>
            {this.state.connectionStatus}
          </Text>
        )}
        {this.state.connectionStatus === 'AlreadyConnectedToReader' ||
        this.state.connectionStatus === 'connected' ? (
          <Pressable
            onPress={() => this.handlePayment()}
            style={styles.tokenContainer}>
            <Text style={styles.sectionTitle}>Make new Payment</Text>
          </Pressable>
        ) : null}
        <FlatList
          data={this.state.readerList}
          renderItem={({item}) => {
            return (
              <Pressable
                onPress={() => this.connectReader(item)}
                style={styles.tokenContainer}>
                <Text style={styles.sectionTitle}>
                  {`device: ${item.serialNumber}`}
                </Text>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 20,
    textAlign: 'center',
  },
  tokenContainer: {
    marginTop: 20,
    width: '80%',
    backgroundColor: 'white',
    height: 50,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
});

export default withStripeTerminal(StripeApp);
