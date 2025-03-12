import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { FiRefreshCw } from "react-icons/fi";
import {
  BarChartHorizontalIcon,
  getSentimentColorbg,
} from "@config/styleConstants";
import {
  GET_KEYWORD_ANALYTICS,
  GET_UNPROCESSED_FEEDBACK,
} from "@queries/analytics";
import { useKeywordAnalysis } from "@containers/hooks/useKeywordAnalysis";
import {
  KeywordAnalyticsData,
  KeywordData,
  ProcessedKeywordData,
  UnprocessedFeedbackData,
} from "@pages/admin/AdminAnalyticsPage/types";

interface KeywordAnalyticsProps {
  quizId?: number;
}

const FeedbackKeywords: React.FC<KeywordAnalyticsProps> = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedbackKeywords, setFeedbackKeywords] = useState<
    ProcessedKeywordData[]
  >([]);
  const { loading: analyticsLoading, refetch: refetchAnalytics } =
    useQuery<KeywordAnalyticsData>(GET_KEYWORD_ANALYTICS, {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        if (data?.feedback_keywords) {
          processKeywordData(data.feedback_keywords);
        }
      },
    });

  const { refetch: refetchUnprocessed } = useQuery<UnprocessedFeedbackData>(
    GET_UNPROCESSED_FEEDBACK,
    {
      fetchPolicy: "network-only",
      skip: true, // we will only run this when needed
    },
  );
  const { onAnalyzeClick } = useKeywordAnalysis(
    refetchAnalytics,
    refetchUnprocessed,
  );
  const processKeywordData = (keywords: KeywordData[]) => {
    const processedData: ProcessedKeywordData[] = keywords.map((keyword) => {
      const quizMap = new Map<
        number,
        {
          title: string;
          instances: Array<{
            sentiment: "positive" | "negative" | "neutral";
            score: number;
          }>;
        }
      >();

      let totalSentimentScore = 0;
      let totalInstances = 0;

      // Process each feedback instance where this keyword appears
      keyword.feedback_keyword_mappings.forEach((mapping) => {
        const feedback = mapping.quiz_feedback;
        const quizId = feedback.quiz.quiz_id;
        const sentimentCategory: "positive" | "negative" | "neutral" =
          feedback.sentiment_label === "POSITIVE"
            ? "positive"
            : feedback.sentiment_label === "NEGATIVE"
              ? "negative"
              : "neutral";

        totalSentimentScore += feedback.sentiment_score;
        totalInstances++;

        // Add to quiz map
        if (!quizMap.has(quizId)) {
          quizMap.set(quizId, {
            title: feedback.quiz.title,
            instances: [],
          });
        }
        quizMap.get(quizId)?.instances.push({
          sentiment: sentimentCategory,
          score: feedback.sentiment_score,
        });
      });

      const avgSentiment =
        totalInstances > 0 ? totalSentimentScore / totalInstances : 0.5;

      // Determine overall sentiment category
      let overallSentiment: "positive" | "negative" | "neutral" = "neutral";
      if (avgSentiment > 0.65) {
        overallSentiment = "positive";
      } else if (avgSentiment < 0.45) {
        overallSentiment = "negative";
      }

      return {
        text: keyword.keyword,
        value: keyword.feedback_keyword_mappings_aggregate.aggregate.count,
        sentiment: overallSentiment,
        quizzes: quizMap,
      };
    });

    setFeedbackKeywords(processedData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Common Feedback Keywords
        </h2>
        <button
          onClick={() => onAnalyzeClick(setIsAnalyzing)}
          className={`inline-flex items-center px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors ${isAnalyzing ? "cursor-wait" : "cursor-pointer"}`}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <BarChartHorizontalIcon />
          )}
          <span className="ml-2">
            {isAnalyzing ? "Analyzing..." : "Analyze Recent"}
          </span>
        </button>
      </div>

      {analyticsLoading && !isAnalyzing && (
        <div className="flex justify-center py-8">
          <FiRefreshCw className="w-6 h-6 animate-spin text-purple-500" />
        </div>
      )}

      {feedbackKeywords.length > 0 ? (
        <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
          {feedbackKeywords.map((keyword, index) => (
            <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className={`w-2 h-2 rounded-full ${getSentimentColorbg(keyword.sentiment || "neutral")}`}
                ></div>
                <div className="text-md font-medium text-gray-800 dark:text-gray-200 flex-1">
                  {keyword.text}
                </div>
              </div>

              {/* Quiz details */}
              <div className="ml-4 mt-2">
                {Array.from(keyword.quizzes.entries()).map(
                  ([quizId, quizData]) => (
                    <div
                      key={quizId}
                      className="text-sm text-gray-600 dark:text-gray-400 mb-1"
                    >
                      <span className="font-medium">{quizData.title}</span>:
                      <span className="ml-2 flex flex-wrap gap-1 mt-1">
                        {quizData.instances.map((instance, i) => (
                          <span
                            key={i}
                            className={`inline-block w-3 h-3 rounded-full ${getSentimentColorbg(instance.sentiment)}`}
                            title={`Sentiment: ${instance.sentiment}, Score: ${instance.score.toFixed(2)}`}
                          ></span>
                        ))}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
          <p>No keyword data available</p>
          <button
            onClick={() => onAnalyzeClick(setIsAnalyzing)}
            className="mt-3 text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            Run analysis
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackKeywords;
