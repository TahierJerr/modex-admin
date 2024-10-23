import * as React from 'react';

interface ErrorTemplateProps {
    error: string;
    errorCode: number;
    notes?: string; // Added optional notes prop
}

export const ErrorTemplate: React.FC<Readonly<ErrorTemplateProps>> = ({
    error,
    errorCode,
    notes, // Destructure the notes prop
}) => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-600">Error {errorCode}</h1>
            <p className="mt-2 text-gray-700">
                An error occurred on the MODEX website. Please check the logs for more information.
            </p>
            <a
                href="https://vercel.com/tahierjerrs-projects/modex-admin/logs"
                className="mt-4 inline-block px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition duration-300"
                target="_blank"
                rel="noopener noreferrer"
            >
                View Logs
            </a>
            <p className="mt-4 text-gray-500">Error Details:</p>
            <pre className="mt-2 bg-gray-200 p-4 rounded border border-gray-300 text-sm text-gray-800 overflow-x-auto">
                {error}
            </pre>
            {notes && ( // Conditionally render notes if provided
                <div className="mt-4 text-gray-600">
                    <p className="font-semibold">Notes:</p>
                    <pre className="bg-gray-100 p-2 rounded border border-gray-300 text-sm text-gray-800 overflow-x-auto">
                        {notes}
                    </pre>
                </div>
            )}
        </div>
    </div>
);
