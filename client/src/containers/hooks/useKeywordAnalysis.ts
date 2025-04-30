import { ApolloQueryResult, useMutation } from "@apollo/client";
import {
  INSERT_FEEDBACK_KEYWORD,
  INSERT_FEEDBACK_KEYWORD_MAPPING,
  UPDATE_FEEDBACK_KEYWORD_EXTRACTED,
} from "@mutations/analysisMutate";
import {
  UnprocessedFeedback,
  UnprocessedFeedbackData,
} from "@pages/admin/AdminAnalyticsPage/types";
import { analyzeKeywords, FeedbackItem } from "@services/sentiment";

export const useKeywordAnalysis = (
  refetchAnalytics: () => void,
  refetchUnprocessed: () => Promise<ApolloQueryResult<UnprocessedFeedbackData>>,
) => {
  const [insertKeywords] = useMutation(INSERT_FEEDBACK_KEYWORD);
  const [insertKeywordMappings] = useMutation(INSERT_FEEDBACK_KEYWORD_MAPPING);
  const [updateFeedbackExtracted] = useMutation(
    UPDATE_FEEDBACK_KEYWORD_EXTRACTED,
  );

  const onAnalyzeClick = async (setIsAnalyzing: (value: boolean) => void) => {
    try {
      setIsAnalyzing(true);

      // 1. Fetch unprocessed feedback
      const { data } = await refetchUnprocessed();
      const unprocessedFeedback: UnprocessedFeedback[] =
        data?.quiz_feedback || [];

      if (unprocessedFeedback.length === 0) {
        console.log("No unprocessed feedback found");
        setIsAnalyzing(false);
        return;
      }

      // 2. Prepare feedback items for keyword analysis
      const feedbackItems: FeedbackItem[] = unprocessedFeedback.map((item) => ({
        feedback_id: item.feedback_id,
        text: item.feedback_text,
      }));

      // 3. Analyze keywords using the service
      const analysisResult = await analyzeKeywords(feedbackItems);
      console.log("Analysis result:", analysisResult);

      // 4. Early return if no feedback items have keywords
      if (
        !analysisResult.feedbackKeywords ||
        analysisResult.feedbackKeywords.length === 0
      ) {
        console.log("No feedback items with keywords found");
        setIsAnalyzing(false);
        return;
      }

      // 5. First, insert all keywords into feedback_keywords table
      // Collect unique keywords to insert while preserving case
      const uniqueKeywords = new Set<string>();
      analysisResult.feedbackKeywords.forEach((item) => {
        item.keywords.forEach((keyword) => {
          uniqueKeywords.add(keyword.toLowerCase().trim());
        });
      });

      // Early return if no keywords were found at all
      if (uniqueKeywords.size === 0) {
        console.log("No keywords found in any feedback");
        setIsAnalyzing(false);
        return;
      }

      // 6. Prepare keyword objects for insertion
      const keywordObjects = Array.from(uniqueKeywords).map((keyword) => ({
        keyword: keyword,
      }));

      // 7. Insert keywords
      const keywordResult = await insertKeywords({
        variables: {
          objects: keywordObjects,
        },
      });
      console.log("Keyword insertion result:", keywordResult);

      // 8. Create a map from keyword text to keyword_id
      const keywordMap = new Map();
      if (keywordResult?.data?.insert_feedback_keywords?.returning) {
        keywordResult.data.insert_feedback_keywords.returning.forEach(
          (k: { keyword_id: number; keyword: string }) => {
            keywordMap.set(k.keyword.toLowerCase().trim(), k.keyword_id);
          },
        );
      }

      // 9. Prepare mappings between feedback and keywords
      const mappings = [];
      for (const feedbackItem of analysisResult.feedbackKeywords) {
        // for each keyword in this feedback
        for (const keyword of feedbackItem.keywords) {
          const lowercaseKeyword = keyword.toLowerCase().trim();
          const keywordId = keywordMap.get(lowercaseKeyword);

          if (keywordId) {
            mappings.push({
              feedback_id: feedbackItem.feedback_id,
              keyword_id: keywordId,
            });
          } else {
            console.log(`Keyword ID not found for "${keyword}"`);
          }
        }
      }

      // 10. Insert mappings - one per feedback-keyword relationship
      if (mappings.length > 0) {
        const mappingResult = await insertKeywordMappings({
          variables: {
            objects: mappings,
          },
        });
        console.log("Mapping insertion result:", mappingResult);
      }

      // 11. Update feedback to mark as processed
      await updateFeedbackExtracted({
        variables: {
          feedback_ids: feedbackItems.map((f) => f.feedback_id),
          timestamp: new Date().toISOString(),
        },
      });

      // 12. Refetch analytics to show updated data
      await refetchAnalytics();
    } catch (error) {
      console.error("Error during keyword analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { onAnalyzeClick };
};
