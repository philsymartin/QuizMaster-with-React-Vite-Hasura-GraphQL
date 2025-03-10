import { FilterState, FilterOptions } from '@containers/pages/public/QuizzesContainer';

export const FilterPanel = ({
    filters, filterOptions, onDifficultyChange, onTimeRangeChange, onTopicChange, onSelectAllTopics, onClearAllTopics
}: {
    filters: FilterState;
    filterOptions: FilterOptions;
    onDifficultyChange: (value: FilterState['difficulty']) => void;
    onTimeRangeChange: (type: 'min' | 'max', value: number) => void;
    onTopicChange: (topic: string, checked: boolean) => void;
    onSelectAllTopics: () => void;
    onClearAllTopics: () => void;
}) => {
    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Difficulty Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Difficulty
                    </label>
                    <select
                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2"
                        value={filters.difficulty}
                        onChange={(e) => onDifficultyChange(e.target.value as FilterState['difficulty'])}
                    >
                        <option value="all">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>

                {/* Time Range Filter with Slider */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Time Range: {filters.timeRange.min} - {filters.timeRange.max} minutes
                    </label>
                    <div className="px-2 pt-1">
                        <input
                            type="range"
                            min={filterOptions.minTime}
                            max={filterOptions.maxTime}
                            value={filters.timeRange.min}
                            onChange={(e) => onTimeRangeChange('min', Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mb-4" />
                        <input
                            type="range"
                            min={filterOptions.minTime}
                            max={filterOptions.maxTime}
                            value={filters.timeRange.max}
                            onChange={(e) => onTimeRangeChange('max', Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 px-1">
                        <span>{filterOptions.minTime} min</span>
                        <span>{filterOptions.maxTime} min</span>
                    </div>
                </div>

                {/* Topics Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Topics ({filters.selectedTopics.length} selected)
                    </label>
                    <div className="space-y-2">
                        {/* Selected Topics Pills */}
                        {filters.selectedTopics.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {filters.selectedTopics.map((topic) => (
                                    <span
                                        key={topic}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                   bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
                                    >
                                        {topic}
                                        <button
                                            onClick={() => onTopicChange(topic, false)}
                                            className="ml-2 hover:text-purple-800 dark:hover:text-purple-200"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Topics Checkbox List */}
                        <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 
                rounded-lg bg-white dark:bg-gray-800 p-2">
                            {filterOptions.topics.map((topic) => (
                                <label
                                    key={topic}
                                    className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 
                 rounded cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.selectedTopics.includes(topic)}
                                        onChange={(e) => onTopicChange(topic, e.target.checked)}
                                        className="w-4 h-4 text-purple-600 rounded border-gray-300 
                   focus:ring-purple-500 dark:border-gray-600 
                   dark:focus:ring-purple-600"/>
                                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                                        {topic}
                                    </span>
                                </label>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={onSelectAllTopics}
                                className="text-sm text-purple-600 dark:text-purple-400 
               hover:text-purple-800 dark:hover:text-purple-200"
                            >
                                Select All
                            </button>
                            <button
                                onClick={onClearAllTopics}
                                className="text-sm text-purple-600 dark:text-purple-400 
               hover:text-purple-800 dark:hover:text-purple-200"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
