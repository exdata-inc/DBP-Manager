import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { BrowserRouter } from "react-router-dom";

import i18n from "i18next";
import "./i18n/config"; //i18
import theme from './theme';
import { Auth0ProviderWithNavigate, AppTitleStateProvider, UserProfileStateProvider } from './providers';
import App from './App';
import { FileExplorerStateProvider } from './providers/FileExplorerContext';
import { FileMoveProvider } from './providers/FileMoveContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {/* <Auth0ProviderWithNavigate> */}
          <UserProfileStateProvider>
            <AppTitleStateProvider>
              <FileExplorerStateProvider>
                <FileMoveProvider>
                  <App />
                </FileMoveProvider>
              </FileExplorerStateProvider>
            </AppTitleStateProvider>
          </UserProfileStateProvider>
        {/* </Auth0ProviderWithNavigate> */}
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
