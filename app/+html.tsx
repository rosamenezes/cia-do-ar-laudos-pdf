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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="google" content="notranslate" />

        {/* PWA / iOS Home Screen Tags */}
        <title>Cia do Ar Laudos</title>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Laudos" />
        <meta name="theme-color" content="#f8fafc" />

        {/* Ícone fixo para o Safari */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="manifest" href="/manifest.json" />

        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media print {
            #root { display: none !important; }
            #print-root { display: block !important; position: static !important; }
            body, html { overflow: visible !important; height: auto !important; background-color: #ffffff !important; }
          }
          @media screen {
            #print-root { display: none !important; }
            html, body { 
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: 100% !important;
              min-height: 100% !important;
              background-color: #f8fafc !important;
              overflow: hidden !important;
              touch-action: manipulation;
              -webkit-text-size-adjust: 100%;
            }
            #root, #root > div, #root > div > div { 
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
              width: 100% !important;
              height: 100% !important;
              background-color: #f8fafc !important; 
              display: flex !important;
              flex-direction: column !important;
              overflow: hidden !important;
            }
          }
        `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // Bloqueia o movimento de pinça (pinch to zoom) no iOS Safari
            document.addEventListener('gesturestart', function(e) {
              e.preventDefault();
            });
            // Bloqueia o double-tap to zoom forçado via JavaScript
            var lastTouchEnd = 0;
            document.addEventListener('touchend', function(event) {
              var now = (new Date()).getTime();
              if (now - lastTouchEnd <= 300) {
                event.preventDefault();
              }
              lastTouchEnd = now;
            }, false);
            `,
          }}
        />
      </head>
      <body style={{ backgroundColor: '#f8fafc' }}>{children}</body>
    </html>
  );
}
