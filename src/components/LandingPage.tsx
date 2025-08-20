'use client';

import React from 'react';
import { ArrowRight, Sparkles, Zap, Shield, Brain } from 'lucide-react';
import { Button } from './ui/button';

interface LandingPageProps {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-50"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      
      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 md:p-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold">Askvault</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
            <span className="text-sm text-gray-300">Powered by Advanced AI</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">Chat with your</span>
            <br />
            <span className="text-white">documents</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Upload PDFs, CSVs, or websites and have intelligent conversations with your data. 
            Get instant answers powered by advanced AI.
          </p>

          {/* CTA Button */}
          <Button 
            onClick={onEnterApp}
            size="lg"
            className="vercel-button bg-white text-black hover:bg-gray-100 text-lg px-8 py-6 rounded-lg font-medium group transition-all duration-300 hover:scale-105"
          >
            Start Chatting
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
            <div className="glass-effect p-6 rounded-xl text-center group hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-400 text-sm">Get instant responses from your documents with our optimized AI pipeline.</p>
            </div>

            <div className="glass-effect p-6 rounded-xl text-center group hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-400 text-sm">Your documents are processed securely with enterprise-grade encryption.</p>
            </div>

            <div className="glass-effect p-6 rounded-xl text-center group hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Understanding</h3>
              <p className="text-gray-400 text-sm">Advanced AI that understands context and provides accurate answers.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-gray-500 text-sm">
        <p>&copy; 2024 RAG AI. Built with Next.js and OpenAI.</p>
      </footer>
    </div>
  );
}
