import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ApolloProvider } from '@apollo/client';
import { store, persistor } from '@redux/store';
import { client } from '@services/hasuraApi';
import { ThemeProvider } from '@utils/ThemeProvider';
import LoadingSpinner from '@utils/LoadingSpinner';

interface ProvidersProps {
    children: ReactNode;
}
const Providers: React.FC<ProvidersProps> = ({ children }) => {
    return (
        <Provider store={store}>
            <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
                <ApolloProvider client={client}>
                    <ThemeProvider>
                        {children}
                    </ThemeProvider>
                </ApolloProvider>
            </PersistGate>
        </Provider>
    );
};

export default Providers;
