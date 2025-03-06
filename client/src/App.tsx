import { useEffect } from 'react';
import { checkAuthStatus } from '@redux/auth/authSlice';
import { store } from '@redux/store';
import RoutesComponent from '@routes/Routes';
import '@styles/App.css';
import { INTERVALS } from '@config/constants';

const App = () => {
  useEffect(() => {
    store.dispatch(checkAuthStatus());
    const checkTokenInterval = setInterval(() => {
      store.dispatch({ type: 'CHECK_TOKEN_EXPIRATION' });
    }, INTERVALS.TOKEN_CHECK); // 5 minutes
    return () => clearInterval(checkTokenInterval);
  }, []);

  return (
    <RoutesComponent />
  );
};

export default App;
