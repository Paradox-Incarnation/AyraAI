import React from 'react';

export const LoadingAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Anime-style loading GIF placeholder */}
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-gradient-to-r from-pink-400 via-purple-500 to-pink-600 rounded-full animate-spin">
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-pulse flex items-center justify-center">
              <div className="text-white font-bold text-lg">AI</div>
            </div>
          </div>
        </div>
        
        {/* Floating particles animation */}
        <div className="absolute -top-4 -left-4 w-4 h-4 bg-pink-400 rounded-full animate-bounce opacity-70"></div>
        <div className="absolute -top-2 -right-6 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute -bottom-4 -right-2 w-5 h-5 bg-pink-500 rounded-full animate-bounce opacity-80" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-2 -left-6 w-2 h-2 bg-purple-500 rounded-full animate-bounce opacity-50" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      {/* Loading text with typing animation */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 animate-pulse">
          Automating with Ayra AI
        </h3>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-gray-600 mt-4 animate-fade-in">
          Analyzing your request and creating the perfect automation workflow...
        </p>
      </div>
    </div>
  );
};