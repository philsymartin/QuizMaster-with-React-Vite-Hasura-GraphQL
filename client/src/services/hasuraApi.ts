import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HASURA_ENDPOINT,
  credentials: 'include',
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(createClient({
  url: import.meta.env.VITE_HASURA_WS_ENDPOINT ||
    import.meta.env.VITE_HASURA_ENDPOINT.replace('http', 'ws'),
  connectionParams: () => {
    const token = localStorage.getItem('authToken');
    return {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };
  }
}));

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');
  // If no token, return headers as is
  if (!token) {
    return { headers };
  }
  const authHeaders: Record<string, string> = {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return {
    headers: authHeaders
  };
});
// Split links based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  from([authLink, httpLink])
);
export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
  },
});
export default client;





