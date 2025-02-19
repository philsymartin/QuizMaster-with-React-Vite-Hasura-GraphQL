// import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
// import { setContext } from '@apollo/client/link/context';

// const httpLink = createHttpLink({
//   uri: import.meta.env.VITE_HASURA_ENDPOINT,
//   credentials: 'include',
// });

// const authLink = setContext((_, { headers }) => {
//   const getCookie = (name: string) => {
//     const value = `${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop()?.split(';').shift();
//     return undefined;
//   };

//   const hasuraAdminSecret = getCookie('hasura_admin_secret');
//   const token = localStorage.getItem('authToken');
//   const user = localStorage.getItem('user');

//   let role = 'guest';
//   let userId = 0;

//   if (user) {
//     try {
//       const userData = JSON.parse(user);
//       role = userData.role || 'user';
//       userId = Number(userData.user_id);
//     } catch (e) {
//       console.error('Error parsing user data:', e);
//     }
//   }

//   const authHeaders: Record<string, string> = {
//     ...headers,
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     'x-hasura-role': role,
//     'x-hasura-user-id': userId.toString(),
//   };

//   if (hasuraAdminSecret) {
//     authHeaders['x-hasura-admin-secret'] = hasuraAdminSecret;
//   }

//   return {
//     headers: authHeaders
//   };
// });

// export const client = new ApolloClient({
//   link: from([authLink, httpLink]),
//   cache: new InMemoryCache(),
//   defaultOptions: {
//     watchQuery: {
//       fetchPolicy: 'network-only',
//     },
//   },
// });

// export default client;

import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HASURA_ENDPOINT,
  credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
  const getCookie = (name: string) => {
    const value = `${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
  };

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

export const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
  },
});

export default client;





