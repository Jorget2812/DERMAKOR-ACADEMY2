"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html>
            <body>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    fontFamily: 'system-ui, sans-serif',
                    backgroundColor: '#FAFAF8',
                    color: '#1a1a1a'
                }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                        Une erreur est survenue
                    </h2>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>
                        Nous nous excusons pour le désagrément. Veuillez réessayer.
                    </p>
                    <button
                        onClick={reset}
                        style={{
                            padding: '0.75rem 2rem',
                            backgroundColor: '#1a1a1a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Réessayer
                    </button>
                </div>
            </body>
        </html>
    );
}
