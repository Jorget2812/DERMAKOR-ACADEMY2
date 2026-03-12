"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function AppError({
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
                Une erreur est survenue
            </h2>
            <p className="text-gray-500">
                Nous nous excusons pour le désagrément. Veuillez réessayer o contacter le support.
            </p>
            <button
                onClick={reset}
                className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
                Réessayer
            </button>
        </div>
    );
}
