import React, { useState } from "react";

/**
 * ProblemSubmitForm.tsx
 * A single-file React + TypeScript component (TailwindCSS-ready) that
 * allows a user to submit a civic problem (title, category, description)
 * to a webhook URL via POST (JSON).
 *
 * Usage:
 * - Add this file into your React/Next.js project (e.g. /components/ProblemSubmitForm.tsx)
 * - Ensure TailwindCSS is configured in your project for styling to apply.
 * - Render <ProblemSubmitForm /> in a page.
 *
 * Behavior:
 * - Validates required fields
 * - Lets you set the webhook URL (or paste your ngrok URL)
 * - Sends a POST request with JSON payload
 * - Shows success / error response and keeps an audit of requests
 */

type Category =
  | "Waste Management"
  | "Infrastructure Development"
  | "Water Management"
  | "Public Health"
  | "Other";

type ProblemPayload = {
  title: string;
  category: Category;
  description: string;
  location?: string;
  reporter?: string;
  metadata?: Record<string, unknown>;
};

export default function ProblemSubmitForm() {
  const [webhookUrl, setWebhookUrl] = useState<string>(
    "https://your-ngrok-url.ngrok-free.app/api/webhook/problem"
  );
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(
    "Waste Management"
  );
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [reporter, setReporter] = useState("");

  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ payload: ProblemPayload; response: any }>>([]);

  function validate(): string | null {
    if (!webhookUrl) return "Webhook URL is required.";
    if (!title.trim()) return "Title is required.";
    if (!description.trim()) return "Description is required.";
    return null;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setResponseMsg(null);
    setErrorMsg(null);

    const v = validate();
    if (v) {
      setErrorMsg(v);
      return;
    }

    const payload: ProblemPayload = {
      title: title.trim(),
      category,
      description: description.trim(),
      location: location.trim() || undefined,
      reporter: reporter.trim() || undefined,
    };

    setLoading(true);

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any headers required by your backend here, e.g. API keys
          // "x-api-key": process.env.NEXT_PUBLIC_WEBHOOK_KEY || "",
        },
        body: JSON.stringify(payload),
      });

      let body: any;
      try {
        body = await res.json();
      } catch (err) {
        body = await res.text();
      }

      if (!res.ok) {
        setErrorMsg(`Request failed: ${res.status} ${res.statusText} — ${JSON.stringify(body)}`);
      } else {
        setResponseMsg(`Success: ${res.status} ${res.statusText}`);
      }

      setHistory((h) => [{ payload, response: { status: res.status, body } }, ...h]);
    } catch (err: any) {
      setErrorMsg(`Network error: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Submit a Civic Problem</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <label className="block text-sm font-medium">Webhook URL</label>
          <input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://xxxx.ngrok-free.app/api/webhook/problem"
            className="mt-1 block w-full border rounded-md p-2"
          />
          <p className="text-xs text-gray-500 mt-1">Make sure this exact path is routed in your backend and accepts POST.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
              placeholder="e.g. Overflowing trash bin behind market"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="mt-1 block w-full border rounded-md p-2"
            >
              <option>Waste Management</option>
              <option>Infrastructure Development</option>
              <option>Water Management</option>
              <option>Public Health</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2 min-h-[120px]"
            placeholder="Describe the problem, attach photos via the location or journalist contact if needed..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Location (optional)</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
              placeholder="Sector 7, Block C"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Your name / contact (optional)</label>
            <input
              value={reporter}
              onChange={(e) => setReporter(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
              placeholder="Ali H."
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Problem"}
            </button>
          </div>

          <div className="text-sm text-gray-600">
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setDescription("");
                setLocation("");
                setReporter("");
                setResponseMsg(null);
                setErrorMsg(null);
              }}
              className="underline"
            >
              Reset
            </button>
          </div>
        </div>

        {errorMsg && <div className="text-red-600">{errorMsg}</div>}
        {responseMsg && <div className="text-green-600">{responseMsg}</div>}
      </form>

      <section className="mt-6">
        <h2 className="text-lg font-medium mb-2">Recent Requests (local history)</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">No requests sent yet.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((h, i) => (
              <li key={i} className="p-3 bg-gray-50 border rounded">
                <div className="text-sm font-semibold">{h.payload.title} — {h.payload.category}</div>
                <div className="text-xs text-gray-600">{h.payload.description}</div>
                <div className="mt-2 text-xs text-gray-500">Response: {JSON.stringify(h.response)}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 text-xs text-gray-500">
        <p className="mb-1">Debug tips:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Make sure your backend route (path + method) matches the webhook URL above.</li>
          <li>If you get 404, add a logger to your server to print req.method and req.url; check for trailing slash differences.</li>
          <li>For CORS errors, enable CORS on your backend or use ngrok tunnels with CORS disabled for testing.</li>
        </ul>
      </section>

    </div>
  );
}
