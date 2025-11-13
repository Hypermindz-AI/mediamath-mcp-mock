'use client';

import { useState, useEffect } from 'react';

interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

export default function TestUI() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawRequest, setRawRequest] = useState<string>('');
  const [rawResponse, setRawResponse] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [authEnabled, setAuthEnabled] = useState<boolean>(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mcp_api_key');
    if (saved) {
      setApiKey(saved);
    }
  }, []);

  // Save API key to localStorage when changed
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('mcp_api_key', apiKey);
    }
  }, [apiKey]);

  // Fetch tools on mount
  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add API key if provided
      if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }

      const response = await fetch('/api/message', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/list',
          params: {},
          id: 1,
        }),
      });

      const data = await response.json();

      // Check if auth is enabled
      if (response.status === 401) {
        setAuthEnabled(true);
        setError('Authentication required. Please enter API key.');
        return;
      }

      if (data.result?.tools) {
        setTools(data.result.tools);
        setAuthEnabled(false);
      }
    } catch (err) {
      setError('Failed to load tools');
    }
  };

  const executeTool = async () => {
    if (!selectedTool) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const request = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: selectedTool.name,
        arguments: parameters,
      },
      id: Date.now(),
    };

    setRawRequest(JSON.stringify(request, null, 2));

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add API key if provided
      if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }

      const response = await fetch('/api/message', {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      const data = await response.json();
      setRawResponse(JSON.stringify(data, null, 2));

      if (response.status === 401) {
        setError('Unauthorized - Invalid or missing API key');
        return;
      }

      if (data.error) {
        setError(data.error.message || 'Tool execution failed');
      } else if (data.result) {
        setResult(data.result);
      }
    } catch (err: any) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
    setParameters({});
    setResult(null);
    setError(null);
    setRawRequest('');
    setRawResponse('');
  };

  const updateParameter = (key: string, value: string) => {
    setParameters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderParameterInput = (key: string, schema: any) => {
    const isRequired = selectedTool?.inputSchema.required?.includes(key);

    return (
      <div key={key} className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {key}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type={schema.type === 'number' ? 'number' : 'text'}
          placeholder={schema.description || `Enter ${key}`}
          value={parameters[key] || ''}
          onChange={(e) => updateParameter(key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {schema.description && (
          <p className="text-xs text-gray-500 mt-1">{schema.description}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">MCP Tool Tester</h1>
          <p className="text-gray-600 mt-2">
            Interactive testing interface for MediaMath MCP Mock Server
          </p>
        </div>

        {/* API Key Input */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key (Optional)
                {authEnabled && (
                  <span className="text-red-500 ml-2 text-xs">
                    Authentication required
                  </span>
                )}
              </label>
              <input
                type="password"
                placeholder="Enter API key if authentication is enabled"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if server is public. Stored in browser localStorage.
              </p>
            </div>
            <button
              onClick={fetchTools}
              className="mt-6 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Reconnect
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tool List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">
                Available Tools ({tools.length})
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tools.map((tool) => (
                  <button
                    key={tool.name}
                    onClick={() => handleToolSelect(tool)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedTool?.name === tool.name
                        ? 'bg-blue-100 border-blue-500 border'
                        : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <div className="font-medium text-sm">{tool.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {tool.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tool Details & Execution */}
          <div className="lg:col-span-2">
            {selectedTool ? (
              <div className="space-y-6">
                {/* Tool Info */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-2">
                    {selectedTool.name}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {selectedTool.description}
                  </p>

                  {/* Parameters */}
                  {selectedTool.inputSchema.properties &&
                    Object.keys(selectedTool.inputSchema.properties).length >
                      0 && (
                      <div>
                        <h3 className="text-md font-semibold mb-3">
                          Parameters
                        </h3>
                        {Object.entries(
                          selectedTool.inputSchema.properties
                        ).map(([key, schema]) =>
                          renderParameterInput(key, schema)
                        )}
                      </div>
                    )}

                  {/* Execute Button */}
                  <button
                    onClick={executeTool}
                    disabled={loading}
                    className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Executing...' : 'Execute Tool'}
                  </button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-semibold mb-2">Error</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {/* Result Display */}
                {result && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-3">Result</h3>
                    {result.content && result.content.length > 0 && (
                      <div className="space-y-3">
                        {result.content.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded p-4 border border-gray-200"
                          >
                            {item.type === 'text' && (
                              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                                {typeof item.text === 'string'
                                  ? item.text
                                  : JSON.stringify(
                                      JSON.parse(item.text),
                                      null,
                                      2
                                    )}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Raw JSON */}
                {(rawRequest || rawResponse) && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-3">
                      Raw JSON-RPC
                    </h3>

                    {rawRequest && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Request
                        </h4>
                        <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
                          {rawRequest}
                        </pre>
                      </div>
                    )}

                    {rawResponse && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Response
                        </h4>
                        <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
                          {rawResponse}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No tool selected
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a tool from the list to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
