import React from 'react';
import { WorkflowDiagram } from '../components/WorkflowDiagram';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  CheckCircleIcon, 
  ZapIcon, 
  SearchIcon, 
  TrendingUpIcon,
  ClockIcon,
  DollarSignIcon,
  UsersIcon,
  MapPinIcon
} from 'lucide-react';

export const ComprehensiveDentistWorkflow: React.FC = () => {
  const userQuery = "Find dentist near me";
  const workflowTitle = "Comprehensive Dentist Finder Automation";
  const workflowDescription = "AI-powered dental practice discovery with intelligent filtering and ranking";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <SearchIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Advanced Workflow Automation
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
              Experience a comprehensive workflow diagram with decision nodes, parallel processing, 
              error handling, and real-time execution monitoring for: 
              <span className="font-semibold text-white"> "{userQuery}"</span>
            </p>
            
            {/* Key Features */}
            <div className="grid md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUpIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Smart Filtering</h3>
                <p className="text-purple-100 text-sm">AI-powered result ranking and filtering</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPinIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Location-Based</h3>
                <p className="text-purple-100 text-sm">Precise geographic search and distance calculation</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Real-time</h3>
                <p className="text-purple-100 text-sm">Live execution monitoring and progress tracking</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">User-Centric</h3>
                <p className="text-purple-100 text-sm">Personalized results based on preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Comprehensive Workflow Diagram */}
        <div className="mb-12">
          <WorkflowDiagram
            title={workflowTitle}
            description={workflowDescription}
            userQuery={userQuery}
          />
        </div>

        {/* Advanced Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Workflow Architecture */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <ZapIcon className="w-6 h-6 text-purple-500 mr-2" />
                Advanced Architecture
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-700"><strong>Decision Nodes:</strong> Intelligent branching based on search results and conditions</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-700"><strong>Error Handling:</strong> Graceful fallbacks when no results are found</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-700"><strong>Parallel Processing:</strong> Concurrent validation and search operations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Features */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <SearchIcon className="w-6 h-6 text-blue-500 mr-2" />
                Interactive Features
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-700"><strong>Hover Tooltips:</strong> Detailed node information with resource requirements</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-700"><strong>Accordion Panels:</strong> Expandable sections for workflow details</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-700"><strong>Real-time Stats:</strong> Live execution progress and performance metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-lg hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <TrendingUpIcon className="w-6 h-6 text-green-500 mr-2" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">9</div>
                  <div className="text-sm text-gray-600">Total Nodes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">$0.10</div>
                  <div className="text-sm text-gray-600">Est. Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">6-8s</div>
                  <div className="text-sm text-gray-600">Execution</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technical Specifications */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 shadow-xl mb-12">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Technical Specifications
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-4">
                  <ZapIcon className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Node Types</h4>
                <p className="text-sm text-gray-600">Start, End, Task, Decision nodes with unique properties</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-4">
                  <TrendingUpIcon className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Edge Connections</h4>
                <p className="text-sm text-gray-600">Conditional transitions with animated flow indicators</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-4">
                  <ClockIcon className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Real-time Execution</h4>
                <p className="text-sm text-gray-600">Live progress tracking with status indicators</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-4">
                  <DollarSignIcon className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Cost Analysis</h4>
                <p className="text-sm text-gray-600">Detailed resource and cost estimation per node</p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3">
                🎯 Advanced Interaction Guide:
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong className="text-purple-600">Expand Accordions</strong> → Click section headers to view detailed information</li>
                <li>• <strong className="text-blue-600">Hover Nodes</strong> → See comprehensive tooltips with resources and parameters</li>
                <li>• <strong className="text-green-600">Execute Workflow</strong> → Watch real-time execution with progress tracking</li>
                <li>• <strong className="text-orange-600">Monitor Stats</strong> → View live execution statistics and performance metrics</li>
                <li>• <strong className="text-red-600">Reset & Replay</strong> → Clear state and run multiple execution cycles</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            size="lg"
            className="px-8 py-3 border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 font-semibold rounded-xl transform hover:scale-105 transition-all duration-200"
          >
            Back to Dashboard
          </Button>
          
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            Save Workflow Template
          </Button>
        </div>
      </div>
    </div>
  );
};