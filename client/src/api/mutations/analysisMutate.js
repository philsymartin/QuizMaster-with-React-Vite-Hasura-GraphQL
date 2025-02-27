import { gql } from '@apollo/client';

// Mutation to insert extracted keywords
export const INSERT_FEEDBACK_KEYWORD = gql`
mutation InsertFeedbackKeyword($objects: [feedback_keywords_insert_input!]!) {
  insert_feedback_keywords(
    objects: $objects
    on_conflict: {
      constraint: feedback_keywords_pkey
      update_columns: []
    }
  ) {
    affected_rows
    returning {
      keyword_id
      keyword
    }
  }
}
`;

// Mutation to create keyword-feedback mappings
export const INSERT_FEEDBACK_KEYWORD_MAPPING = gql`
mutation InsertFeedbackKeywordMapping($objects: [feedback_keyword_mapping_insert_input!]!) {
  insert_feedback_keyword_mapping(
    objects: $objects
    on_conflict: {constraint: feedback_keyword_mapping_pkey, update_columns: []}
  ) {
    affected_rows
    returning {
      feedback_keyword_id
      feedback_id
      keyword_id
      __typename
    }
  }
}

`;

// Mutation to update feedback with extraction timestamp
export const UPDATE_FEEDBACK_KEYWORD_EXTRACTED = gql`
mutation UpdateFeedbackKeywordExtracted($feedback_ids: [Int!], $timestamp: timestamptz) {
  update_quiz_feedback(
    where: { feedback_id: { _in: $feedback_ids } },
    _set: { keyword_extracted_at: $timestamp }
  ) {
    affected_rows
  }
}
`;