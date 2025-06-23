# Ayra AI Workflow System

## Overview

The Ayra AI Workflow System is a comprehensive automation platform that transforms user queries into interactive workflow visualizations. The system consists of several key components that work together to provide a seamless automation experience.

## Core Components

### 1. Enhanced Gemini Service (`src/services/geminiService.ts`)

The enhanced Gemini service provides two main functions:

#### `generateStructuredWorkflow(userInput: string): Promise<WorkflowData>`
- **Purpose**: Generates structured workflow data from user input
- **Input**: User query string (e.g., "Find dentists near me")
- **Output**: Structured `WorkflowData` object with:
  - `title`: Workflow title
  - `overview`: Brief description
  - `steps`: Array of `WorkflowStep` objects
  - `benefits`: Array of expected benefits
  - `flowSummary`: Summary of the automation flow

#### `parseWorkflowResponse(response: string): WorkflowData`
- **Purpose**: Parses markdown AI responses into structured data
- **Input**: Markdown-formatted AI response
- **Output**: Structured `WorkflowData` object

#### `generateAutomationResponse(userInput: string): Promise<string>` (Legacy)
- **Purpose**: Backward compatibility function that returns markdown format
- **Input**: User query string
- **Output**: Markdown-formatted response

### 2. Workflow Data Structure

```typescript
interface WorkflowStep {
  stepNumber: number;
  functionName: string;  // "Gemini Search", "OmniDimension Call", "Twilio Message", "Zap"
  task: string;          // Detailed description of what this step does
  duration: string;      // Estimated execution time
  output: string;        // What this step produces
}

interface WorkflowData {
  title: string;
  overview: string;
  steps: WorkflowStep[];
  benefits: string[];
  flowSummary: string;
}
```

### 3. Available Functions

The system supports 4 core automation functions:

1. **Gemini Search** - For searching the web, finding information, researching topics, locating services, gathering data
2. **OmniDimension Call** - For making phone calls, scheduling appointments, contacting businesses, voice interactions
3. **Twilio Message** - For sending SMS messages, OTPs, notifications, alerts, reminders, text communications
4. **Zap** - For integrating with other agents, external services, APIs, databases, webhooks, data processing

### 4. Comprehensive Workflow Demo (`src/screens/ComprehensiveWorkflowDemo.tsx`)

A complete workflow generation interface that:

- Accepts any user query
- Generates structured workflow data using AI
- Displays interactive workflow canvas
- Shows benefits and flow summary
- Provides example queries for testing

## How It Works

### 1. User Input Processing

1. User enters a query (e.g., "Find restaurants near me")
2. System validates the input using AI to determine if it's a valid automation task
3. If valid, generates workflow steps using the 4 available functions

### 2. Workflow Generation

1. AI analyzes the user query and determines appropriate functions
2. Creates 1-4 workflow steps with detailed descriptions
3. Generates expected benefits and flow summary
4. Returns structured data for visualization

### 3. Visualization

1. `WorkflowCanvas` component displays the workflow as an interactive n8n-style canvas
2. Shows workflow nodes with connection lines
3. Provides hover tooltips with detailed explanations
4. Includes execute/reset functionality with animated progress

## Usage Examples

### Example 1: Location-Based Search
**Input**: "Find dentists near me"
**Generated Workflow**:
- Step 1: Gemini Search - Search for dental practices in user's local area
- Benefits: Instant access to information, comprehensive details, time savings

### Example 2: Multi-Step Automation
**Input**: "Find restaurants and make reservations"
**Generated Workflow**:
- Step 1: Gemini Search - Find restaurants with availability
- Step 2: OmniDimension Call - Make reservations
- Benefits: Automated discovery and booking, time savings, convenience

### Example 3: Notification System
**Input**: "Send me daily weather updates"
**Generated Workflow**:
- Step 1: Gemini Search - Get current weather data
- Step 2: Twilio Message - Send daily weather notifications
- Benefits: Automated updates, timely information, convenience

## Integration Points

### 1. Main Dashboard Integration
The `AutomationDashboard` routes specific queries to the comprehensive workflow:
- Dentist/doctor-related queries
- Location-based searches
- Canvas template selection

### 2. Workflow Canvas Integration
The `WorkflowCanvas` component accepts:
- `steps`: Array of WorkflowStep objects
- `userQuery`: Original user input
- `title`: Workflow title

### 3. Error Handling
The system handles various scenarios:
- Greeting-only inputs
- Vague requests
- API errors
- Parsing failures

## Technical Implementation

### 1. AI Prompt Engineering
The system uses carefully crafted prompts to:
- Validate user input
- Generate appropriate workflow steps
- Ensure consistent output format
- Provide context-aware responses

### 2. Response Parsing
Regular expressions extract structured data from AI responses:
- Title extraction
- Step parsing with detailed information
- Benefits list extraction
- Flow summary extraction

### 3. Fallback Mechanisms
If AI generation fails, the system provides:
- Default workflow structures
- Error messages for invalid inputs
- Graceful degradation

## Future Enhancements

1. **More Functions**: Add additional automation capabilities
2. **Custom Workflows**: Allow users to save and reuse workflows
3. **Integration APIs**: Connect with actual automation platforms
4. **Advanced Analytics**: Track workflow performance and usage
5. **Collaboration**: Share workflows with team members

## Testing

To test the system:

1. Start the development server: `npm run dev`
2. Navigate to the main dashboard
3. Try example queries like:
   - "Find dentists near me"
   - "Schedule a meeting with my team"
   - "Research competitors in my industry"
4. Observe the generated workflow visualization
5. Test the interactive features (hover, execute, reset)

The system provides a comprehensive foundation for AI-powered workflow automation with a focus on user experience and visual clarity. 