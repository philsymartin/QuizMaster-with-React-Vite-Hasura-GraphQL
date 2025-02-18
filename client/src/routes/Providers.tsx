import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ApolloProvider } from '@apollo/client';
import { store, persistor } from '../redux/store';
import { client } from '../services/hasuraApi';
import { ThemeProvider } from '../components/utils/ThemeProvider';
import LoadingSpinner from '../components/utils/LoadingSpinner';

interface ProvidersProps {
    children: ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
    const queryClient = new QueryClient();

    return (
        <Provider store={store}>
            <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
                <ApolloProvider client={client}>
                    <QueryClientProvider client={queryClient}>
                        <ThemeProvider>
                            {children}
                        </ThemeProvider>
                    </QueryClientProvider>
                </ApolloProvider>
            </PersistGate>
        </Provider>
    );
};

export default Providers;
