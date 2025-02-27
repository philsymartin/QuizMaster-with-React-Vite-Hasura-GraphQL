import { motion } from 'framer-motion';

interface AuthCardProps {
  title: string;
  children: React.ReactNode;
}

const AuthCard = ({ title, children }: AuthCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-500 
                     dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
          {title}
        </h2>
        {children}
      </div>
    </motion.div>
  );
};

export default AuthCard;
