import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  PlayIcon, 
  PauseIcon, 
  RotateCcwIcon, 
  ZapIcon,
  SearchIcon,
  PhoneIcon,
  MessageSquareIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DollarSignIcon,
  InfoIcon,
  AlertTriangleIcon,
  Settings2Icon,
  BarChart3Icon
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'task' | 'decision';
  label: string;
  description: string;
  position: { x: number; y: number };
  properties: {
    functionName?: string;
    task?: string;
    duration?: string;
    cost?: string;
    resources?: string[];
    inputParameters?: Record<string, any>;
    outputParameters?: Record<string, any>;
    conditions?: string[];
  };
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
  label?: string;
  animated: boolean;
}

interface WorkflowDiagramProps {
  title: string;
  description: string;
  userQuery: string;
}

export const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({
  title,
  description,
  userQuery
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [expandedAccordions, setExpandedAccordions] = useState<Set<string>>(new Set(['overview']));
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [executionProgress, setExecutionProgress] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Comprehensive workflow nodes for dentist finder
  const nodes: WorkflowNode[] = [
    {
      id: 'start',
      type: 'start',
      label: 'Start',
      description: 'User initiates dentist search',
      position: { x: 100, y: 200 },
      properties: {
        inputParameters: { userQuery, location: 'auto-detect' },
        duration: '0s',
        cost: '$0.00'
      },
      status: 'completed'
    },
    {
      id: 'validate-input',
      type: 'decision',
      label: 'Validate Input',
      description: 'Check if location and search criteria are valid',
      position: { x: 300, y: 200 },
      properties: {
        conditions: [
          'Location detected successfully',
          'Search query is not empty',
          'User preferences are valid'
        ],
        duration: '0.5s',
        cost: '$0.01',
        resources: ['Input Validator', 'Location Service']
      },
      status: 'pending'
    },
    {
      id: 'gemini-search',
      type: 'task',
      label: 'Gemini Search',
      description: 'Search for dental practices using AI-powered search',
      position: { x: 500, y: 150 },
      properties: {
        functionName: 'Gemini Search',
        task: 'Search for dental practices in the user\'s local area using location-based queries and filter by ratings, availability, and services offered',
        duration: '3-4s',
        cost: '$0.05',
        resources: ['Gemini AI API', 'Location Database', 'Business Directory'],
        inputParameters: {
          query: userQuery,
          location: 'user-location',
          filters: ['ratings > 4.0', 'accepting-patients', 'insurance-accepted']
        },
        outputParameters: {
          dentistList: 'Array<DentistInfo>',
          totalFound: 'number',
          searchMetadata: 'SearchResults'
        }
      },
      status: 'pending'
    },
    {
      id: 'filter-results',
      type: 'task',
      label: 'Filter & Rank',
      description: 'Apply user preferences and rank results by relevance',
      position: { x: 700, y: 150 },
      properties: {
        functionName: 'Result Processor',
        task: 'Filter search results based on user preferences, distance, ratings, and availability. Rank by relevance score.',
        duration: '1-2s',
        cost: '$0.02',
        resources: ['Ranking Algorithm', 'Distance Calculator', 'Preference Engine'],
        inputParameters: {
          rawResults: 'Array<DentistInfo>',
          userPreferences: 'UserPreferences',
          maxDistance: '25 miles'
        },
        outputParameters: {
          rankedResults: 'Array<RankedDentist>',
          totalFiltered: 'number'
        }
      },
      status: 'pending'
    },
    {
      id: 'check-results',
      type: 'decision',
      label: 'Results Found?',
      description: 'Check if any dentists were found matching criteria',
      position: { x: 900, y: 200 },
      properties: {
        conditions: [
          'At least 1 dentist found',
          'Results meet quality threshold',
          'Location data is accurate'
        ],
        duration: '0.2s',
        cost: '$0.00'
      },
      status: 'pending'
    },
    {
      id: 'format-output',
      type: 'task',
      label: 'Format Results',
      description: 'Format and structure the final results for display',
      position: { x: 1100, y: 150 },
      properties: {
        functionName: 'Output Formatter',
        task: 'Structure the dentist information into a user-friendly format with contact details, ratings, and booking options',
        duration: '0.5s',
        cost: '$0.01',
        resources: ['Template Engine', 'Contact Formatter'],
        inputParameters: {
          rankedResults: 'Array<RankedDentist>',
          displayFormat: 'detailed'
        },
        outputParameters: {
          formattedResults: 'FormattedDentistList',
          displayReady: 'boolean'
        }
      },
      status: 'pending'
    },
    {
      id: 'no-results',
      type: 'task',
      label: 'Handle No Results',
      description: 'Provide alternative suggestions when no dentists found',
      position: { x: 900, y: 350 },
      properties: {
        functionName: 'Fallback Handler',
        task: 'Generate alternative search suggestions, expand search radius, or provide general dental resources',
        duration: '1s',
        cost: '$0.01',
        resources: ['Suggestion Engine', 'Resource Database']
      },
      status: 'pending'
    },
    {
      id: 'end-success',
      type: 'end',
      label: 'Success',
      description: 'Dentist list successfully provided to user',
      position: { x: 1300, y: 150 },
      properties: {
        outputParameters: {
          status: 'success',
          resultCount: 'number',
          executionTime: 'duration'
        },
        duration: '0s',
        cost: '$0.00'
      },
      status: 'pending'
    },
    {
      id: 'end-failure',
      type: 'end',
      label: 'No Results',
      description: 'No dentists found, alternatives provided',
      position: { x: 1100, y: 350 },
      properties: {
        outputParameters: {
          status: 'no-results',
          alternatives: 'Array<Alternative>',
          suggestions: 'Array<string>'
        },
        duration: '0s',
        cost: '$0.00'
      },
      status: 'pending'
    }
  ];

  // Workflow edges with conditions
  const edges: WorkflowEdge[] = [
    { id: 'start-validate', source: 'start', target: 'validate-input', animated: false },
    { id: 'validate-search', source: 'validate-input', target: 'gemini-search', condition: 'Valid Input', animated: false },
    { id: 'search-filter', source: 'gemini-search', target: 'filter-results', animated: false },
    { id: 'filter-check', source: 'filter-results', target: 'check-results', animated: false },
    { id: 'check-format', source: 'check-results', target: 'format-output', condition: 'Results Found', animated: false },
    { id: 'check-noResults', source: 'check-results', target: 'no-results', condition: 'No Results', animated: false },
    { id: 'format-success', source: 'format-output', target: 'end-success', animated: false },
    { id: 'noResults-failure', source: 'no-results', target: 'end-failure', animated: false }
  ];

  // Get node icon based on type and function
  const getNodeIcon = (node: WorkflowNode) => {
    if (node.type === 'start') return <PlayIcon className="w-5 h-5" />;
    if (node.type === 'end') return <CheckCircleIcon className="w-5 h-5" />;
    if (node.type === 'decision') return <AlertTriangleIcon className="w-5 h-5" />;
    
    const functionName = node.properties.functionName?.toLowerCase() || '';
    if (functionName.includes('gemini')) return <SearchIcon className="w-5 h-5" />;
    if (functionName.includes('call')) return <PhoneIcon className="w-5 h-5" />;
    if (functionName.includes('message')) return <MessageSquareIcon className="w-5 h-5" />;
    if (functionName.includes('zap')) return <LinkIcon className="w-5 h-5" />;
    
    return <Settings2Icon className="w-5 h-5" />;
  };

  // Get node colors based on type and status
  const getNodeColors = (node: WorkflowNode) => {
    const baseColors = {
      start: { bg: 'bg-green-500', border: 'border-green-400', text: 'text-white' },
      end: { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-white' },
      task: { bg: 'bg-purple-500', border: 'border-purple-400', text: 'text-white' },
      decision: { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-white' }
    };

    const statusOverrides = {
      running: { bg: 'bg-yellow-500', border: 'border-yellow-400' },
      completed: { bg: 'bg-green-600', border: 'border-green-500' },
      failed: { bg: 'bg-red-500', border: 'border-red-400' }
    };

    return {
      ...baseColors[node.type],
      ...(node.status !== 'pending' ? statusOverrides[node.status] : {})
    };
  };

  // Toggle accordion sections
  const toggleAccordion = (section: string) => {
    setExpandedAccordions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Execute workflow simulation
  const executeWorkflow = async () => {
    setIsRunning(true);
    setCompletedSteps(new Set());
    setExecutionProgress(0);

    const executionOrder = ['start', 'validate-input', 'gemini-search', 'filter-results', 'check-results', 'format-output', 'end-success'];
    
    for (let i = 0; i < executionOrder.length; i++) {
      const nodeId = executionOrder[i];
      const node = nodes.find(n => n.id === nodeId);
      
      if (node) {
        setCurrentStep(nodeId);
        node.status = 'running';
        
        // Simulate execution time
        const duration = parseInt(node.properties.duration?.match(/\d+/)?.[0] || '1') * 1000;
        await new Promise(resolve => setTimeout(resolve, duration));
        
        node.status = 'completed';
        setCompletedSteps(prev => new Set([...prev, nodeId]));
        setExecutionProgress(((i + 1) / executionOrder.length) * 100);
        setCurrentStep(null);
        
        // Small pause between steps
        if (i < executionOrder.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }
    
    setIsRunning(false);
  };

  // Reset workflow
  const resetWorkflow = () => {
    setIsRunning(false);
    setCurrentStep(null);
    setCompletedSteps(new Set());
    setExecutionProgress(0);
    nodes.forEach(node => {
      if (node.id !== 'start') {
        node.status = 'pending';
      }
    });
  };

  // Calculate total cost and time
  const totalCost = nodes.reduce((sum, node) => {
    const cost = parseFloat(node.properties.cost?.replace('$', '') || '0');
    return sum + cost;
  }, 0);

  const totalTime = nodes.reduce((sum, node) => {
    const time = parseInt(node.properties.duration?.match(/\d+/)?.[0] || '0');
    return sum + time;
  }, 0);

  return (
    <div className="w-full bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ZapIcon className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isRunning && (
              <div className="flex items-center space-x-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
                    style={{ width: `${executionProgress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">{Math.round(executionProgress)}%</span>
              </div>
            )}
            
            <Button onClick={resetWorkflow} variant="outline" size="sm">
              <RotateCcwIcon className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="border-b border-gray-200">
        {/* Overview Accordion */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleAccordion('overview')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <InfoIcon className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-800">Workflow Overview</span>
            </div>
            {expandedAccordions.has('overview') ? 
              <ChevronDownIcon className="w-5 h-5 text-gray-500" /> : 
              <ChevronRightIcon className="w-5 h-5 text-gray-500" />
            }
          </button>
          
          {expandedAccordions.has('overview') && (
            <div className="px-6 pb-4 bg-blue-50">
              <p className="text-gray-700 leading-relaxed">
                This workflow automates the process of finding dental practices near the user's location. 
                It uses AI-powered search capabilities to locate, filter, and rank dentists based on various 
                criteria including ratings, availability, and user preferences.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{nodes.length}</div>
                  <div className="text-sm text-gray-600">Total Nodes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${totalCost.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Est. Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{totalTime}s</div>
                  <div className="text-sm text-gray-600">Est. Time</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Node Details Accordion */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleAccordion('nodes')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Settings2Icon className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-gray-800">Node Details</span>
            </div>
            {expandedAccordions.has('nodes') ? 
              <ChevronDownIcon className="w-5 h-5 text-gray-500" /> : 
              <ChevronRightIcon className="w-5 h-5 text-gray-500" />
            }
          </button>
          
          {expandedAccordions.has('nodes') && (
            <div className="px-6 pb-4 bg-purple-50 max-h-64 overflow-y-auto">
              <div className="space-y-3">
                {nodes.map(node => (
                  <div key={node.id} className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded ${getNodeColors(node).bg} ${getNodeColors(node).text}`}>
                          {getNodeIcon(node)}
                        </div>
                        <span className="font-medium text-gray-800">{node.label}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <ClockIcon className="w-3 h-3" />
                        {node.properties.duration}
                        <DollarSignIcon className="w-3 h-3" />
                        {node.properties.cost}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{node.description}</p>
                    {node.properties.resources && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {node.properties.resources.map((resource, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {resource}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Execution Stats Accordion */}
        <div>
          <button
            onClick={() => toggleAccordion('stats')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <BarChart3Icon className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-gray-800">Execution Statistics</span>
            </div>
            {expandedAccordions.has('stats') ? 
              <ChevronDownIcon className="w-5 h-5 text-gray-500" /> : 
              <ChevronRightIcon className="w-5 h-5 text-gray-500" />
            }
          </button>
          
          {expandedAccordions.has('stats') && (
            <div className="px-6 pb-4 bg-green-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{completedSteps.size}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-600">{currentStep ? 1 : 0}</div>
                  <div className="text-sm text-gray-600">Running</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-600">{nodes.length - completedSteps.size - (currentStep ? 1 : 0)}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{Math.round(executionProgress)}%</div>
                  <div className="text-sm text-gray-600">Progress</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={canvasRef}
        className="relative bg-gray-50 overflow-auto"
        style={{ height: '600px' }}
      >
        {/* Grid Background */}
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="workflow-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#e5e7eb" opacity="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#workflow-grid)" />
          </svg>
        </div>

        {/* Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return null;
            
            const startX = sourceNode.position.x + 100;
            const startY = sourceNode.position.y + 40;
            const endX = targetNode.position.x;
            const endY = targetNode.position.y + 40;
            
            const midX = (startX + endX) / 2;
            const path = `M ${startX} ${startY} C ${midX} ${startY} ${midX} ${endY} ${endX} ${endY}`;
            
            const isActive = completedSteps.has(edge.source) && completedSteps.has(edge.target);
            const isExecuting = currentStep === edge.target;
            
            return (
              <g key={edge.id}>
                <path
                  d={path}
                  stroke={isActive ? "#10B981" : isExecuting ? "#F59E0B" : "#D1D5DB"}
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={edge.animated ? "5 5" : "none"}
                  className="transition-all duration-300"
                />
                {edge.condition && (
                  <text
                    x={midX}
                    y={(startY + endY) / 2 - 10}
                    textAnchor="middle"
                    className="text-xs fill-gray-600 font-medium"
                  >
                    {edge.condition}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        <div className="relative" style={{ zIndex: 2 }}>
          {nodes.map(node => {
            const colors = getNodeColors(node);
            const isHovered = hoveredNode === node.id;
            
            return (
              <div
                key={node.id}
                className={`absolute transition-all duration-300 cursor-pointer ${
                  isHovered ? 'scale-110 z-10' : 'scale-100'
                }`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  width: node.type === 'decision' ? '120px' : '200px',
                  height: '80px'
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className={`
                  w-full h-full rounded-lg border-2 shadow-lg flex flex-col items-center justify-center p-2 text-center
                  ${colors.bg} ${colors.border} ${colors.text}
                  ${node.status === 'running' ? 'animate-pulse' : ''}
                  ${isHovered ? 'shadow-2xl' : ''}
                `}>
                  <div className="flex items-center justify-center mb-1">
                    {getNodeIcon(node)}
                  </div>
                  <div className="text-sm font-semibold">{node.label}</div>
                  {node.properties.duration && (
                    <div className="text-xs opacity-80">{node.properties.duration}</div>
                  )}
                </div>
                
                {/* Connection dots */}
                {node.type !== 'start' && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
                    <div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                )}
                {node.type !== 'end' && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
                    <div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hover Tooltip */}
        {hoveredNode && (
          <div 
            className="fixed z-50 bg-white border-2 border-gray-200 rounded-lg shadow-2xl p-4 max-w-sm pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            {(() => {
              const node = nodes.find(n => n.id === hoveredNode);
              if (!node) return null;
              
              return (
                <div>
                  <div className="flex items-center mb-2">
                    <div className={`p-2 rounded ${getNodeColors(node).bg} ${getNodeColors(node).text} mr-3`}>
                      {getNodeIcon(node)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{node.label}</h4>
                      <p className="text-sm text-gray-600">{node.type}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{node.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1 text-gray-500" />
                      {node.properties.duration}
                    </div>
                    <div className="flex items-center">
                      <DollarSignIcon className="w-3 h-3 mr-1 text-gray-500" />
                      {node.properties.cost}
                    </div>
                  </div>
                  
                  {node.properties.resources && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-600 mb-1">Resources:</p>
                      <div className="flex flex-wrap gap-1">
                        {node.properties.resources.map((resource, idx) => (
                          <span key={idx} className="px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            {resource}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Execute Button */}
      <div className="bg-white border-t border-gray-200 px-6 py-6">
        <div className="flex justify-center">
          <Button
            onClick={executeWorkflow}
            disabled={isRunning}
            size="lg"
            className={`px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
              isRunning 
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white hover:shadow-purple-500/25'
            }`}
          >
            {isRunning ? (
              <>
                <PauseIcon className="w-5 h-5 mr-2" />
                Executing Workflow...
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5 mr-2" />
                Execute Workflow
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};