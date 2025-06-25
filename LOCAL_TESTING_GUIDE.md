# 🧪 Local Testing Guide for OmniDimension Integration

This guide will help you test the OmniDimension integration locally before deploying to production.

## 🚀 Quick Start (5 Minutes)

### 1. Install Python Dependencies

```bash
# Install Python dependencies for the backend
pip install flask requests python-dotenv flask-cors

# Or if you prefer using a virtual environment:
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install flask requests python-dotenv flask-cors
```

### 2. Create Environment Variables

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
```

**Don't have OmniDimension API yet?** No problem! The integration will work in simulation mode for testing.

### 3. Test the Backend

```bash
# Run automated tests
python test_local.py

# Or start the local server
python test_local.py serve
```

### 4. Test the Frontend

```bash
# Start your React development server
npm run dev
```

Then test workflows with OmniDimension Call steps!

## 📋 Detailed Testing Steps

### Step 1: Backend Testing

#### Option A: Automated Tests
```bash
python test_local.py
```

**Expected Output:**
```
🧪 Starting Local OmniDimension Integration Tests

🔑 Checking environment variables...
⚠️  OMNIDIMENSION_API_KEY not found - will test in simulation mode

🔍 Testing health endpoint...
Status: 200
Response: {'status': 'healthy', 'service': 'omnidimension-integration', 'api_configured': False}
✅ Health Endpoint: PASSED

📞 Testing phone number extraction...
Extracted phones: ['+15551234567', '+15559876543']
✅ Phone Extraction: PASSED

🚀 Testing dispatch call endpoint...
Status: 400
Response: {
  "error": "No phone numbers found"
}
✅ Dispatch Call: PASSED

📊 Test Results Summary:
Passed: 3/3
🎉 All tests passed! Ready for frontend testing.
```

#### Option B: Manual Server Testing
```bash
python test_local.py serve
```

Then test endpoints manually:

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Test Call Dispatch:**
```bash
curl -X POST http://localhost:5000/api/dispatch_call \
  -H "Content-Type: application/json" \
  -d '{
    "user_query": "Find dentists near me and call them",
    "business_info": "Smile Dental\nPhone: +1-555-123-4567",
    "call_purpose": "dental_appointment"
  }'
```

### Step 2: Frontend Integration Testing

1. **Start React Dev Server:**
   ```bash
   npm run dev
   ```

2. **Create Test Workflows:**
   
   Navigate to your workflow dashboard and try these queries:

   **Test Query 1: Dental Appointment**
   ```
   "Find dentists near me and call them"
   ```
   
   **Test Query 2: Restaurant Reservation**
   ```
   "Find restaurants nearby and make reservations"
   ```
   
   **Test Query 3: General Business**
   ```
   "Call local businesses for information"
   ```

3. **Expected Behavior:**
   - Workflow generates with both "Gemini Search" and "OmniDimension Call" steps
   - Execution shows phone number extraction
   - Results indicate real vs simulation mode
   - Call status and logs are displayed

### Step 3: End-to-End Testing

#### Test Scenario: "Find dentists and call them"

1. **Input:** `"Find dentists near me and call them"`

2. **Expected Workflow:**
   ```
   Step 1: Gemini Search
   ↓
   Step 2: OmniDimension Call
   ```

3. **Expected Execution:**
   - **Step 1:** Generates mock dental practice listings with phone numbers
   - **Step 2:** Extracts phone numbers and either:
     - 🔴 **Simulation Mode:** Shows "would call" message
     - 🟢 **Real Mode:** Makes actual API calls to OmniDimension

4. **Expected Results:**
   ```markdown
   ## 📞 OmniDimension Call Results
   
   **Status:** ✅ Success
   **Calls Dispatched:** 2
   
   ### 📋 Call Details
   
   **Call 1:**
   📞 **Phone:** +1-555-123-4567
   📊 **Status:** ✅ Dispatched
   🆔 **Call ID:** call_abc123
   🏢 **Business:** Smile Dental Center
   ```

## 🎯 Testing Different Modes

### Simulation Mode (No API Key)
- Tests phone number extraction
- Shows mock call dispatch
- Demonstrates UI/UX flow
- Perfect for development

### Real Mode (With API Key)
- Makes actual OmniDimension API calls
- Returns real call IDs
- Integrates with OmniDimension dashboard
- Production-ready testing

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Issue: "Cannot find module 'dispatch_call'"
**Solution:**
```bash
# Make sure you're in the project root directory
cd /path/to/your/AyraAI/project

# Check that api/dispatch_call.py exists
ls api/dispatch_call.py

# Run the test script from project root
python test_local.py
```

#### Issue: "No phone numbers found"
**Solution:**
```bash
# Test phone extraction directly
python -c "
import sys
sys.path.append('api')
from dispatch_call import extract_phone_numbers
text = 'Phone: (555) 123-4567'
print(extract_phone_numbers(text))
"
```

#### Issue: Frontend can't connect to backend
**Solution:**
```bash
# Make sure backend is running on port 5000
python test_local.py serve

# Check if frontend is configured correctly
# The frontend should call /api/dispatch_call
# But for local testing, it should call http://localhost:5000/api/dispatch_call
```

#### Issue: CORS errors in browser
**Solution:**
The `test_local.py` script includes CORS headers. Make sure you're using it:
```bash
python test_local.py serve
```

### Frontend Configuration for Local Testing

Add this to your `src/services/omniDimensionService.ts` for local development:

```typescript
class OmniDimensionService {
  private baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000/api'  // Local testing
    : '/api';                      // Production
  
  // ... rest of the class
}
```

## 📊 Test Cases to Verify

### Backend Tests
- ✅ Health endpoint responds
- ✅ Phone number extraction works
- ✅ Call dispatch endpoint accepts requests
- ✅ Error handling for missing API keys
- ✅ Environment variable loading

### Frontend Tests
- ✅ OmniDimension service initialization
- ✅ Workflow execution with call steps
- ✅ Real vs simulation mode detection
- ✅ Results display formatting
- ✅ Error handling and fallbacks

### Integration Tests
- ✅ End-to-end workflow execution
- ✅ Phone number extraction from search results
- ✅ Call context generation
- ✅ Results formatting and display
- ✅ Graceful degradation when API unavailable

## 🚀 Next Steps After Local Testing

1. **Configure OmniDimension Account:**
   - Sign up at [omnidim.io](https://www.omnidim.io)
   - Create agents for different purposes
   - Get API key and agent IDs

2. **Deploy to Vercel:**
   ```bash
   vercel env add OMNIDIMENSION_API_KEY
   vercel env add DEFAULT_AGENT_ID
   # ... other environment variables
   vercel --prod
   ```

3. **Test in Production:**
   - Create real workflows
   - Monitor call logs in OmniDimension dashboard
   - Verify webhooks and integrations

## 💡 Pro Tips

1. **Use Mock Data:** The system includes realistic mock data for testing without real API calls

2. **Test Phone Formats:** Try different phone number formats:
   - `(555) 123-4567`
   - `+1-555-123-4567`
   - `555.123.4567`

3. **Monitor Logs:** Check browser console and terminal output for detailed debugging

4. **Gradual Testing:** Start with backend tests, then frontend, then integration

5. **Environment Switching:** Use different `.env` files for different testing scenarios

---

Happy testing! 🎉 This integration transforms your workflow system from simulations into real business automation. 