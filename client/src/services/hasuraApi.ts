import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HASURA_ENDPOINT,
  credentials: 'include',
});

const authLink = setContext((_, { headers }) => {

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
  };

  const hasuraAdminSecret = getCookie('hasura_admin_secret');
  const authHeaders: Record<string, string> = {
    ...headers
  };

  if (hasuraAdminSecret) {
    authHeaders['x-hasura-admin-secret'] = hasuraAdminSecret;
  }

  return {
    headers: authHeaders
  };
});

export const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export default client;