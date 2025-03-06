export const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-center gap-2">
      <div className="text-purple-600 dark:text-purple-400">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );

  