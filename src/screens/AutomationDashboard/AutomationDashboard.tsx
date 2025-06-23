import {
  ArrowRightIcon,
  BotIcon,
  CalendarIcon,
  DatabaseIcon,
  FileTextIcon,
  GitBranchIcon,
  MailIcon,
  SearchIcon,
  SendIcon,
  ShoppingCartIcon,
  SlackIcon,
  StarIcon,
  TrendingUpIcon,
  UsersIcon,
  ZapIcon,
  LightbulbIcon,
  MapPinIcon,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { LoadingAnimation } from "../../components/LoadingAnimation";
import { ComprehensiveWorkflowDemo } from "../ComprehensiveWorkflowDemo";
import { generateStructuredWorkflow, requiresLocation, getUserLocation, type LocationData } from "../../services/geminiService";

interface AutomationTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  isPopular?: boolean;
  isRecommended?: boolean;
}

interface IntentSuggestion {
  intent: string;
  suggestions: string[];
  confidence: number;
}

type ViewState = 'dashboard' | 'loading' | 'comprehensive-workflow';

export const AutomationDashboard = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("for-you");
  const [viewState, setViewState] = useState<ViewState>('dashboard');
  const [currentQuery, setCurrentQuery] = useState("");
  const [intentSuggestions, setIntentSuggestions] = useState<IntentSuggestion | null>(null);
  const [isAnalyzingIntent, setIsAnalyzingIntent] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  const automationTemplates: AutomationTemplate[] = [
    {
      id: "gmail-drive",
      title: "Save Gmail Attachments to Google Drive",
      description: "Automatically save email attachments to your Google Drive folder",
      icon: <MailIcon className="w-8 h-8 text-colorful-red" />,
      category: "Email",
      isPopular: true,
      isRecommended: true,
    },
    {
      id: "slack-notifications",
      title: "Get Notified in Slack for New Leads",
      description: "Send instant Slack notifications when new leads are captured",
      icon: <SlackIcon className="w-8 h-8 text-colorful-purple" />,
      category: "Communication",
      isPopular: true,
      isRecommended: true,
    },
    {
      id: "calendar-sync",
      title: "Sync Calendar Events Across Platforms",
      description: "Keep your calendars in sync across Google, Outlook, and other platforms",
      icon: <CalendarIcon className="w-8 h-8 text-colorful-blue" />,
      category: "Productivity",
      isRecommended: true,
    },
    {
      id: "crm-automation",
      title: "Update CRM with New Form Submissions",
      description: "Automatically add new form submissions to your CRM system",
      icon: <DatabaseIcon className="w-8 h-8 text-colorful-green" />,
      category: "Sales",
      isPopular: true,
    },
    {
      id: "social-media",
      title: "Cross-post to Multiple Social Platforms",
      description: "Share your content across Twitter, LinkedIn, and Facebook simultaneously",
      icon: <TrendingUpIcon className="w-8 h-8 text-colorful-pink" />,
      category: "Marketing",
    },
    {
      id: "invoice-tracking",
      title: "Track Invoice Payments Automatically",
      description: "Monitor invoice status and send payment reminders automatically",
      icon: <FileTextIcon className="w-8 h-8 text-colorful-orange" />,
      category: "Finance",
    },
    {
      id: "team-onboarding",
      title: "Automate New Employee Onboarding",
      description: "Create accounts, send welcome emails, and assign tasks for new hires",
      icon: <UsersIcon className="w-8 h-8 text-colorful-cyan" />,
      category: "HR",
    },
    {
      id: "ecommerce-orders",
      title: "Process E-commerce Orders",
      description: "Automatically fulfill orders and update inventory across platforms",
      icon: <ShoppingCartIcon className="w-8 h-8 text-colorful-emerald" />,
      category: "E-commerce",
    },
    {
      id: "project-management",
      title: "Create Tasks from Email Requests",
      description: "Convert important emails into actionable tasks in your project management tool",
      icon: <GitBranchIcon className="w-8 h-8 text-colorful-indigo" />,
      category: "Project Management",
    },
  ];

  const startFromScratchOptions = [
    {
      title: "Ario",
      description: "Automated workflows",
      icon: <ZapIcon className="w-6 h-6 text-colorful-pink" />,
    },
    {
      title: "Table",
      description: "Automated data",
      icon: <DatabaseIcon className="w-6 h-6 text-colorful-blue" />,
    },
    {
      title: "Interface",
      description: "Apps, forms, and pages",
      icon: <FileTextIcon className="w-6 h-6 text-colorful-violet" />,
    },
    {
      title: "Chatbot",
      description: "AI-powered chatbot",
      icon: <BotIcon className="w-6 h-6 text-colorful-green" />,
    },
    {
      title: "Canvas",
      description: "Process visualization",
      icon: <GitBranchIcon className="w-6 h-6 text-colorful-rose" />,
    },
  ];

  const filteredTemplates = automationTemplates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Debounced intent analysis
  const debouncedIntentAnalysis = useCallback(
    debounce(async (query: string) => {
      if (!query.trim() || query.length < 3) {
        setIntentSuggestions(null);
        setShowSuggestions(false);
        return;
      }

      setIsAnalyzingIntent(true);
      try {
        const suggestions = await analyzeUserIntent(query);
        setIntentSuggestions(suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error analyzing intent:', error);
        setIntentSuggestions(null);
      } finally {
        setIsAnalyzingIntent(false);
      }
    }, 500), // Reduced to 500ms for faster suggestions
    []
  );

  // Analyze user intent and provide suggestions
  const analyzeUserIntent = async (query: string): Promise<IntentSuggestion> => {
    // Additional validation to prevent empty queries
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 3) {
      throw new Error('Query too short for analysis');
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const apiKey = "AIzaSyAWOkUIDR7WsTmBeMr-1jA6VRH8SnLbbZI";
      
      if (!apiKey) {
        throw new Error('API key not available');
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
      Analyze this user input: "${trimmedQuery}"

      The user is trying to describe an automation they want to create, but they might be vague or incomplete.

      Your task is to:
      1. Detect the general intent/domain (e.g., "marketing", "sales", "customer service", "personal productivity", "data management", etc.)
      2. Provide 3-4 specific, actionable suggestions for what they might want to automate

      Return your response in this EXACT JSON format:
      {
        "intent": "brief description of detected intent",
        "suggestions": [
          "specific suggestion 1",
          "specific suggestion 2", 
          "specific suggestion 3",
          "specific suggestion 4"
        ],
        "confidence": 0.85
      }

      Examples:
      - Input: "marketing calls" → Intent: "Sales/Marketing outreach", Suggestions: ["Automate follow-up calls after email campaigns", "Schedule cold calls based on lead scoring", "Send reminder notifications for scheduled calls", "Log call outcomes to CRM automatically"]
      - Input: "email management" → Intent: "Email organization and automation", Suggestions: ["Auto-categorize emails by sender or content", "Forward important emails to team members", "Create tasks from flagged emails", "Archive old emails automatically"]
      - Input: "social media" → Intent: "Social media management", Suggestions: ["Cross-post content across platforms", "Schedule posts at optimal times", "Monitor brand mentions and respond", "Generate weekly social media reports"]

      Make suggestions specific and actionable, focusing on common automation use cases.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from AI');
      }
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate the parsed response
        if (parsed.intent && Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
          return parsed;
        }
        throw new Error('Invalid response structure');
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Error in analyzeUserIntent:', error);
      // Fallback response with more context-aware suggestions
      return {
        intent: `Automation for "${trimmedQuery}"`,
        suggestions: [
          `Automate tasks related to ${trimmedQuery}`,
          `Set up notifications for ${trimmedQuery}`,
          `Create workflows for ${trimmedQuery}`,
          `Integrate ${trimmedQuery} with other systems`
        ],
        confidence: 0.6
      };
    }
  };

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Handle search query changes
  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(false);
    
    // Clear previous suggestions if query becomes too short
    if (!value.trim() || value.length < 3) {
      setIntentSuggestions(null);
      setIsAnalyzingIntent(false);
      return;
    }
    
    // Trigger intent analysis after user stops typing
    debouncedIntentAnalysis(value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setIntentSuggestions(null);
  };

  // Handle suggestion dismissal
  const handleSuggestionDismiss = () => {
    setShowSuggestions(false);
    setIntentSuggestions(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation for empty queries
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      alert('Please enter a description of what you want to automate.');
      return;
    }

    if (trimmedQuery.length < 3) {
      alert('Please enter at least 3 characters to describe your automation.');
      return;
    }

    setCurrentQuery(trimmedQuery);
    
    // Clear suggestions when starting workflow generation
    setShowSuggestions(false);
    setIntentSuggestions(null);

    // Check if query requires location
    if (requiresLocation(trimmedQuery)) {
      setViewState('loading');
      
      try {
        const location = await getUserLocation();
        setLocationData(location);
        
        // Brief delay to show location was obtained
        setTimeout(() => {
          setViewState('comprehensive-workflow');
        }, 1000);
      } catch (error) {
        console.error('Error getting location:', error);
        // Continue without location after brief delay
        setTimeout(() => {
          setViewState('comprehensive-workflow');
        }, 2000);
      }
    } else {
      setViewState('loading');
      
      // Route ALL queries to comprehensive workflow for structured workflow generation
      setTimeout(() => {
        setViewState('comprehensive-workflow');
      }, 2000);
    }
  };

  const handleStartOver = () => {
    setViewState('dashboard');
    setSearchQuery('');
    setCurrentQuery('');
    setLocationData(null);
  };

  const handleTemplateClick = (templateId: string) => {
    // Route ALL templates to comprehensive workflow
    const template = automationTemplates.find(t => t.id === templateId);
    setCurrentQuery(template ? template.title : `Use template: ${templateId}`);
    setViewState('comprehensive-workflow');
  };

  if (viewState === 'loading') {
    return (
      <div className="min-h-screen bg-pink-gradient">
        <div className="bg-pink-header">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                <span className="gradient-text">Creating Your Automation</span>
              </h2>
              <p className="text-lg text-gray-600">
                Analyzing: <span className="font-semibold text-pink-600">"{currentQuery}"</span>
              </p>
              {requiresLocation(currentQuery) && (
                <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600">
                  <MapPinIcon className="w-5 h-5" />
                  <span className="text-sm">Requesting location for enhanced results...</span>
                </div>
              )}
            </div>
            <LoadingAnimation />
          </div>
        </div>
      </div>
    );
  }

  if (viewState === 'comprehensive-workflow') {
    // Import and render the comprehensive workflow component
    return <ComprehensiveWorkflowDemo initialQuery={currentQuery} locationData={locationData} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background Image */}
      <div className="hero-background-section relative min-h-[600px] flex items-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/image.png)',
          }}
        />
        
        {/* Dark Overlay for Better Text Contrast */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        
        {/* Content Container */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Title Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                <span className="hero-gradient-text animate-text-shine drop-shadow-lg">
                  What would you like to automate?
                </span>
                <span className="ml-4 px-4 py-2 text-lg bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium border border-white/30 sparkle-container animate-pulse-glow">
                  AI beta
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto animate-fade-in leading-relaxed drop-shadow-md">
                Describe your automation needs in plain English and we'll help you build it
              </p>
            </div>
            
            {/* Enhanced Search Input */}
            <div className="flex justify-center">
              <form onSubmit={handleSearch} className="w-full max-w-5xl">
                <div className="relative group">
                  {/* Animated background glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/30 to-white/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-gradient-x"></div>
                  
                  <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-white/20 hover:border-white/40 focus-within:border-white/60 focus-within:shadow-white/25 focus-within:shadow-2xl transition-all duration-300 hero-search-container">
                    <div className="flex items-center pl-8 pr-4">
                      <SearchIcon className="w-7 h-7 text-gray-500 group-focus-within:text-pink-500 transition-colors duration-200" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Example: When I add a reaction to a Slack message, create a card in Trello..."
                      value={searchQuery}
                      onChange={handleSearchQueryChange}
                      className="hero-search-input flex-1 border-0 bg-transparent text-xl text-gray-800 placeholder:text-gray-500 focus:ring-0 focus:outline-none py-8 px-3"
                      required
                    />
                    <div className="pr-4">
                      <Button
                        type="submit"
                        size="lg"
                        className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-10 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 animate-pulse-glow text-lg"
                      >
                        <SendIcon className="w-6 h-6 mr-3" />
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Intent Analysis Suggestions - Positioned directly below input */}
                {(showSuggestions && intentSuggestions && intentSuggestions.suggestions.length > 0) && (
                  <div className="mt-4 animate-fade-in">
                    <Card className="bg-white/95 backdrop-blur-md border-2 border-pink-200 shadow-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                I think you want to automate: <span className="text-pink-600">{intentSuggestions.intent}</span>
                              </h3>
                            </div>
                          </div>
                          <button
                            onClick={handleSuggestionDismiss}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="grid gap-2">
                            {intentSuggestions.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-left p-3 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-purple-100 hover:border-pink-300 transition-all duration-200 group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 bg-pink-500 rounded-full group-hover:scale-125 transition-transform"></div>
                                  <span className="text-gray-700 group-hover:text-pink-700 transition-colors">
                                    {suggestion}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Loading indicator for intent analysis - Also positioned below input */}
                {isAnalyzingIntent && (
                  <div className="mt-4 animate-fade-in">
                    <Card className="bg-white/95 backdrop-blur-md border-2 border-pink-200 shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
                          <span className="text-gray-700">Analyzing your intent...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Helper Text */}
                <div className="text-center mt-8">
                  <p className="text-lg text-white/80 animate-fade-in drop-shadow-sm">
                    💡 Try: "Send me a Slack message when someone fills out my contact form" or "Find dentist near me"
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Start from Scratch Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Start from scratch</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {startFromScratchOptions.map((option, index) => (
              <Card
                key={index}
                className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/25 hover:scale-105 border-2 border-gray-200 hover:border-pink-400/50 bg-pink-card"
                onClick={() => {
                  if (option.title === 'Canvas') {
                    setCurrentQuery('Create an automated workflow');
                    setViewState('comprehensive-workflow');
                  }
                }}
              >
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-pink-50 rounded-xl group-hover:bg-pink-100 transition-colors duration-200 border border-pink-200">
                      {option.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg group-hover:text-pink-600 transition-colors duration-200">{option.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{option.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Popular Templates Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Popular templates</h2>
            <Button variant="ghost" className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 font-semibold">
              Browse all templates
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 mb-8 justify-center md:justify-start">
            {[
              { id: "for-you", label: "For you", icon: <StarIcon className="w-4 h-4" /> },
              { id: "ai-workflows", label: "AI Workflows", icon: <BotIcon className="w-4 h-4" /> },
              { id: "most-popular", label: "Most popular", icon: <TrendingUpIcon className="w-4 h-4" /> },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-500/25"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Templates Grid - Article Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((template) => (
              <article
                key={template.id}
                className="rounded-xl border-2 border-gray-100 bg-white group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/20 hover:scale-[1.02] hover:border-pink-400/50"
                onClick={() => handleTemplateClick(template.id)}
              >
                <div className="flex items-start gap-4 p-4 sm:p-6 lg:p-8">
                  <a href="#" className="block shrink-0">
                    <div className="size-14 rounded-lg bg-gray-50 group-hover:bg-pink-50 transition-colors duration-200 border border-gray-200 flex items-center justify-center">
                      {template.icon}
                    </div>
                  </a>

                  <div className="flex-1">
                    <h3 className="font-medium sm:text-lg">
                      <a href="#" className="hover:underline group-hover:text-pink-600 transition-colors duration-200">
                        {template.title}
                      </a>
                    </h3>

                    <p className="line-clamp-2 text-sm text-gray-700 leading-relaxed mt-2">
                      {template.description}
                    </p>

                    <div className="mt-4 sm:flex sm:items-center sm:gap-2">
                      <div className="flex items-center gap-1 text-gray-500">
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">
                          {template.category}
                        </span>
                      </div>

                      {template.isPopular && (
                        <>
                          <span className="hidden sm:block" aria-hidden="true">&middot;</span>
                          <p className="hidden sm:block sm:text-xs sm:text-pink-600 font-semibold">
                            Popular choice
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {template.isRecommended && (
                  <div className="flex justify-end">
                    <strong className="-me-[2px] -mb-[2px] inline-flex items-center gap-1 rounded-ss-xl rounded-ee-xl bg-yellow-500 px-3 py-1.5 text-white">
                      <StarIcon className="size-4 fill-current" />
                      <span className="text-[10px] font-medium sm:text-xs">Recommended</span>
                    </strong>
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* Get Started Card */}
          <Card className="mt-12 bg-pink-50 border-2 border-dashed border-pink-400/50 shadow-2xl shadow-pink-500/10">
            <CardContent className="p-12 text-center">
              <div className="max-w-lg mx-auto">
                <div className="mb-6">
                  <ZapIcon className="w-16 h-16 text-pink-500 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Get started with Ayra AI Automation
                </h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  We'll help you adopt an automation mindset and guide you through the necessary steps to get things up and running.
                </p>
                <Button 
                  className="bg-pink-500 hover:bg-pink-600 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-pink-500/25 transform hover:scale-105 transition-all duration-200"
                  onClick={() => {
                    setCurrentQuery('Get started with automation');
                    setViewState('comprehensive-workflow');
                  }}
                >
                  Get started
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};