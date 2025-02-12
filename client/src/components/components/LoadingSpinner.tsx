import React from 'react';

const LoadingComponent: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
);

export default LoadingComponent;
