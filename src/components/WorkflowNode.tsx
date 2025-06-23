import React, { useState } from 'react';
import { SearchIcon, PhoneIcon, MessageSquareIcon, LinkIcon, ClockIcon, InfoIcon, CheckCircleIcon, PlayIcon, MoreHorizontalIcon } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface WorkflowNodeProps {
  stepNumber: number;
  functionName: string;
  task: string;
  duration: string;
  output: string;
  userQuery: string;
  isActive?: boolean;
  isCompleted?: boolean;
  onHover?: (isHovered: boolean) => void;
}

export const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  stepNumber,
  functionName,
  task,
  duration,
  output,
  userQuery,
  isActive = false,
  isCompleted = false,
  onHover
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Function to get icon and styling for different functions
  const getFunctionDetails = (functionName: string) => {
    const lowerName = functionName.toLowerCase();
    
    if (lowerName.includes('gemini search')) {
      return { 
        icon: <SearchIcon className="w-5 h-5" />, 
        color: '#3B82F6',
        bgColor: 'bg-blue-500',
        lightBg: 'bg-blue-50',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-700',
        shadowColor: 'shadow-blue-500/20',
        nodeColor: 'bg-blue-500'
      };
    } else if (lowerName.includes('omnidimension call')) {
      return { 
        icon: <PhoneIcon className="w-5 h-5" />, 
        color: '#10B981',
        bgColor: 'bg-green-500',
        lightBg: 'bg-green-50',
        borderColor: 'border-green-300',
        textColor: 'text-green-700',
        shadowColor: 'shadow-green-500/20',
        nodeColor: 'bg-green-500'
      };
    } else if (lowerName.includes('twilio message')) {
      return { 
        icon: <MessageSquareIcon className="w-5 h-5" />, 
        color: '#8B5CF6',
        bgColor: 'bg-purple-500',
        lightBg: 'bg-purple-50',
        borderColor: 'border-purple-300',
        textColor: 'text-purple-700',
        shadowColor: 'shadow-purple-500/20',
        nodeColor: 'bg-purple-500'
      };
    } else if (lowerName.includes('zap')) {
      return { 
        icon: <LinkIcon className="w-5 h-5" />, 
        color: '#F59E0B',
        bgColor: 'bg-orange-500',
        lightBg: 'bg-orange-50',
        borderColor: 'border-orange-300',
        textColor: 'text-orange-700',
        shadowColor: 'shadow-orange-500/20',
        nodeColor: 'bg-orange-500'
      };
    } else {
      return { 
        icon: <PlayIcon className="w-5 h-5" />, 
        color: '#EC4899',
        bgColor: 'bg-pink-500',
        lightBg: 'bg-pink-50',
        borderColor: 'border-pink-300',
        textColor: 'text-pink-700',
        shadowColor: 'shadow-pink-500/20',
        nodeColor: 'bg-pink-500'
      };
    }
  };

  const details = getFunctionDetails(functionName);

  // Generate contextual explanation based on function and user query
  const getContextualExplanation = () => {
    const lowerQuery = userQuery.toLowerCase();
    const lowerFunction = functionName.toLowerCase();

    if (lowerFunction.includes('gemini search')) {
      if (lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('locate')) {
        return `This step uses Gemini Search to find and gather information based on your request "${userQuery}". It will search the web and compile relevant results.`;
      }
      return `Gemini Search analyzes your request "${userQuery}" and gathers the necessary information from web sources to proceed with the automation.`;
    }

    if (lowerFunction.includes('omnidimension call')) {
      if (lowerQuery.includes('call') || lowerQuery.includes('phone') || lowerQuery.includes('contact')) {
        return `This step directly addresses your request to make calls. OmniDimension Call will handle the phone communication aspect of "${userQuery}".`;
      }
      return `Based on the information gathered, OmniDimension Call will make the necessary phone calls to complete your automation request.`;
    }

    if (lowerFunction.includes('twilio message')) {
      if (lowerQuery.includes('message') || lowerQuery.includes('sms') || lowerQuery.includes('text') || lowerQuery.includes('notify')) {
        return `This step fulfills your messaging requirement from "${userQuery}" by using Twilio to send SMS messages or notifications.`;
      }
      return `Twilio Message will send you updates and notifications related to your automation request via SMS.`;
    }

    if (lowerFunction.includes('zap')) {
      if (lowerQuery.includes('integrate') || lowerQuery.includes('connect') || lowerQuery.includes('sync')) {
        return `Zap handles the integration aspect of "${userQuery}" by connecting with external services and platforms.`;
      }
      return `This step uses Zap to integrate with other services and agents needed to complete your automation workflow.`;
    }

    return `This step processes your request "${userQuery}" using ${functionName} to move the automation forward.`;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(false);
  };

  return (
    <div className="relative">
      {/* Main n8n-style Node */}
      <div
        className={`relative transition-all duration-300 transform cursor-pointer ${
          isHovered ? 'scale-105' : 'scale-100'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Node Container */}
        <div className={`
          relative w-80 bg-white rounded-lg border-2 shadow-lg transition-all duration-300
          ${isCompleted ? 'border-green-400 ' + details.shadowColor + ' shadow-lg' : 
            isActive ? 'border-orange-400 shadow-orange-500/20 shadow-lg animate-pulse' : 
            'border-gray-200 hover:border-gray-300'}
          ${isHovered ? details.shadowColor + ' shadow-xl' : ''}
        `}>
          {/* Node Header */}
          <div className={`
            flex items-center justify-between p-4 rounded-t-lg border-b border-gray-100
            ${isCompleted ? 'bg-green-50' : isActive ? 'bg-orange-50' : 'bg-gray-50'}
          `}>
            <div className="flex items-center space-x-3">
              {/* Function Icon */}
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm
                ${details.nodeColor}
              `}>
                {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : details.icon}
              </div>
              
              {/* Function Name */}
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">{functionName}</h4>
                <div className="flex items-center text-xs text-gray-500">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  {duration}
                </div>
              </div>
            </div>
            
            {/* Node Menu */}
            <div className="flex items-center space-x-2">
              {/* Step Number */}
              <div className={`
                w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white
                ${details.nodeColor}
              `}>
                {stepNumber}
              </div>
              
              {/* Status Indicator */}
              {isActive && (
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              )}
              {isCompleted && (
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Node Content */}
          <div className="p-4">
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {task}
            </p>
          </div>

          {/* Connection Points */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Hover Tooltip - Fixed positioning to prevent overflow */}
      {isHovered && (
        <div 
          className="fixed animate-fade-in"
          style={{ 
            zIndex: 999999,
            position: 'fixed',
            width: '384px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
        >
          <Card className={`${details.lightBg} border-2 ${details.borderColor} shadow-2xl ${details.shadowColor}`}>
            <CardContent className="p-6">
              {/* Tooltip Header */}
              <div className="flex items-center mb-4">
                <div className={`p-3 ${details.nodeColor} text-white rounded-lg mr-3 shadow-sm`}>
                  {details.icon}
                </div>
                <div>
                  <h4 className={`font-bold text-lg ${details.textColor}`}>{functionName}</h4>
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    Estimated duration: {duration}
                  </div>
                </div>
              </div>

              {/* Task Description */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <InfoIcon className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="font-semibold text-gray-700">Function Details:</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed pl-6 bg-white/70 p-3 rounded-lg">
                  {task}
                </p>
              </div>

              {/* Contextual Explanation */}
              <div className="mb-4 p-4 bg-white/80 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                  <span className="font-semibold text-gray-700 text-sm">Context for your query:</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {getContextualExplanation()}
                </p>
              </div>

              {/* Expected Output */}
              <div>
                <div className="flex items-center mb-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  <span className="font-semibold text-gray-700">Expected Output:</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed pl-6 bg-green-50 p-3 rounded-lg border border-green-200">
                  {output}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};