import { gql } from '@apollo/client';
export const CREATE_USER = gql`
  mutation CreateUser($username: String!, $email: String!, $password: String!, $role: String!) {
    insert_users(objects: {username: $username, email: $email, password: $password, role: $role}) {
      returning {
        user_id
        username
        email
        role
        status
        created_at
        last_active
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($user_id: Int!, $username: String, $email: String, $role: String, $status: String) {
    update_users(where: {user_id: {_eq: $user_id}}, _set: {username: $username, email: $email, role: $role, status: $status}) {
      returning {
        user_id
        username
        email
        role
        status
        created_at
        last_active
      }
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($user_id: Int!) {
    delete_users(where: {user_id: {_eq: $user_id}}) {
      affected_rows
    }
  }
`;
export const UPDATE_USER_STATUS = gql`
  mutation UpdateUserStatus($user_id: Int!, $status: String!) {
    update_users_by_pk(
      pk_columns: { user_id: $user_id },
      _set: { 
        status: $status,
      }
    ) {
      user_id
      status
    }
  }
`;

