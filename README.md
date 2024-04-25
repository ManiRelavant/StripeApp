# Issue on collect Payment method

>**Note**: While we collecting the payment methods we are facing an issue invalidParameters

```
{"error": {"code": "InvalidRequiredParameter", "message": "A required parameter was invalid or missing."}, "paymentIntent": undefined}
```
### Screen Record

https://github.com/ManiRelavant/StripeApp/assets/117079259/005ee900-9374-48c6-9b23-8d70c8de0a04


### iOS

```bash
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

### Replace Your code

App Folder contain the App.js file fetch function update your server url respectivly 

```bash
const responseValue = await fetch('Your URL', requestOptionsValue);
```

We used the GraphQL URL for creating payment intent from the server side appoloClient.js file 
You can update the the CreatePaymentIntent function to create you own request

```
export const CreatePaymentIntent = intendRequest => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create Mutation request for create paymentIntend
      const {data} = await apolloClient.mutate({
        mutation: Mutation_CreatePaymentIntend,
        variables: {
          input: intendRequest,
        },
      });
      if (data?.setupManualPaymentIntent?.stringOutput?.value) {
        //Return the Client Secret key
        resolve(data.setupManualPaymentIntent.stringOutput?.value);
      } else {
        reject('Failed to create paymentIntend, please try again later');
      }
    } catch (error) {
      reject(error);
    }
  });
};
```
