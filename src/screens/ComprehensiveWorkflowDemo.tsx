import React, { useState, useEffect } from 'react';
import { WorkflowCanvas } from '../components/WorkflowCanvas';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { SearchIcon, CheckCircleIcon, ZapIcon, MapPinIcon, XCircleIcon } from 'lucide-react';
import { LoadingAnimation } from '../components/LoadingAnimation';
import { generateStructuredWorkflow, requiresLocation, getUserLocation, type WorkflowData, type LocationData } from '../services/geminiService';

interface ComprehensiveWorkflowDemoProps {
  initialQuery?: string;
  locationData?: LocationData | null;
}

export const ComprehensiveWorkflowDemo: React.FC<ComprehensiveWorkflowDemoProps> = ({ initialQuery = '', locationData: initialLocationData = null }) => {
  const [userQuery, setUserQuery] = useState<string>(initialQuery);
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [locationData, setLocationData] = useState<LocationData | null>(initialLocationData);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  // Auto-generate workflow if initial query is provided
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleGenerateWorkflow();
    }
  }, [initialQuery]);

  // Update locationData when initialLocationData changes
  useEffect(() => {
    if (initialLocationData) {
      setLocationData(initialLocationData);
    }
  }, [initialLocationData]);

  const requestLocationAndGenerate = async (query: string) => {
    setIsGettingLocation(true);
    setLocationDenied(false);
    
    try {
      const location = await getUserLocation();
      setLocationData(location);
      setShowLocationPrompt(false);
      
      // Now generate workflow with location
      await generateWorkflowWithLocation(query, location);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationDenied(true);
      setIsGettingLocation(false);
      
      // Generate workflow without location after short delay
      setTimeout(() => {
        setShowLocationPrompt(false);
        generateWorkflowWithLocation(query, null);
      }, 1500);
    }
  };

  const generateWorkflowWithLocation = async (query: string, location: LocationData | null) => {
    setIsLoading(true);
    setError('');
    setWorkflowData(null);
    setIsGettingLocation(false);

    try {
      const data = await generateStructuredWorkflow(query, location || undefined);
      setWorkflowData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the workflow.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateWorkflow = async () => {
    const query = userQuery.trim();
    if (!query) {
      setError('Please enter a task or workflow to automate.');
      return;
    }

    // Check if query requires location
    if (requiresLocation(query)) {
      setShowLocationPrompt(true);
      return;
    }

    // Generate workflow without location
    await generateWorkflowWithLocation(query, null);
  };

  const handleSkipLocation = () => {
    setShowLocationPrompt(false);
    generateWorkflowWithLocation(userQuery.trim(), null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && !showLocationPrompt) {
      handleGenerateWorkflow();
    }
  };

  // Location Permission Modal
  if (showLocationPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-20">
        <div className="max-w-2xl mx-auto px-6">
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-200 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPinIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Location Access Needed</h2>
                <p className="text-gray-600 leading-relaxed">
                  Your query "<span className="font-semibold text-blue-600">{userQuery}</span>" appears to need location information. 
                  Would you like to share your location for more accurate results?
                </p>
              </div>

              {isGettingLocation && (
                <div className="mb-6">
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Getting your location...</span>
                  </div>
                </div>
              )}

              {locationDenied && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 text-orange-700">
                    <XCircleIcon className="w-5 h-5" />
                    <span className="text-sm">Location access denied. Continuing without location...</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => requestLocationAndGenerate(userQuery.trim())}
                  disabled={isGettingLocation}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  {isGettingLocation ? 'Getting Location...' : 'Allow Location'}
                </Button>
                
                <Button
                  onClick={handleSkipLocation}
                  disabled={isGettingLocation}
                  variant="outline"
                  className="px-6 py-3 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 font-semibold rounded-xl transform hover:scale-105 transition-all duration-200"
                >
                  Skip Location
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Location data is only used to enhance your automation results and is not stored.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create Your Automation
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Describe what you want to automate, and we'll create an interactive workflow for you
          </p>
        </div>

        {/* Input Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-pink-200 shadow-2xl shadow-pink-500/20 mb-12">
          <CardContent className="p-8">
            <div className="flex flex-col space-y-4">
              <label htmlFor="workflow-input" className="text-lg font-semibold text-gray-700">
                What would you like to automate?
              </label>
              
              <div className="flex gap-4">
                <Input
                  id="workflow-input"
                  type="text"
                  placeholder="e.g., 'Find dentists near me', 'Send me daily weather updates', 'Schedule meetings with my team'"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="text-lg py-6 px-6 border-2 border-gray-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 rounded-xl bg-white/90"
                />
                
                <Button
                  onClick={handleGenerateWorkflow}
                  disabled={isLoading || !userQuery.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-6 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 whitespace-nowrap"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <SearchIcon className="w-5 h-5 mr-2" />
                      Generate Workflow
                    </>
                  )}
                </Button>
              </div>

              {/* Location Status */}
              {locationData && (
                <div className="flex items-center justify-center space-x-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                  <MapPinIcon className="w-4 h-4" />
                  <span>Location: {locationData.address || `${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`}</span>
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Example Queries */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">💡 Try these examples:</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  "Find dentists near me",
                  "Schedule a meeting with my team",
                  "Research competitors in my industry",
                  "Send me daily weather updates",
                  "Find restaurants and make reservations",
                  "Monitor my website uptime"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setUserQuery(example)}
                    className="p-3 text-left bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-purple-100 hover:border-pink-300 transition-all duration-200 text-sm text-gray-700"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="mb-12">
            <LoadingAnimation />
          </div>
        )}

        {/* Workflow Display Section */}
        {workflowData && (
          <>
            {/* Interactive Workflow Canvas */}
            <div className="mb-12">
              <WorkflowCanvas
                steps={workflowData.steps}
                userQuery={userQuery}
                title={workflowData.title}
                locationData={locationData}
              />
            </div>

            {/* Workflow Details */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Expected Benefits */}
              <Card className="bg-green-50 border-green-200 border-2 shadow-lg hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                    Expected Benefits
                  </h3>
                  <div className="space-y-3">
                    {workflowData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <p className="text-gray-700">{benefit}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Automation Flow Summary */}
              <Card className="bg-blue-50 border-blue-200 border-2 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <ZapIcon className="w-6 h-6 text-blue-500 mr-2" />
                    Automation Flow Summary
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {workflowData.flowSummary}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Workflow Overview */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 shadow-xl mb-8">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                  <span className="gradient-text">📋 Workflow Overview</span>
                </h3>
                <p className="text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
                  {workflowData.overview}
                </p>
              </CardContent>
            </Card>

            {/* Interactive Features Guide */}
            <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 shadow-2xl shadow-pink-500/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  <span className="gradient-text">🎮 Interactive Canvas Features</span>
                </h3>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <SearchIcon className="w-8 h-8" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Hover Nodes</h4>
                    <p className="text-sm text-gray-600">Hover over workflow nodes to see detailed explanations</p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      ▶️
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Execute Workflow</h4>
                    <p className="text-sm text-gray-600">Click "Execute" to watch the workflow run with visual feedback</p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      📊
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Progress Tracking</h4>
                    <p className="text-sm text-gray-600">Real-time progress bar and node status indicators</p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      🔄
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Reset & Replay</h4>
                    <p className="text-sm text-gray-600">Reset the workflow and run it multiple times</p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-white/70 rounded-xl border border-pink-200 backdrop-blur-sm">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                    <span className="gradient-text">💡 Try These Interactions:</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• <strong className="text-pink-600">Hover over the workflow nodes</strong> → See detailed tooltips with context</li>
                    <li>• <strong className="text-green-600">Click "Execute"</strong> → Watch the animated workflow execution</li>
                    <li>• <strong className="text-purple-600">Observe the progress bar</strong> → Real-time execution feedback</li>
                    <li>• <strong className="text-blue-600">Check the workflow stats</strong> → Node count, execution status, duration</li>
                    <li>• <strong className="text-orange-600">Click "Reset"</strong> → Clear execution state and try again</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Back to Main App Button */}
        <div className="text-center mt-12 mb-8">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="lg"
            className="px-8 py-3 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 font-semibold rounded-xl transform hover:scale-105 transition-all duration-200"
          >
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};