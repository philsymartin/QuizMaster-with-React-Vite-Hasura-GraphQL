const SkeletonRow = () => (
    <tr>
        <td className="px-6 py-4">
            <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="ml-4 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-4 w-28 mb-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
            <div className="flex items-center justify-end space-x-2">
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        </td>
    </tr>
);

export default SkeletonRow;