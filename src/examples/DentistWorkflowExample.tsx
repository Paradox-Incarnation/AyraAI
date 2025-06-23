import React from 'react';
import { WorkflowCanvas } from '../components/WorkflowCanvas';
import { Card, CardContent } from '../components/ui/card';
import { SearchIcon, CheckCircleIcon, ZapIcon } from 'lucide-react';

interface WorkflowStep {
  stepNumber: number;
  functionName: string;
  task: string;
  duration: string;
  output: string;
}

export const DentistWorkflowExample: React.FC = () => {
  // Example workflow steps for "Find Dentist near me"
  const dentistWorkflowSteps: WorkflowStep[] = [
    {
      stepNumber: 1,
      functionName: "Gemini Search",
      task: "Search for dental practices in the user's local area using location-based queries and filter by ratings, availability, and services offered",
      duration: "3-4 seconds",
      output: "Comprehensive list of nearby dentists with contact information, ratings, specialties, and availability"
    }
  ];

  const userQuery = "Find dentist near me";
  const workflowTitle = "Local Dentist Finder Automation";

  return (
    <div className="min-h-screen bg-pink-gradient">
      {/* Simplified Header with only the user query block */}
      <div className="bg-pink-header">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-2xl border-2 border-pink-200 max-w-4xl mx-auto animate-slide-up">
              <p className="text-gray-700 leading-relaxed">
                <strong>User Query:</strong> "<span className="text-pink-600 font-semibold">{userQuery}</span>" - This automation uses Gemini Search to find local dental practices, 
                filter by ratings and availability, and provide comprehensive contact information and details.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Interactive Workflow Canvas */}
        <div className="mb-12">
          <WorkflowCanvas
            steps={dentistWorkflowSteps}
            userQuery={userQuery}
            title={workflowTitle}
          />
        </div>

        {/* Workflow Details with consistent theme */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Expected Benefits */}
          <Card className="bg-green-50 border-green-200 border-2 shadow-lg hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 animate-slide-up">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                Expected Benefits
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-700"><strong>Instant Access to Information:</strong> Quickly retrieve a list of local dentists without manual searching.</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-700"><strong>Comprehensive Details:</strong> Obtain essential contact information and locations for multiple dental practices in one go.</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-700"><strong>Time Savings:</strong> Eliminate the need to manually browse search engine results, saving several minutes of effort.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automation Flow Summary */}
          <Card className="bg-blue-50 border-blue-200 border-2 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 animate-slide-up">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <ZapIcon className="w-6 h-6 text-blue-500 mr-2" />
                Automation Flow Summary
              </h3>
              <p className="text-gray-700 leading-relaxed">
                This workflow executes a single, powerful step: utilizing Gemini Search to pinpoint and extract 
                information on dentists in the user's vicinity. The process is designed to be quick and efficient, 
                delivering a curated list of relevant dental services directly to the user.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Features Guide with pink theme */}
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 shadow-2xl shadow-pink-500/20 animate-slide-up">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              <span className="gradient-text">🎯 Interactive Canvas Features</span>
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                  <SearchIcon className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Hover Nodes</h4>
                <p className="text-sm text-gray-600">Hover over the Gemini Search node to see detailed explanations</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                  ▶️
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Execute Workflow</h4>
                <p className="text-sm text-gray-600">Click "Execute" to watch the workflow run with visual feedback</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                  📊
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Progress Tracking</h4>
                <p className="text-sm text-gray-600">Real-time progress bar and node status indicators</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
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
                <li>• <strong className="text-pink-600">Hover over the blue Gemini Search node</strong> → See detailed tooltip with context</li>
                <li>• <strong className="text-green-600">Click "Execute"</strong> → Watch the animated workflow execution</li>
                <li>• <strong className="text-purple-600">Observe the progress bar</strong> → Real-time execution feedback</li>
                <li>• <strong className="text-blue-600">Check the workflow stats</strong> → Node count, execution status, duration</li>
                <li>• <strong className="text-orange-600">Click "Reset"</strong> → Clear execution state and try again</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Back to Main App Button */}
        <div className="flex justify-center mt-12">
          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 border-0 shadow-2xl shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="text-center">
                <h4 className="text-white font-bold text-lg mb-2">Ready to Create Your Own?</h4>
                <p className="text-pink-100 text-sm mb-4">Experience the full Ayra AI automation platform</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="bg-white text-pink-600 px-6 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-colors duration-200 shadow-lg"
                >
                  <ZapIcon className="w-5 h-5 mr-2 inline" />
                  Go to Main Dashboard
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};