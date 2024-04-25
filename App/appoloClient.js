import {ApolloClient, InMemoryCache, gql} from '@apollo/client';

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};

//Use your URL & X-api-key
const apolloClient = new ApolloClient({
  uri: '',
  headers: {
    'x-api-key': '',
  },
  cache: new InMemoryCache(),
  defaultOptions,
});

export {apolloClient};

export const Mutation_CreatePaymentIntend = gql`
  mutation setupManualPaymentIntent($input: SetupManualPaymentIntentInput!) {
    setupManualPaymentIntent(input: $input) {
      stringOutput {
        value
      }
    }
  }
`;

/*
  We are used GraphQL API to creating paymentIntend from the server side, so, You can use any API Client request
*/
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
