'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { models } from '../config/models';

interface Chat {
  id: string;
  title: string;
  messages: { role: string; content: string }[];
}

export default function FabricUI() {
  const [input, setInput] = useState('');
  const [patterns, setPatterns] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPatterns();
    loadChats();
  }, []);

  const fetchPatterns = async () => {
    try {
      const response = await fetch('/api/patterns');
      const data = await response.json();
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

  const loadChats = () => {
    const savedChats = localStorage.getItem('fabric-chats');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
  };

  const saveChat = (chat: Chat) => {
    const updatedChats = currentChat
      ? chats.map(c => c.id === chat.id ? chat : c)
      : [...chats, chat];
    setChats(updatedChats);
    localStorage.setItem('fabric-chats', JSON.stringify(updatedChats));
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
      if (currentChat) {
        const updatedChat = {
          ...currentChat,
          messages: [...currentChat.messages, { role: 'user', content: input }, { role: 'assistant', content: data }]
        };
        setCurrentChat(updatedChat);
        saveChat(updatedChat);
      } else {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: `Chat ${chats.length + 1}`,
          messages: [{ role: 'user', content: input }, { role: 'assistant', content: data }]
        };
        setCurrentChat(newChat);
        saveChat(newChat);
      }
      setInput('');
    } catch (error) {
      console.error('Error:', error);
      setOutput('An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Fabric UI</h2>
        <button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          onClick={() => setCurrentChat(null)}
        >
          New Chat
        </button>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-400">Previous Chats</h3>
          {chats.map(chat => (
            <button 
              key={chat.id} 
              className="w-full text-left p-2 hover:bg-gray-700 rounded"
              onClick={() => setCurrentChat(chat)}
            >
              {chat.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Chat history and output */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentChat && currentChat.messages.map((msg, index) => (
            <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {!currentChat && output && (
            <div className="mb-4">
              <div className="inline-block p-2 rounded-lg bg-gray-700">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            </div>
          )}
          {!currentChat && !output && (
            <div className="flex flex-col items-center justify-center h-full">
              <h1 className="text-4xl font-bold mb-4">Welcome to Fabric UI</h1>
              <p className="text-xl text-gray-400">How can I help you today?</p>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 bg-gray-800">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div className="flex space-x-4">
              <select
                value={selectedPattern}
                onChange={(e) => setSelectedPattern(e.target.value)}
                className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-white"
              >
                <option value="">Select a pattern</option>
                {patterns.map((pattern) => (
                  <option key={pattern} value={pattern}>{pattern}</option>
                ))}
              </select>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-white"
              >
                <option value="">Select a model</option>
                {models.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
              rows={4}
              placeholder="Enter text or YouTube URL"
            />
            <div className="flex items-center space-x-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Upload File
              </label>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
