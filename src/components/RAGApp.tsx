'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  MessageSquare, 
  Trash2, 
  Send, 
  Globe, 
  Database,
  Loader2,
  Bot,
  User,
  Sparkles,
  FileUp,
  Link,
  Type,
  Brain,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Plus
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'text' | 'pdf' | 'csv' | 'url';
  timestamp: number;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function RAGApp() {
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // File upload handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    
    for (const file of acceptedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          const newDoc: Document = {
            id: result.documentId,
            name: file.name,
            type: file.type.includes('pdf') ? 'pdf' : 'csv',
            timestamp: Date.now(),
          };
          setDocuments(prev => [...prev, newDoc]);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    
    setIsProcessing(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
    },
  });

  // Add text document
  const handleAddText = async () => {
    if (!textInput.trim()) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/add-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput }),
      });

      if (response.ok) {
        const result = await response.json();
        const newDoc: Document = {
          id: result.documentId,
          name: `Text Document ${documents.length + 1}`,
          type: 'text',
          timestamp: Date.now(),
        };
        setDocuments(prev => [...prev, newDoc]);
        setTextInput('');
      }
    } catch (error) {
      console.error('Error adding text:', error);
    }
    setIsProcessing(false);
  };

  // Add website content
  const handleAddWebsite = async () => {
    if (!urlInput.trim()) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/add-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });

      if (response.ok) {
        const result = await response.json();
        const newDoc: Document = {
          id: result.documentId,
          name: urlInput,
          type: 'url',
          timestamp: Date.now(),
        };
        setDocuments(prev => [...prev, newDoc]);
        setUrlInput('');
      }
    } catch (error) {
      console.error('Error adding website:', error);
    }
    setIsProcessing(false);
  };

  // Remove document
  const handleRemoveDocument = async (documentId: string) => {
    try {
      const response = await fetch('/api/remove-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      }
    } catch (error) {
      console.error('Error removing document:', error);
    }
  };

  // Send chat message
  const handleSendMessage = async () => {
    if (!chatInput.trim() || documents.length === 0) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      type: 'user',
      content: chatInput,
      timestamp: Date.now(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: chatInput }),
      });

      if (response.ok) {
        const result = await response.json();
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}_assistant`,
          type: 'assistant',
          content: result.answer,
          timestamp: Date.now(),
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error querying:', error);
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your query.',
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'csv':
        return <Database className="w-5 h-5 text-green-500" />;
      case 'url':
        return <Globe className="w-5 h-5 text-blue-500" />;
      case 'text':
        return <Type className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            Intelligent RAG Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform your documents into intelligent conversations. Upload, analyze, and chat with your data using advanced AI.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6">
            <Badge variant="success" className="px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered
            </Badge>
            <Badge variant="info" className="px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Smart Search
            </Badge>
            <Badge variant="warning" className="px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              Production Ready
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Panel - Data Input */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-2xl">
                  <Plus className="w-6 h-6 mr-3 text-blue-600" />
                  Add Knowledge Sources
                </CardTitle>
                <CardDescription className="text-base">
                  Upload documents, add text, or scrape websites to build your knowledge base
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="text" className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                      <FileUp className="w-4 h-4" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="website" className="flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      Website
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-4">
                      <Textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Paste your text content here... This could be articles, notes, documentation, or any text you want to analyze."
                        className="min-h-[200px] text-base leading-relaxed"
                      />
                      <Button 
                        onClick={handleAddText} 
                        className="w-full" 
                        size="lg"
                        disabled={!textInput.trim() || isProcessing}
                        loading={isProcessing}
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        Add Text Content
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-4">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                        isDragActive
                          ? 'border-blue-500 bg-blue-50/50 scale-105'
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                        {isDragActive ? (
                          <div>
                            <p className="text-lg font-semibold text-blue-600">Drop your files here!</p>
                            <p className="text-gray-500">Release to upload</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-lg font-semibold text-gray-700 mb-2">
                              Drag & drop files or click to browse
                            </p>
                            <p className="text-gray-500 mb-4">
                              Supports PDF, CSV, and TXT files up to 10MB
                            </p>
                            <div className="flex items-center justify-center gap-4">
                              <Badge variant="outline">PDF</Badge>
                              <Badge variant="outline">CSV</Badge>
                              <Badge variant="outline">TXT</Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="website" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Website URL</label>
                        <Input
                          type="url"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder="https://example.com/article"
                          className="text-base"
                        />
                      </div>
                      <Button 
                        onClick={handleAddWebsite} 
                        className="w-full" 
                        size="lg"
                        disabled={!urlInput.trim() || isProcessing}
                        loading={isProcessing}
                      >
                        <Globe className="w-5 h-5 mr-2" />
                        Scrape Website Content
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Document Store */}
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Database className="w-6 h-6 mr-3 text-green-600" />
                    Knowledge Base
                  </div>
                  <Badge variant="secondary" className="px-3 py-1">
                    {documents.length} {documents.length === 1 ? 'document' : 'documents'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Your uploaded documents and content sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {documents.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Database className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No documents yet</p>
                      <p className="text-sm text-gray-400">Add some content to get started</p>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200/50 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                            {getDocumentIcon(doc.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-xs">
                              {doc.name}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(doc.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Chat */}
          <div className="xl:col-span-1">
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl h-[800px] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  AI Assistant
                </CardTitle>
                <CardDescription>
                  Ask questions about your documents
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto px-6 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="text-gray-600 font-medium mb-2">Ready to help!</p>
                      <p className="text-sm text-gray-400 max-w-xs mx-auto">
                        {documents.length === 0 
                          ? "Add some documents first, then ask me anything about them."
                          : "Ask me anything about your uploaded documents."
                        }
                      </p>
                    </div>
                  ) : (
                    <>
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-start space-x-3 ${
                            message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.type === 'user' 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                              : 'bg-gradient-to-r from-purple-500 to-pink-500'
                          }`}>
                            {message.type === 'user' ? (
                              <User className="w-4 h-4 text-white" />
                            ) : (
                              <Bot className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className={`max-w-[85%] p-4 rounded-2xl ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-800 rounded-bl-md'
                          }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-md">
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                              <p className="text-sm text-gray-600">Thinking...</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-6 pt-4 border-t border-gray-200/50">
                  <div className="flex space-x-3">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      placeholder={
                        documents.length === 0
                          ? "Add documents first..."
                          : "Ask me anything..."
                      }
                      disabled={documents.length === 0 || isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || documents.length === 0 || isLoading}
                      size="icon"
                      className="shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
