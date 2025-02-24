import { KeywordAnalysis } from "../../services/sentiment";

interface Props {
    analysis: KeywordAnalysis;
    onKeywordClick?: (keyword: string) => void;
}

const KeywordCloud: React.FC<Props> = ({ analysis, onKeywordClick }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">
                Common Keywords ({analysis.totalFeedback} reviews analyzed)
            </h3>

            <div className="flex flex-wrap gap-2">
                {analysis.keywords.map(({ keyword, count, averageSentiment }) => (
                    <button
                        key={keyword}
                        onClick={() => onKeywordClick?.(keyword)}
                        className={`px-3 py-1 rounded-full text-sm font-medium 
                            ${averageSentiment === null ? 'bg-gray-100 text-gray-700' :
                                averageSentiment > 0.6 ? 'bg-green-100 text-green-700' :
                                    averageSentiment < 0.4 ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'} 
                            hover:opacity-80 transition-opacity`}
                    >
                        {keyword} ({count})
                    </button>
                ))}
            </div>
        </div>
    );
};

export default KeywordCloud;