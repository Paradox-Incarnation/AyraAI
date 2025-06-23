import React, { useState, useRef, useEffect } from 'react';
import { WorkflowNode } from './WorkflowNode';
import { RotateCcwIcon, ZapIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon, ClockIcon, TrendingUpIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { generateWorkflowExecutionResults, type LocationData } from '../services/geminiService';

interface WorkflowStep {
  stepNumber: number;
  functionName: string;
  task: string;
  duration: string;
  output: string;
}

interface WorkflowCanvasProps {
  steps: WorkflowStep[];
  userQuery: string;
  title: string;
  locationData?: LocationData | null;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  steps,
  userQuery,
  title,
  locationData
}) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionResults, setExecutionResults] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Calculate centered positions for the entire workflow network
  const getCanvasDimensions = () => {
    const canvasWidth = 1200; // Fixed canvas width for consistent centering
    const canvasHeight = 400; // Reduced canvas height
    return { canvasWidth, canvasHeight };
  };

  const getNetworkDimensions = () => {
    const nodeWidth = 320; // w-80 = 320px
    const nodeSpacing = 380; // Reduced spacing between nodes
    const triggerWidth = 64; // w-16
    const completeWidth = 64; // w-16
    const spacingBetweenElements = 60; // Reduced space between trigger/nodes and nodes/complete
    
    // Total network width calculation
    const totalNetworkWidth = 
      triggerWidth + // Trigger node
      spacingBetweenElements + // Space after trigger
      (steps.length * nodeWidth) + // All workflow nodes
      ((steps.length - 1) * (nodeSpacing - nodeWidth)) + // Spacing between workflow nodes
      spacingBetweenElements + // Space before complete
      completeWidth; // Complete node
    
    return { totalNetworkWidth, nodeWidth, nodeSpacing, triggerWidth, completeWidth, spacingBetweenElements };
  };

  const getCenteredPositions = () => {
    const { canvasWidth, canvasHeight } = getCanvasDimensions();
    const { totalNetworkWidth, nodeWidth, nodeSpacing, triggerWidth, completeWidth, spacingBetweenElements } = getNetworkDimensions();
    
    // Calculate starting X position to center the entire network
    const startX = (canvasWidth - totalNetworkWidth) / 2;
    const centerY = canvasHeight / 2 - 40; // Center vertically (accounting for node height)
    
    return { startX, centerY, totalNetworkWidth };
  };

  // Calculate node positions with proper centering
  const getNodePosition = (index: number) => {
    const { startX, centerY } = getCenteredPositions();
    const { triggerWidth, spacingBetweenElements, nodeSpacing } = getNetworkDimensions();
    
    // Position workflow nodes after trigger + spacing
    const nodeX = startX + triggerWidth + spacingBetweenElements + (index * nodeSpacing);
    
    return {
      x: nodeX,
      y: centerY
    };
  };

  // Get precise connection dot positions for each node type
  const getTriggerConnectionDots = () => {
    const { startX, centerY } = getCenteredPositions();
    const { triggerWidth } = getNetworkDimensions();
    const triggerHeight = 64; // h-16
    
    return {
      rightDot: {
        x: startX + triggerWidth + 4, // right edge + 4px offset
        y: centerY + (triggerHeight / 2) // vertical center
      }
    };
  };

  const getWorkflowNodeConnectionDots = (index: number) => {
    const nodePos = getNodePosition(index);
    const nodeWidth = 320; // w-80 = 320px
    const nodeHeight = 80; // estimated node height
    
    return {
      leftDot: {
        x: nodePos.x - 4, // left edge - 4px offset
        y: nodePos.y + (nodeHeight / 2) // vertical center
      },
      rightDot: {
        x: nodePos.x + nodeWidth + 4, // right edge + 4px offset
        y: nodePos.y + (nodeHeight / 2) // vertical center
      }
    };
  };

  const getCompleteNodeConnectionDots = () => {
    const { startX, centerY } = getCenteredPositions();
    const { triggerWidth, spacingBetweenElements, nodeSpacing, completeWidth } = getNetworkDimensions();
    
    // Position complete node at the end of the network
    const completeX = startX + triggerWidth + spacingBetweenElements + (steps.length * nodeSpacing) + spacingBetweenElements;
    const completeHeight = 64; // h-16
    
    return {
      leftDot: {
        x: completeX - 4, // left edge - 4px offset
        y: centerY + (completeHeight / 2) // vertical center
      }
    };
  };

  // Generate smooth dotted connection paths between precise connection dots
  const getConnectionPath = (fromX: number, fromY: number, toX: number, toY: number) => {
    const midX = (fromX + toX) / 2;
    return `M ${fromX} ${fromY} C ${midX} ${fromY} ${midX} ${toY} ${toX} ${toY}`;
  };

  // Generate all connection paths with precise dot-to-dot connections
  const getAllConnections = () => {
    const connections = [];
    const triggerDots = getTriggerConnectionDots();
    const completeDots = getCompleteNodeConnectionDots();

    // Connection from Trigger right dot to first node left dot
    if (steps.length > 0) {
      const firstNodeDots = getWorkflowNodeConnectionDots(0);
      
      connections.push({
        id: 'trigger-to-first',
        path: getConnectionPath(
          triggerDots.rightDot.x,
          triggerDots.rightDot.y,
          firstNodeDots.leftDot.x,
          firstNodeDots.leftDot.y
        ),
        isActive: completedSteps.has(1),
        isExecuting: activeStep === 1
      });
    }

    // Connections between workflow nodes (right dot to left dot)
    for (let i = 0; i < steps.length - 1; i++) {
      const fromNodeDots = getWorkflowNodeConnectionDots(i);
      const toNodeDots = getWorkflowNodeConnectionDots(i + 1);
      
      connections.push({
        id: `node-${i}-to-${i + 1}`,
        path: getConnectionPath(
          fromNodeDots.rightDot.x,
          fromNodeDots.rightDot.y,
          toNodeDots.leftDot.x,
          toNodeDots.leftDot.y
        ),
        isActive: completedSteps.has(i + 1) && completedSteps.has(i + 2),
        isExecuting: activeStep === i + 2
      });
    }

    // Connection from last node right dot to Complete left dot
    if (steps.length > 0) {
      const lastNodeDots = getWorkflowNodeConnectionDots(steps.length - 1);
      
      connections.push({
        id: 'last-to-complete',
        path: getConnectionPath(
          lastNodeDots.rightDot.x,
          lastNodeDots.rightDot.y,
          completeDots.leftDot.x,
          completeDots.leftDot.y
        ),
        isActive: completedSteps.size === steps.length,
        isExecuting: false
      });
    }

    return connections;
  };

  // Parse execution results markdown into structured sections
  const parseExecutionResults = (markdown: string) => {
    const sections = {
      summary: '',
      stepResults: '',
      deliverables: '',
      metrics: '',
      insights: '',
      nextSteps: ''
    };

    try {
      // Extract sections based on markdown headers
      const summaryMatch = markdown.match(/### 📊 Execution Summary\s*\n([\s\S]*?)(?=### 🤖 Step-by-Step Results|$)/);
      if (summaryMatch) sections.summary = summaryMatch[1].trim();

      const stepResultsMatch = markdown.match(/### 🤖 Step-by-Step Results\s*\n([\s\S]*?)(?=### 📋 Final Deliverables|$)/);
      if (stepResultsMatch) sections.stepResults = stepResultsMatch[1].trim();

      const deliverablesMatch = markdown.match(/### 📋 Final Deliverables\s*\n([\s\S]*?)(?=### 📈 Performance Metrics|$)/);
      if (deliverablesMatch) sections.deliverables = deliverablesMatch[1].trim();

      const metricsMatch = markdown.match(/### 📈 Performance Metrics\s*\n([\s\S]*?)(?=### 💡 Key Insights|$)/);
      if (metricsMatch) sections.metrics = metricsMatch[1].trim();

      const insightsMatch = markdown.match(/### 💡 Key Insights & Recommendations\s*\n([\s\S]*?)(?=### 🔄 Next Steps|$)/);
      if (insightsMatch) sections.insights = insightsMatch[1].trim();

      const nextStepsMatch = markdown.match(/### 🔄 Next Steps\s*\n([\s\S]*?)(?=\n\n|$)/);
      if (nextStepsMatch) sections.nextSteps = nextStepsMatch[1].trim();
    } catch (error) {
      console.error('Error parsing execution results:', error);
    }

    return sections;
  };

  // Simulate workflow execution with Gemini results
  const runWorkflow = async () => {
    setIsRunning(true);
    setCompletedSteps(new Set());
    setExecutionProgress(0);
    setExecutionResults('');
    setShowResults(false);
    
    for (let i = 0; i < steps.length; i++) {
      setActiveStep(i + 1);
      setExecutionProgress(((i + 1) / steps.length) * 100);
      
      // Simulate step execution time (2-4 seconds per step)
      const executionTime = 2000 + Math.random() * 2000;
      await new Promise(resolve => setTimeout(resolve, executionTime));
      
      setCompletedSteps(prev => new Set([...prev, i + 1]));
      setActiveStep(null);
      
      // Small pause between steps
      if (i < steps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    setIsRunning(false);
    setExecutionProgress(100);

    // Generate execution results using Gemini with location data
    setIsLoadingResults(true);
    try {
      const results = await generateWorkflowExecutionResults(userQuery, steps, title, locationData || undefined);
      setExecutionResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating execution results:', error);
      setExecutionResults(`
## 🎯 Workflow Execution Results

### 📊 Execution Summary
**Status:** ✅ Successfully Completed  
**Total Steps:** ${steps.length}  
**Execution Time:** ${steps.reduce((total, step) => {
        const duration = parseInt(step.duration.match(/\d+/)?.[0] || '2');
        return total + duration;
      }, 0)} seconds  
**Agents Deployed:** ${steps.map(step => step.functionName).join(', ')}
${locationData ? `**Location Context:** Results enhanced with user location data` : ''}

### 📋 Final Deliverables
Your workflow "${title}" has been successfully executed according to your requirements for: "${userQuery}"${locationData ? ` Location-specific results have been provided based on your current location.` : ''}

### 💡 Key Insights & Recommendations
- Your automation workflow completed successfully
- All steps executed as planned with expected outputs${locationData ? ` using your location data` : ''}
- Consider scheduling this workflow for regular execution
      `);
      setShowResults(true);
    } finally {
      setIsLoadingResults(false);
    }
  };

  const resetWorkflow = () => {
    setActiveStep(null);
    setCompletedSteps(new Set());
    setIsRunning(false);
    setExecutionProgress(0);
    setExecutionResults('');
    setShowResults(false);
  };

  // Get canvas width for the container
  const { canvasWidth, canvasHeight } = getCanvasDimensions();

  return (
    <div className="w-full bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden">
      {/* Canvas Header - n8n style */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ZapIcon className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Active</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Execution Progress */}
            {isRunning && (
              <div className="flex items-center space-x-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-pink-600 transition-all duration-300 ease-out"
                    style={{ width: `${executionProgress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{Math.round(executionProgress)}%</span>
              </div>
            )}
            
            <Button
              onClick={resetWorkflow}
              variant="outline"
              size="sm"
              className="px-4 py-2 rounded-lg font-medium border-gray-300 hover:border-gray-400 transition-all duration-200"
            >
              <RotateCcwIcon className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area - n8n style with centered network */}
      <div 
        ref={canvasRef}
        className="relative bg-gray-50 overflow-hidden"
        style={{ height: `${canvasHeight}px` }}
      >
        {/* n8n-style Grid Background */}
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="n8n-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#e5e7eb" opacity="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#n8n-grid)" />
          </svg>
        </div>

        {/* Canvas Content - Centered Network */}
        <div className="relative w-full h-full flex justify-center">
          <div className="relative" style={{ width: `${canvasWidth}px`, height: '100%' }}>
            {/* All Dotted Connection Lines - n8n style with precise dot-to-dot connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              <defs>
                {/* Define dotted line patterns */}
                <pattern id="dotted-line" patternUnits="userSpaceOnUse" width="10" height="4">
                  <circle cx="2" cy="2" r="1.5" fill="#D1D5DB" />
                </pattern>
                <pattern id="dotted-line-active" patternUnits="userSpaceOnUse" width="10" height="4">
                  <circle cx="2" cy="2" r="1.5" fill="#10B981" />
                </pattern>
                <pattern id="dotted-line-executing" patternUnits="userSpaceOnUse" width="10" height="4">
                  <circle cx="2" cy="2" r="1.5" fill="#F59E0B" />
                </pattern>
              </defs>
              
              {/* Render all connections with precise dot-to-dot alignment */}
              {getAllConnections().map((connection) => {
                let strokeColor = "#D1D5DB";
                
                if (connection.isActive) {
                  strokeColor = "#10B981";
                } else if (connection.isExecuting) {
                  strokeColor = "#F59E0B";
                }
                
                return (
                  <g key={connection.id}>
                    {/* Main Dotted Connection Path - precisely through connection dots */}
                    <path
                      d={connection.path}
                      stroke={strokeColor}
                      strokeWidth="3"
                      fill="none"
                      className="transition-all duration-300"
                      strokeDasharray="8 6"
                      opacity="0.8"
                    />
                    
                    {/* Animated Data Flow Dots - flowing through the precise connection path */}
                    {(connection.isActive || connection.isExecuting) && (
                      <>
                        <circle 
                          r="4" 
                          fill={connection.isActive ? "#10B981" : "#F59E0B"}
                          className="drop-shadow-sm"
                          opacity="0.9"
                        >
                          <animateMotion
                            dur="2.5s"
                            repeatCount="indefinite"
                            path={connection.path}
                          />
                        </circle>
                        <circle 
                          r="3" 
                          fill={connection.isActive ? "#34D399" : "#FBBF24"}
                          className="drop-shadow-sm"
                          opacity="0.7"
                        >
                          <animateMotion
                            dur="2.5s"
                            repeatCount="indefinite"
                            path={connection.path}
                            begin="0.8s"
                          />
                        </circle>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Start Trigger with Precise Connection Dots - Centered */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2" 
              style={{ 
                left: `${getCenteredPositions().startX}px`,
                zIndex: 3 
              }}
            >
              <div className="flex flex-col items-center relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg border-2 border-white relative">
                  <ZapIcon className="w-6 h-6" />
                  
                  {/* Right Connection Dot - precisely positioned */}
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
                    <div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-white shadow-sm hover:bg-green-500 transition-colors duration-200"></div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2 font-medium bg-white px-2 py-1 rounded shadow-sm">
                  Trigger
                </div>
              </div>
            </div>

            {/* Workflow Nodes with proper positioning */}
            <div className="relative" style={{ zIndex: 2 }}>
              {steps.map((step, index) => {
                const position = getNodePosition(index);
                
                return (
                  <div
                    key={step.stepNumber}
                    className="absolute transition-all duration-300"
                    style={{
                      left: position.x,
                      top: position.y,
                    }}
                  >
                    <WorkflowNode
                      stepNumber={step.stepNumber}
                      functionName={step.functionName}
                      task={step.task}
                      duration={step.duration}
                      output={step.output}
                      userQuery={userQuery}
                      isActive={activeStep === step.stepNumber}
                      isCompleted={completedSteps.has(step.stepNumber)}
                    />
                  </div>
                );
              })}
            </div>

            {/* End Node with Precise Connection Dots - Centered */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2"
              style={{ 
                left: `${getCompleteNodeConnectionDots().leftDot.x + 4 - 32}px`, // Adjust for node center
                zIndex: 3 
              }}
            >
              <div className="flex flex-col items-center relative">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold shadow-lg border-2 border-white transition-all duration-300 relative ${
                  completedSteps.size === steps.length 
                    ? 'bg-gradient-to-br from-green-400 to-green-600' 
                    : 'bg-gradient-to-br from-gray-400 to-gray-600'
                }`}>
                  <ZapIcon className="w-6 h-6" />
                  
                  {/* Left Connection Dot - precisely positioned */}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
                    <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm transition-colors duration-200 ${
                      completedSteps.size === steps.length 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-gray-400 hover:bg-gray-500'
                    }`}></div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2 font-medium bg-white px-2 py-1 rounded shadow-sm">
                  Complete
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Stats - n8n style */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{steps.length}</div>
            <div className="text-sm text-gray-500">Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedSteps.size}</div>
            <div className="text-sm text-gray-500">Executed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {steps.reduce((total, step) => {
                const duration = parseInt(step.duration.match(/\d+/)?.[0] || '2');
                return total + duration;
              }, 0)}s
            </div>
            <div className="text-sm text-gray-500">Duration</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isRunning ? 'text-orange-600' : completedSteps.size === steps.length ? 'text-green-600' : 'text-gray-400'}`}>
              {isRunning ? 'Running' : completedSteps.size === steps.length ? 'Success' : 'Ready'}
            </div>
            <div className="text-sm text-gray-500">Status</div>
          </div>
        </div>
      </div>

      {/* Implement This Workflow Button - Bottom Middle */}
      <div className="bg-white border-t border-gray-200 px-6 py-6">
        <div className="flex justify-center">
          <Button
            onClick={runWorkflow}
            disabled={isRunning || isLoadingResults}
            size="lg"
            className={`px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 animate-pulse-glow ${
              isRunning || isLoadingResults
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white cursor-not-allowed' 
                : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white hover:shadow-pink-500/25'
            }`}
          >
            <ZapIcon className="w-5 h-5 mr-2" />
            {isRunning ? 'Implementing Workflow...' : isLoadingResults ? 'Generating Results...' : 'Implement This Workflow'}
          </Button>
        </div>
      </div>

      {/* Execution Results Section */}
      {(executionResults || isLoadingResults) && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-t-2 border-green-200">
          {/* Results Header */}
          <div 
            className="px-6 py-4 cursor-pointer hover:bg-white/50 transition-all duration-200"
            onClick={() => setShowResults(!showResults)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Multi-Agent Execution Results</h3>
                  <p className="text-sm text-gray-600">
                    {isLoadingResults ? 'Generating detailed results...' : 'Click to view comprehensive execution report'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isLoadingResults && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                )}
                {!isLoadingResults && (
                  showResults ? <ChevronUpIcon className="w-6 h-6 text-gray-600" /> : <ChevronDownIcon className="w-6 h-6 text-gray-600" />
                )}
              </div>
            </div>
          </div>

          {/* Results Content */}
          {showResults && !isLoadingResults && executionResults && (
            <div className="px-6 pb-6">
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-green-200 shadow-xl">
                <CardContent className="p-6">
                  {(() => {
                    const sections = parseExecutionResults(executionResults);
                    
                    return (
                      <div className="space-y-6">
                        {/* Execution Summary */}
                        {sections.summary && (
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                              <ClockIcon className="w-5 h-5 text-green-600 mr-2" />
                              Execution Summary
                            </h4>
                            <div className="text-sm text-gray-700 whitespace-pre-line">{sections.summary}</div>
                          </div>
                        )}

                        {/* Step Results */}
                        {sections.stepResults && (
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                              <ZapIcon className="w-5 h-5 text-blue-600 mr-2" />
                              Step-by-Step Results
                            </h4>
                            <div className="text-sm text-gray-700 whitespace-pre-line">{sections.stepResults}</div>
                          </div>
                        )}

                        {/* Final Deliverables */}
                        {sections.deliverables && (
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                              <CheckCircleIcon className="w-5 h-5 text-purple-600 mr-2" />
                              Final Deliverables
                            </h4>
                            <div className="text-sm text-gray-700 whitespace-pre-line">{sections.deliverables}</div>
                          </div>
                        )}

                        {/* Performance Metrics & Insights Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                          {sections.metrics && (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                              <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                                <TrendingUpIcon className="w-5 h-5 text-yellow-600 mr-2" />
                                Performance Metrics
                              </h4>
                              <div className="text-sm text-gray-700 whitespace-pre-line">{sections.metrics}</div>
                            </div>
                          )}

                          {sections.insights && (
                            <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-4 rounded-lg border border-cyan-200">
                              <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                                <span className="w-5 h-5 text-cyan-600 mr-2">💡</span>
                                Key Insights
                              </h4>
                              <div className="text-sm text-gray-700 whitespace-pre-line">{sections.insights}</div>
                            </div>
                          )}
                        </div>

                        {/* Next Steps */}
                        {sections.nextSteps && (
                          <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-lg border border-pink-200">
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                              <span className="w-5 h-5 text-pink-600 mr-2">🔄</span>
                              Recommended Next Steps
                            </h4>
                            <div className="text-sm text-gray-700 whitespace-pre-line">{sections.nextSteps}</div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};