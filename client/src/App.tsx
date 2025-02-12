import React, { useEffect } from 'react';
import { checkAuthStatus } from './redux/auth/authSlice';
import { store } from './redux/store';
import RoutesComponent from './routes/Routes';
import './components/styles/App.css';

const App: React.FC = () => {
  useEffect(() => {
    store.dispatch(checkAuthStatus());

    const checkTokenInterval = setInterval(() => {
      store.dispatch({ type: 'CHECK_TOKEN_EXPIRATION' });
    }, 300000); // 5 minutes

    return () => clearInterval(checkTokenInterval);
  }, []);

  return (
    <>
      <RoutesComponent />
    </>
  );
};

export default App;
