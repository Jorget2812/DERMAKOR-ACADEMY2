import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Performance: solo 10% de transacciones en producción
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Replay: capturar sesiones con errores
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    // No enviar en desarrollo local
    enabled: process.env.NODE_ENV === 'production',

    // Filtrar errores de red comunes que no son bugs
    ignoreErrors: [
        'ResizeObserver loop',
        'Network request failed',
        'Load failed',
        'ChunkLoadError',
    ],
});
