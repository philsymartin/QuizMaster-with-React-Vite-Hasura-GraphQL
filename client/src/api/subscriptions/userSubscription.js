import { gql } from '@apollo/client';

export const USERS_SUBSCRIPTION = gql`
  subscription UserSubscription {
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