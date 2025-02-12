interface SettingsTabProps {
    timeLimit: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

const SettingsTab = ({ timeLimit, difficulty }: SettingsTabProps) => {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Time Limit (minutes)
                </label>
                <input
                    type="number"
                    value={timeLimit}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-md bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-gray-100"
                />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Difficulty
                </label>
                <select
                    value={difficulty}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-md bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-gray-100"
                >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>
        </div>
    );
};

export default SettingsTab;
