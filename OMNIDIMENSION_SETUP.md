# OmniDimension Integration Setup Guide

This guide will help you set up real phone calling functionality using OmniDimension API for the Ayra AI Workflow System.

## 🎯 Overview

The integration allows the "OmniDimension Call" nodes in your workflows to make **real phone calls** instead of just simulations. When users create workflows like "Find dentists near me and call them", the system will:

1. Search for businesses using Gemini
2. Extract phone numbers from search results  
3. Make actual phone calls using OmniDimension API
4. Display real call logs and results

## 📋 Prerequisites

1. **OmniDimension Account**: Sign up at [omnidim.io](https://www.omnidim.io)
2. **Vercel Account**: For deploying Python serverless functions
3. **API Keys**: Both OmniDimension and existing Gemini keys

## 🚀 Setup Steps

### 1. OmniDimension Configuration

#### Create Agents in OmniDimension Dashboard

You'll need to create specific agents for different call purposes:

**Dental Appointment Agent:**
```
You are a friendly dental appointment booking assistant. Your goals are to:
1. Introduce yourself professionally
2. Ask about the caller's dental needs (cleaning, checkup, emergency)
3. Check available appointment slots
4. Collect contact information (name, phone, email)
5. Confirm appointment details
6. Thank the caller warmly

Always be empathetic and professional. If it's an emergency, prioritize urgent scheduling.
```

**Restaurant Reservation Agent:**
```
You are a restaurant reservation assistant. Your goals are to:
1. Greet the caller warmly
2. Ask about their dining preferences (date, time, party size)
3. Check table availability
4. Collect contact details and special requests
5. Confirm reservation details
6. Provide directions or parking information if asked

Maintain a friendly, hospitality-focused tone throughout the call.
```

**General Inquiry Agent:**
```
You are a professional business inquiry assistant. Your goals are to:
1. Greet the caller professionally
2. Understand their specific need or question
3. Provide relevant information about services/products
4. Collect contact information if they're interested
5. Offer to connect them with the right department
6. Thank them for their interest

Be helpful, informative, and maintain a professional demeanor.
```

#### Get API Key and Agent IDs

1. Go to your OmniDimension dashboard settings
2. Generate an API key
3. Note down the Agent IDs for each agent you created

### 2. Environment Variables

Create a `.env.local` file in your project root:

```env
# OmniDimension API Configuration
OMNIDIMENSION_API_KEY=your_omnidimension_api_key_here
OMNIDIMENSION_BASE_URL=https://api.omnidim.io
DEFAULT_AGENT_ID=123

# Agent IDs for different purposes
DENTAL_AGENT_ID=123
RESTAURANT_AGENT_ID=124
MEDICAL_AGENT_ID=125
GENERAL_AGENT_ID=126

# Existing Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Vercel Deployment Setup

#### Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

#### Configure Vercel Environment Variables
```bash
vercel env add OMNIDIMENSION_API_KEY
vercel env add OMNIDIMENSION_BASE_URL
vercel env add DEFAULT_AGENT_ID
vercel env add DENTAL_AGENT_ID
vercel env add RESTAURANT_AGENT_ID
vercel env add MEDICAL_AGENT_ID
vercel env add GENERAL_AGENT_ID
```

#### Deploy to Vercel
```bash
vercel --prod
```

### 4. Local Development

#### Install Python Dependencies
The Python serverless function will automatically install dependencies from `api/requirements.txt` when deployed to Vercel.

For local testing, you can run:
```bash
pip install flask requests python-dotenv
```

#### Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Test the health endpoint:
```bash
curl http://localhost:3000/api/health
```

3. Create a workflow with both "Gemini Search" and "OmniDimension Call" steps
4. Execute the workflow and verify real calls are made

## 🔧 How It Works

### Workflow Execution Flow

1. **User Input**: "Find dentists near me and call them"

2. **Step 1 - Gemini Search**: 
   - Searches for dental practices
   - Extracts business information including phone numbers
   - Stores results for next step

3. **Step 2 - OmniDimension Call**:
   - Detects it's a dental query → uses Dental Agent
   - Extracts phone numbers from Step 1 results
   - Generates call context with appointment purpose
   - Makes real API calls to OmniDimension
   - Returns call IDs and status

4. **Results Display**:
   - Shows real call dispatch confirmation
   - Displays call IDs for tracking
   - Links to OmniDimension dashboard for call logs

### API Endpoints

**POST /api/dispatch_call**
- Dispatches phone calls via OmniDimension
- Extracts phone numbers from business data
- Generates appropriate call context

**GET /api/call_status/{call_id}**
- Retrieves call logs and status
- Shows call duration, transcript, extracted data

**GET /api/health**
- Health check for the integration
- Verifies API key configuration

### Call Context Generation

The system automatically generates appropriate call context based on the user query:

- **Dental queries**: Sets appointment booking context
- **Restaurant queries**: Sets reservation context  
- **Medical queries**: Sets consultation context
- **General queries**: Sets information inquiry context

## 🎯 Testing Scenarios

### Test Queries to Try

1. **"Find dentists near me and call them"**
   - Should find dental practices and make appointment booking calls

2. **"Find restaurants nearby and make reservations"** 
   - Should find restaurants and make reservation calls

3. **"Call doctors in my area for checkup appointments"**
   - Should find medical practices and make consultation calls

### Expected Results

- Real phone calls dispatched to found businesses
- Call IDs returned for tracking
- Call context automatically set based on query type
- Results show actual call status vs simulation

## 🔍 Monitoring & Debugging

### Check Call Status
- Use the `/api/call_status/{call_id}` endpoint
- Monitor calls in OmniDimension dashboard
- Review call transcripts and extracted data

### Common Issues

1. **"No phone numbers found"**
   - Check if Gemini search results contain phone numbers
   - Verify phone number extraction regex patterns

2. **"API call failed"**
   - Verify OmniDimension API key is correct
   - Check agent ID exists in your account
   - Ensure phone numbers are in correct format (+1XXXXXXXXXX)

3. **"Real call execution failed"**
   - Check environment variables are set in Vercel
   - Verify network connectivity to OmniDimension API
   - Review call context generation logic

### Debugging Steps

1. Check health endpoint: `GET /api/health`
2. Verify environment variables in Vercel dashboard
3. Test with simple phone number: `+1-555-123-4567`
4. Review Vercel function logs for errors
5. Check OmniDimension dashboard for call attempts

## 🚀 Advanced Configuration

### Custom Agent Setup
- Create specialized agents for your use cases
- Configure voice settings and behavior
- Set up post-call webhooks for data collection

### Integration with Other Services
- Connect OmniDimension webhooks to CRM systems
- Set up automatic email/SMS notifications
- Integrate with calendar systems for appointment booking

### Scaling Considerations
- Monitor API rate limits
- Implement call queuing for high volume
- Set up load balancing for multiple agents

## 📞 Support

- **OmniDimension Docs**: [docs.omnidim.io](https://docs.omnidim.io)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Project Issues**: Create GitHub issues for integration problems

## 🔒 Security Notes

- Keep API keys secure and never commit them to code
- Use environment variables for all sensitive configuration
- Regularly rotate API keys
- Monitor call usage and costs
- Implement proper error handling for failed calls

---

With this setup, your Ayra AI workflows will be able to make real phone calls, transforming simulated automations into actual business interactions! 🎉 