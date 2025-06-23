import React from 'react';
import { CheckCircleIcon, ZapIcon, AlertCircleIcon, PlayIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { WorkflowCanvas } from './WorkflowCanvas';

interface ResponseDisplayProps {
  response: string;
  userQuery: string;
  onStartOver: () => void;
}

interface WorkflowStep {
  stepNumber: number;
  functionName: string;
  task: string;
  duration: string;
  output: string;
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ 
  response, 
  userQuery, 
  onStartOver 
}) => {
  // Check if the response indicates an invalid input
  const isInvalidInput = response.includes("It seems like you're just saying hello!") || 
                         response.includes("I'd love to help you create an automation! Could you be more specific");

  // Parse the response to extract workflow information
  const parseWorkflowFromResponse = (text: string): {
    title: string;
    overview: string;
    steps: WorkflowStep[];
    benefits: string[];
    summary: string;
  } => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    let title = 'Custom Automation Workflow';
    let overview = '';
    let steps: WorkflowStep[] = [];
    let benefits: string[] = [];
    let summary = '';
    
    let currentSection = '';
    let currentStep: Partial<WorkflowStep> = {};
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        title = line.replace('## ', '').replace(/🤖|⚡|🔧/g, '').trim();
      } else if (line.startsWith('### 📋 Workflow Overview')) {
        currentSection = 'overview';
      } else if (line.startsWith('### ⚡ Automation Steps')) {
        currentSection = 'steps';
      } else if (line.startsWith('### 🎯 Expected Benefits')) {
        currentSection = 'benefits';
      } else if (line.startsWith('### 🔄 Automation Flow Summary')) {
        currentSection = 'summary';
      } else if (line.startsWith('**Step ') && line.includes(':**')) {
        // Save previous step if exists
        if (currentStep.stepNumber) {
          steps.push({
            stepNumber: currentStep.stepNumber,
            functionName: currentStep.functionName || '',
            task: currentStep.task || '',
            duration: currentStep.duration || '',
            output: currentStep.output || ''
          });
        }
        
        // Start new step
        const stepMatch = line.match(/\*\*Step (\d+): (.+)\*\*/);
        if (stepMatch) {
          currentStep = {
            stepNumber: parseInt(stepMatch[1]),
            functionName: stepMatch[2]
          };
        }
      } else if (line.startsWith('🔧 **Function:**')) {
        currentStep.functionName = line.replace('🔧 **Function:**', '').trim();
      } else if (line.startsWith('📝 **Task:**')) {
        currentStep.task = line.replace('📝 **Task:**', '').trim();
      } else if (line.startsWith('⏱️ **Duration:**')) {
        currentStep.duration = line.replace('⏱️ **Duration:**', '').trim();
      } else if (line.startsWith('✅ **Output:**')) {
        currentStep.output = line.replace('✅ **Output:**', '').trim();
      } else if (line.startsWith('- ') && currentSection === 'benefits') {
        benefits.push(line.replace('- ', '').replace(/⏰|🔄|📊/g, '').trim());
      } else if (currentSection === 'overview' && !line.startsWith('#') && !line.startsWith('**')) {
        overview += line + ' ';
      } else if (currentSection === 'summary' && !line.startsWith('#') && !line.startsWith('**')) {
        summary += line + ' ';
      }
    }
    
    // Add the last step
    if (currentStep.stepNumber) {
      steps.push({
        stepNumber: currentStep.stepNumber,
        functionName: currentStep.functionName || '',
        task: currentStep.task || '',
        duration: currentStep.duration || '',
        output: currentStep.output || ''
      });
    }
    
    return { title, overview: overview.trim(), steps, benefits, summary: summary.trim() };
  };

  const workflowData = !isInvalidInput ? parseWorkflowFromResponse(response) : null;

  if (isInvalidInput) {
    return (
      <div className="min-h-screen bg-pink-gradient">
        <div className="bg-pink-header">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <AlertCircleIcon className="w-12 h-12 text-orange-500 mr-3" />
                <h2 className="text-3xl font-bold text-gray-800">Need More Details</h2>
              </div>
              <p className="text-lg text-gray-600">
                Let's get more specific about what you'd like to automate
              </p>
            </div>

            <Card className="bg-orange-50 border-orange-200 shadow-2xl border-2 mb-8 animate-slide-up">
              <CardContent className="p-8">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {response}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button
                onClick={onStartOver}
                variant="outline"
                size="lg"
                className="px-8 py-3 border-2 border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400 font-semibold rounded-xl transform hover:scale-105 transition-all duration-200"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-gradient">
      {/* Header with User Query */}
      <div className="bg-pink-header">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mr-3" />
              <h2 className="text-3xl font-bold text-gray-800">
                <span className="gradient-text">Automation Created!</span>
              </h2>
            </div>
            <p className="text-lg text-gray-600 mb-6">
              Here's your custom automation workflow for: <span className="font-semibold text-pink-600">"{userQuery}"</span>
            </p>
            
            {/* Workflow Overview */}
            {workflowData && workflowData.overview && (
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-2xl border-2 border-pink-200 max-w-4xl mx-auto animate-slide-up">
                <p className="text-gray-700 leading-relaxed">
                  {workflowData.overview}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Interactive n8n-style Workflow Canvas - CENTERED */}
        {workflowData && workflowData.steps.length > 0 && (
          <div className="mb-12 animate-slide-up">
            <WorkflowCanvas
              steps={workflowData.steps}
              userQuery={userQuery}
              title={workflowData.title}
            />
          </div>
        )}

        {/* Benefits and Summary Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Benefits Section */}
          {workflowData && workflowData.benefits.length > 0 && (
            <Card className="bg-green-50 border-green-200 border-2 shadow-lg hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 animate-slide-up">
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
          )}

          {/* Summary */}
          {workflowData && workflowData.summary && (
            <Card className="bg-blue-50 border-blue-200 border-2 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 animate-slide-up">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <ZapIcon className="w-6 h-6 text-blue-500 mr-2" />
                  Automation Flow Summary
                </h3>
                <p className="text-gray-700 leading-relaxed">{workflowData.summary}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Interactive Features Guide */}
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 shadow-2xl shadow-pink-500/20 mb-12 animate-slide-up">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              <span className="gradient-text">🎯 Interactive Canvas Features</span>
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                  🔍
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Hover Nodes</h4>
                <p className="text-sm text-gray-600">Hover over workflow nodes to see detailed explanations</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                  ▶️
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Execute Workflow</h4>
                <p className="text-sm text-gray-600">Click "Implement This Workflow" to watch the execution</p>
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
                <li>• <strong className="text-pink-600">Hover over workflow nodes</strong> → See detailed tooltips with context</li>
                <li>• <strong className="text-green-600">Click "Implement This Workflow"</strong> → Watch the animated execution</li>
                <li>• <strong className="text-purple-600">Observe the progress bar</strong> → Real-time execution feedback</li>
                <li>• <strong className="text-blue-600">Check the workflow stats</strong> → Node count, execution status, duration</li>
                <li>• <strong className="text-orange-600">Click "Reset"</strong> → Clear execution state and try again</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
          <Button
            onClick={onStartOver}
            variant="outline"
            size="lg"
            className="px-8 py-3 border-2 border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400 font-semibold rounded-xl transform hover:scale-105 transition-all duration-200"
          >
            Create Another Automation
          </Button>
          
          <Button
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 animate-pulse-glow"
          >
            <ZapIcon className="w-5 h-5 mr-2" />
            Save This Automation
          </Button>
        </div>
      </div>
    </div>
  );
};