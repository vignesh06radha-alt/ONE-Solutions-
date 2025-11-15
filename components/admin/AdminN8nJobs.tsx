import React, { useEffect, useState } from 'react';
import Card from '../Card';

type N8nJob = {
  jobId: string;
  type: string;
  status: string;
  problemId: string;
  payload?: any;
  createdAt?: string;
  updatedAt?: string;
};

const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE || import.meta.env.REACT_APP_API_BASE)) || 'http://localhost:3001';

const AdminN8nJobs: React.FC = () => {
  const [jobs, setJobs] = useState<N8nJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('admin_jwt') : null;

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/n8n/jobs?status=pending&limit=100`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const body = await res.json();
      setJobs(body.data?.jobs || []);
    } catch (err) {
      console.error('Fetch jobs error', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const t = setInterval(fetchJobs, 30_000);
    return () => clearInterval(t);
  }, []);

  const processJob = async (jobId: string) => {
    if (!window.confirm(`Process job ${jobId}?`)) return;
    setProcessingId(jobId);
    try {
      const res = await fetch(`${API_BASE}/api/admin/n8n/jobs/${jobId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Processing failed');
      }
      await fetchJobs();
    } catch (err) {
      console.error('Process job error', err);
      alert('Failed to process job: ' + (err as any).message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Card title="n8n Jobs">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">Pending jobs: {jobs.length}</div>
          <div>
            <button onClick={fetchJobs} className="btn-sm">Refresh</button>
          </div>
        </div>

        {loading ? <div>Loading…</div> : (
          <div className="overflow-auto max-h-96">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th>JobId</th>
                  <th>ProblemId</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Payload</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j.jobId} className="border-t">
                    <td className="py-2">{j.jobId}</td>
                    <td className="py-2">{j.problemId}</td>
                    <td className="py-2">{j.type}</td>
                    <td className="py-2">{j.status}</td>
                    <td className="py-2"><pre className="text-xs">{JSON.stringify(j.payload)}</pre></td>
                    <td className="py-2">
                      <button
                        disabled={processingId === j.jobId}
                        onClick={() => processJob(j.jobId)}
                        className="btn-sm"
                      >
                        {processingId === j.jobId ? 'Processing…' : 'Process'}
                      </button>
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && <tr><td colSpan={6} className="py-4 text-sm text-gray-500">No pending jobs</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AdminN8nJobs;
