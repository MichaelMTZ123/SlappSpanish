/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App.tsx';
import { LanguageProvider } from './src/lib/i18n.ts';

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <LanguageProvider>
                 <App />
            </LanguageProvider>
        </React.StrictMode>
    );
}