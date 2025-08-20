'use client';

import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import LandingPage from './LandingPage';
import {
  Upload, FileText, Globe, MessageSquare, Send, Loader2, Plus, Database, Type, Bot, User, ArrowLeft, Sparkles, Brain, X
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size?: number;
  addedAt: Date;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function RAGApp() {
  const [showLanding, setShowLanding] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          const newDocument: Document = {
            id: result.documentId,
            name: file.name,
            type: file.type.includes('pdf') ? 'pdf' : file.type.includes('csv') ? 'csv' : 'text',
            size: file.size,
            addedAt: new Date(),
          };
          setDocuments(prev => [...prev, newDocument]);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddText = async () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/add-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
      });

      if (response.ok) {
        const result = await response.json();
        const newDocument: Document = {
          id: result.documentId,
          name: `Text Document ${documents.length + 1}`,
          type: 'text',
          addedAt: new Date(),
        };
        setDocuments(prev => [...prev, newDocument]);
        setTextInput('');
      }
    } catch (error) {
      console.error('Error adding text:', error);
    }
    setIsProcessing(false);
  };

  const handleAddWebsite = async () => {
    if (!urlInput.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/add-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlInput }),
      });

      if (response.ok) {
        const result = await response.json();
        const newDocument: Document = {
          id: result.documentId,
          name: urlInput,
          type: 'url',
          addedAt: new Date(),
        };
        setDocuments(prev => [...prev, newDocument]);
        setUrlInput('');
      }
    } catch (error) {
      console.error('Error adding website:', error);
    }
    setIsProcessing(false);
  };

  const handleRemoveDocument = async (documentId: string) => {
    try {
      const response = await fetch('/api/remove-document', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      }
    } catch (error) {
      console.error('Error removing document:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || documents.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: chatInput }),
      });

      if (response.ok) {
        const result = await response.json();
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.answer,
          timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error querying:', error);
    }

    setIsLoading(false);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-400" />;
      case 'csv':
        return <Database className="w-4 h-4 text-green-400" />;
      case 'url':
        return <Globe className="w-4 h-4 text-blue-400" />;
      case 'text':
        return <Type className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  if (showLanding) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-30"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLanding(true)}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold">RAG AI</span>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="border-green-500/50 text-green-400">
            <Sparkles className="w-3 h-3 mr-1" />
            {documents.length} docs
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

          {/* Left Panel - Document Management */}
          <div className="lg:col-span-1 space-y-6">
            {/* Add Documents Card */}
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Documents
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Upload files or add content to your knowledge base
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-white/5">
                    <TabsTrigger value="text" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
                      <Type className="w-4 h-4 mr-1" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
                      <Upload className="w-4 h-4 mr-1" />
                      Files
                    </TabsTrigger>
                    <TabsTrigger value="website" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
                      <Globe className="w-4 h-4 mr-1" />
                      URL
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4 mt-4">
                    <Textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste your text content here..."
                      className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 resize-none"
                    />
                    <Button
                      onClick={handleAddText}
                      className="w-full vercel-button bg-white text-black hover:bg-gray-100"
                      disabled={!textInput.trim() || isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Type className="w-4 h-4 mr-2" />
                      )}
                      Add Text
                    </Button>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-4 mt-4">
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.csv,.txt"
                        multiple
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-300 mb-2">Drop files here or click to browse</p>
                      <p className="text-sm text-gray-500">Supports PDF, CSV, and TXT files</p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 vercel-button bg-white text-black hover:bg-gray-100"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Choose Files
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="website" className="space-y-4 mt-4">
                    <Input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    />
                    <Button
                      onClick={handleAddWebsite}
                      className="w-full vercel-button bg-white text-black hover:bg-gray-100"
                      disabled={!urlInput.trim() || isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Globe className="w-4 h-4 mr-2" />
                      )}
                      Add Website
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Documents List */}
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Knowledge Base
                  </span>
                  <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                    {documents.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No documents added yet</p>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getDocumentIcon(doc.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {doc.size ? formatFileSize(doc.size) : 'Text content'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="glass-effect border-white/10 h-full flex flex-col">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  AI Assistant
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Ask questions about your documents
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <Bot className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-400 mb-2">Ready to answer your questions</p>
                      <p className="text-sm text-gray-600">Upload some documents and start chatting!</p>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start space-x-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                          }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                            ? 'bg-blue-500'
                            : 'bg-purple-500'
                            }`}>
                            {message.role === 'user' ? (
                              <User className="w-4 h-4 text-white" />
                            ) : (
                              <Bot className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className={`px-4 py-3 rounded-lg ${message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-gray-100'
                            }`}>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white/10 px-4 py-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            <span className="text-sm text-gray-400">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-white/10 p-6">
                  <div className="flex space-x-3">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={documents.length === 0 ? "Add documents first to start chatting..." : "Ask a question about your documents..."}
                      className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      disabled={documents.length === 0 || isLoading}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || documents.length === 0 || isLoading}
                      className="vercel-button bg-white text-black hover:bg-gray-100"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
