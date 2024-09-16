'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function FabricUI() {
  const [input, setInput] = useState('');
  const [patterns, setPatterns] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPatterns();
    fetchModels();
  }, []);

  const fetchPatterns = async () => {
    try {
      console.log('Fetching patterns');
      const response = await fetch('/api/patterns');
      const data = await response.json();
      console.log('Patterns data:', data);
      if (data.error) {
        console.error('Error fetching patterns:', data.error);
        setPatterns([]);
      } else {
        setPatterns(data.patterns || []);
      }
    } catch (error) {
      console.error('Error fetching patterns:', error);
      setPatterns([]);
    }
  };

  const fetchModels = async () => {
    try {
      console.log('Fetching models');
      const response = await fetch('/api/models');
      const data = await response.json();
      console.log('Models data:', data);
      if (data.error) {
        console.error('Error fetching models:', data.error);
        setModels([]);
      } else {
        setModels(data.models || []);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setInput(e.target?.result as string);
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const isYouTubeUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/i.test(input);
    
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          pattern: selectedPattern,
          model: selectedModel,
          isYouTubeUrl
        }),
      });
      
      const data = await response.text();
      setOutput(data);
    } catch (error) {
      setOutput('An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 text-gray-200"> {/* Light text for labels */}
      <h1 className="text-2xl font-bold mb-4 text-gray-100">Fabric UI</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="input" className="block text-sm font-medium mb-1">
            Input (Text or YouTube URL)
          </label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            rows={4}
            placeholder="Enter text or YouTube URL"
          />
        </div>
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium mb-1">
            Or upload a file
          </label>
          <input
            type="file"
            id="file-upload"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-600 file:text-white
              hover:file:bg-indigo-700"
          />
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="pattern" className="block text-sm font-medium mb-1">
              Pattern
            </label>
            <select
              id="pattern"
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 h-10" // Increased height
            >
              <option value="">Select a pattern</option>
              {patterns.map((pattern) => (
                <option key={pattern} value={pattern}>{pattern}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium mb-1">
              Model
            </label>
            <select
              id="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 h-10" // Increased height
            >
              <option value="">Select a model</option>
              {models.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Execute
        </button>
      </form>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Output:</h2>
        <div className="bg-white border border-gray-300 rounded-md p-4 h-64 overflow-auto">
          <ReactMarkdown className="text-black prose">
            {output || "No output yet."}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
