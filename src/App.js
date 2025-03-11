import React from 'react';
import { CssVarsProvider } from '@mui/joy';
import theme from './themes/theme';
import GlobalStyles from './components/common/GlobalStyles';
import AppRoutes from './routes';

const App = () => {
  return (
    <CssVarsProvider theme={theme}>
      <GlobalStyles />
      <AppRoutes />
    </CssVarsProvider>
  );
};

export default App;