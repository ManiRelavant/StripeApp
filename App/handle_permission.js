import {requestNeededAndroidPermissions} from '@stripe/stripe-terminal-react-native';
import {Platform} from 'react-native';

export const HandlePermission = async () => {
  async function handlePermissions() {
    try {
      const {error} = await requestNeededAndroidPermissions({
        accessFineLocation: {
          title: 'Location Permission',
          message: 'Stripe Terminal needs access to your location',
          buttonPositive: 'Accept',
        },
      });
      if (error) {
        throw 'Location and BT services are required in order to connect to a reader.';
      } else {
        return 'success';
      }
    } catch (e) {
      throw 'Please try again later.';
    }
  }
  return Platform.OS === 'android' ? await handlePermissions() : 'success';
};
