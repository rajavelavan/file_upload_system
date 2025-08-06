'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Analysis {
  fileId: string;
  status: number;
  statusText: string;
  fileName: string;
  summary: string;
  analyzedAt: string;
}

export default function Summary() {
  const  params  = useParams();
  const fileId = params?.id;
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        if (!fileId || typeof fileId !== 'string') return;
        const response = await fetch(`/api/analyze/${fileId}`);
        if (!response.ok) throw new Error('Failed to fetch analysis');
        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError('Failed to load file analysis');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [fileId]);

  return (
    <main className='flex flex-col items-center min-h-screen'>
      <header className='flex h-16 p-3 border-b-2 border-gray-200 w-full items-center justify-center bg-gray-100'>
        <h1 className="text-lg font-bold">File Upload System</h1>
      </header>

      <div className="flex flex-col items-center w-full max-w-2xl p-6">
        {loading ? (
          <div className="animate-pulse">{ analysis?.status === 208 ? 'Getting file summary...' : 'Analyzing File...'  }</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : analysis ? (
          <div className="space-y-4">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center justify-around">Summary</h2>
              <div>
                <p className="text-gray-700 whitespace-pre-wrap">{analysis.summary}</p>
                <div className='flex items-center justify-end'>
                  <p className="text-sm text-gray-500 mt-4">
                    Analyzed at: {new Date(analysis.analyzedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <label className="text-xs font-bold mt-4 text-gray-500">Analyzed File(s): {analysis.fileName}</label>
          </div>
        ) : null}
      </div>
    </main>
  );
}