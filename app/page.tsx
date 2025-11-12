import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">MediaMath MCP Mock Server</h1>
        <p className="text-gray-600 mb-8">
          A production-ready mock MCP server implementing the MediaMath campaign management API
        </p>

        <div className="space-y-4">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-2">OAuth 2.0 Endpoint</h2>
            <p className="text-gray-700 mb-2">Request tokens at:</p>
            <code className="bg-gray-800 text-green-400 p-3 rounded block text-sm">
              POST /api/oauth/token
            </code>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h2 className="text-xl font-semibold mb-2">Test Credentials</h2>
            <p className="text-gray-700 mb-2">Use these to test authentication:</p>
            <ul className="text-left text-sm space-y-1">
              <li>Email: <code className="bg-gray-100 px-2 py-1 rounded">admin@acme.com</code></li>
              <li>Password: <code className="bg-gray-100 px-2 py-1 rounded">password123</code></li>
            </ul>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h2 className="text-xl font-semibold mb-2">Documentation</h2>
            <p className="text-gray-700 mb-4">
              See the README.md for complete documentation and API examples.
            </p>
            <a
              href="/api/oauth/token"
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              View API Documentation
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
