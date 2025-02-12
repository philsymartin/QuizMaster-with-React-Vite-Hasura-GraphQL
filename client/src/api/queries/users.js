import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers {
    users {
      id: user_id
      username
      email
      role
      status
      created_at
      last_active
    }
  }
`;

