import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR" translate="no">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="google" content="notranslate" />
        
        {/* PWA / iOS Home Screen Tags */}
        <title>Cia do Ar Laudos</title>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Laudos" />
        
        {/* Ícone fixo para o Safari */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="manifest" href="/manifest.json" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            #root { display: none !important; }
            #print-root { display: block !important; position: static !important; }
            body, html { overflow: visible !important; height: auto !important; background-color: #ffffff !important; }
          }
          @media screen {
            #print-root { display: none !important; }
          }
        `}} />
      </head>
      <body style={{ backgroundColor: '#f8fafc' }}>{children}</body>
    </html>
  );
}
