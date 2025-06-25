import os
import json
import re
from flask import Flask, request, jsonify
from typing import Dict, List, Optional, Any
import requests

app = Flask(__name__)

# Environment variables
OMNIDIMENSION_API_KEY = os.getenv('OMNIDIMENSION_API_KEY')
OMNIDIMENSION_BASE_URL = os.getenv('OMNIDIMENSION_BASE_URL', 'https://api.omnidim.io')
DEFAULT_AGENT_ID = os.getenv('DEFAULT_AGENT_ID', '123')  # Default agent for general calls

class OmniDimensionClient:
    def __init__(self, api_key: str, base_url: str = 'https://api.omnidim.io'):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def dispatch_call(self, agent_id: int, to_number: str, call_context: Dict[str, Any]) -> Dict[str, Any]:
        """Dispatch a call using OmniDimension API"""
        endpoint = f"{self.base_url}/api/v1/calls/dispatch"
        
        payload = {
            "agent_id": agent_id,
            "to_number": to_number,
            "call_context": call_context
        }
        
        try:
            response = requests.post(endpoint, headers=self.headers, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"API call failed: {str(e)}")
    
    def get_call_log(self, call_log_id: str) -> Dict[str, Any]:
        """Get call log details"""
        endpoint = f"{self.base_url}/api/v1/calls/logs/{call_log_id}"
        
        try:
            response = requests.get(endpoint, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get call log: {str(e)}")

def extract_phone_numbers(text: str) -> List[str]:
    """Extract phone numbers from text using regex patterns"""
    # Common phone number patterns
    patterns = [
        r'\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',  # US format
        r'\+?([0-9]{1,3})[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{3,4})',  # International
        r'\(([0-9]{3})\)\s?([0-9]{3})-([0-9]{4})',  # (555) 123-4567
        r'([0-9]{3})-([0-9]{3})-([0-9]{4})',  # 555-123-4567
    ]
    
    phone_numbers = []
    for pattern in patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            if isinstance(match, tuple):
                # Clean and format number
                digits = ''.join(match)
                if len(digits) == 10:  # US number
                    formatted = f"+1{digits}"
                    phone_numbers.append(formatted)
                elif len(digits) >= 10:  # International
                    if not digits.startswith('+'):
                        formatted = f"+{digits}"
                    else:
                        formatted = digits
                    phone_numbers.append(formatted)
    
    # Remove duplicates while preserving order
    seen = set()
    unique_numbers = []
    for num in phone_numbers:
        if num not in seen:
            seen.add(num)
            unique_numbers.append(num)
    
    return unique_numbers

def generate_call_context(user_query: str, business_info: str, call_purpose: str) -> Dict[str, Any]:
    """Generate call context based on user query and business information"""
    
    # Extract business details
    business_name = ""
    business_address = ""
    
    # Simple extraction - can be enhanced with NLP
    lines = business_info.split('\n')
    for line in lines:
        if any(keyword in line.lower() for keyword in ['name:', 'business:', 'title:']):
            business_name = line.split(':', 1)[-1].strip()
        elif any(keyword in line.lower() for keyword in ['address:', 'location:', 'street:']):
            business_address = line.split(':', 1)[-1].strip()
    
    # Determine call purpose and generate context
    call_context = {
        "user_query": user_query,
        "call_purpose": call_purpose,
        "business_name": business_name,
        "business_address": business_address,
        "timestamp": "",
        "user_preferences": {}
    }
    
    # Add specific context based on query type
    if any(keyword in user_query.lower() for keyword in ['dentist', 'dental', 'teeth']):
        call_context.update({
            "service_type": "dental",
            "appointment_reason": "general checkup or consultation",
            "urgency": "routine" if "emergency" not in user_query.lower() else "urgent"
        })
    elif any(keyword in user_query.lower() for keyword in ['restaurant', 'dining', 'reservation']):
        call_context.update({
            "service_type": "restaurant",
            "reservation_purpose": "dining reservation",
            "party_size": "2",  # Default
            "preferred_time": "evening"
        })
    elif any(keyword in user_query.lower() for keyword in ['doctor', 'medical', 'health']):
        call_context.update({
            "service_type": "medical",
            "appointment_reason": "consultation",
            "urgency": "routine"
        })
    else:
        call_context.update({
            "service_type": "general",
            "inquiry_type": "information"
        })
    
    return call_context

def get_agent_id_for_purpose(call_purpose: str) -> int:
    """Get appropriate agent ID based on call purpose"""
    # Map different purposes to specific agent IDs
    # These would be configured in your OmniDimension dashboard
    agent_mapping = {
        "dental_appointment": int(os.getenv('DENTAL_AGENT_ID', DEFAULT_AGENT_ID)),
        "restaurant_reservation": int(os.getenv('RESTAURANT_AGENT_ID', DEFAULT_AGENT_ID)),
        "medical_appointment": int(os.getenv('MEDICAL_AGENT_ID', DEFAULT_AGENT_ID)),
        "general_inquiry": int(os.getenv('GENERAL_AGENT_ID', DEFAULT_AGENT_ID))
    }
    
    return agent_mapping.get(call_purpose, int(DEFAULT_AGENT_ID))

@app.route('/api/dispatch_call', methods=['POST'])
def dispatch_call():
    """Main endpoint to dispatch OmniDimension calls"""
    try:
        if not OMNIDIMENSION_API_KEY:
            return jsonify({"error": "OmniDimension API key not configured"}), 500
        
        data = request.json
        user_query = data.get('user_query', '')
        business_info = data.get('business_info', '')
        phone_numbers = data.get('phone_numbers', [])
        call_purpose = data.get('call_purpose', 'general_inquiry')
        
        if not phone_numbers:
            # Try to extract phone numbers from business_info
            extracted_numbers = extract_phone_numbers(business_info)
            if not extracted_numbers:
                return jsonify({"error": "No phone numbers found"}), 400
            phone_numbers = extracted_numbers
        
        # Initialize OmniDimension client
        client = OmniDimensionClient(OMNIDIMENSION_API_KEY, OMNIDIMENSION_BASE_URL)
        
        # Get appropriate agent ID
        agent_id = get_agent_id_for_purpose(call_purpose)
        
        # Generate call context
        call_context = generate_call_context(user_query, business_info, call_purpose)
        
        # Dispatch calls to all phone numbers
        call_results = []
        for phone_number in phone_numbers[:3]:  # Limit to 3 calls per request
            try:
                # Format phone number
                if not phone_number.startswith('+'):
                    if len(phone_number) == 10:
                        phone_number = f"+1{phone_number}"
                    else:
                        phone_number = f"+{phone_number}"
                
                # Dispatch call
                result = client.dispatch_call(agent_id, phone_number, call_context)
                
                call_results.append({
                    "phone_number": phone_number,
                    "status": "dispatched",
                    "call_id": result.get("call_id"),
                    "result": result,
                    "business_info": business_info
                })
                
            except Exception as e:
                call_results.append({
                    "phone_number": phone_number,
                    "status": "failed",
                    "error": str(e),
                    "business_info": business_info
                })
        
        return jsonify({
            "success": True,
            "calls_dispatched": len([r for r in call_results if r["status"] == "dispatched"]),
            "results": call_results,
            "call_context": call_context
        })
        
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/api/call_status/<call_id>', methods=['GET'])
def get_call_status(call_id):
    """Get call status and logs"""
    try:
        if not OMNIDIMENSION_API_KEY:
            return jsonify({"error": "OmniDimension API key not configured"}), 500
        
        client = OmniDimensionClient(OMNIDIMENSION_API_KEY, OMNIDIMENSION_BASE_URL)
        call_log = client.get_call_log(call_id)
        
        return jsonify({
            "success": True,
            "call_log": call_log
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to get call status: {str(e)}"}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "omnidimension-integration",
        "api_configured": bool(OMNIDIMENSION_API_KEY)
    })

# Vercel serverless function handler
def handler(request):
    return app(request.environ, lambda status, headers: None)

if __name__ == '__main__':
    app.run(debug=True) 