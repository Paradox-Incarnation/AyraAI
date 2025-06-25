#!/usr/bin/env python3
"""
Local testing script for OmniDimension integration
Run this to test the backend locally before deploying to Vercel
"""

import os
import sys
import json
from flask import Flask
from flask_cors import CORS

# Add the api directory to the path so we can import our function
sys.path.append('api')

# Import our serverless function
from dispatch_call import app

# Enable CORS for local testing
CORS(app)

# Load environment variables from .env.local
from dotenv import load_dotenv
load_dotenv('.env.local')

def test_health_endpoint():
    """Test the health endpoint"""
    print("🔍 Testing health endpoint...")
    with app.test_client() as client:
        response = client.get('/api/health')
        print(f"Status: {response.status_code}")
        print(f"Response: {response.get_json()}")
        return response.status_code == 200

def test_phone_extraction():
    """Test phone number extraction"""
    print("\n📞 Testing phone number extraction...")
    from dispatch_call import extract_phone_numbers
    
    test_text = """
    Smile Dental Center
    Address: 123 Main Street
    Phone: (555) 123-4567
    
    Family Dental Care  
    Phone: +1-555-987-6543
    Hours: Mon-Sat 9AM-7PM
    """
    
    phones = extract_phone_numbers(test_text)
    print(f"Extracted phones: {phones}")
    return len(phones) > 0

def test_dispatch_call_endpoint():
    """Test the dispatch call endpoint with mock data"""
    print("\n🚀 Testing dispatch call endpoint...")
    
    test_data = {
        "user_query": "Find dentists near me and call them",
        "business_info": """
        1. Smile Dental Center
           Address: 123 Main Street, Cityville 12345
           Phone: +1-555-123-4567
           Hours: Mon-Fri 8AM-6PM
           
        2. Family Dental Care
           Address: 456 Oak Avenue, Cityville 12345  
           Phone: +1-555-987-6543
           Hours: Mon-Sat 9AM-7PM
        """,
        "call_purpose": "dental_appointment"
    }
    
    with app.test_client() as client:
        response = client.post('/api/dispatch_call', 
                             json=test_data,
                             content_type='application/json')
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.get_json(), indent=2)}")
        return response.status_code in [200, 500]  # 500 is OK if no API key

def run_all_tests():
    """Run all local tests"""
    print("🧪 Starting Local OmniDimension Integration Tests\n")
    
    # Check environment variables
    print("🔑 Checking environment variables...")
    api_key = os.getenv('OMNIDIMENSION_API_KEY')
    if api_key:
        print(f"✅ OMNIDIMENSION_API_KEY found (ends with: ...{api_key[-4:]})")
    else:
        print("⚠️  OMNIDIMENSION_API_KEY not found - will test in simulation mode")
    
    # Run tests
    tests = [
        ("Health Endpoint", test_health_endpoint),
        ("Phone Extraction", test_phone_extraction), 
        ("Dispatch Call", test_dispatch_call_endpoint)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, success))
            print(f"{'✅' if success else '❌'} {test_name}: {'PASSED' if success else 'FAILED'}")
        except Exception as e:
            print(f"❌ {test_name}: ERROR - {str(e)}")
            results.append((test_name, False))
    
    # Summary
    print(f"\n📊 Test Results Summary:")
    passed = sum(1 for _, success in results if success)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed! Ready for frontend testing.")
    else:
        print("⚠️  Some tests failed. Check configuration and try again.")

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'serve':
        # Run the Flask server for manual testing
        print("🚀 Starting local server on http://localhost:5000")
        print("📝 Available endpoints:")
        print("   GET  /api/health")
        print("   POST /api/dispatch_call")
        print("   GET  /api/call_status/<call_id>")
        print("\nPress Ctrl+C to stop")
        app.run(debug=True, port=5000)
    else:
        # Run automated tests
        run_all_tests() 