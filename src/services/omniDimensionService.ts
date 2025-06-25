// OmniDimension service for making real phone calls
export interface CallDispatchRequest {
  user_query: string;
  business_info: string;
  phone_numbers?: string[];
  call_purpose: string;
}

export interface CallResult {
  phone_number: string;
  status: 'dispatched' | 'failed';
  call_id?: string;
  error?: string;
  business_info?: string;
  result?: any;
}

export interface CallDispatchResponse {
  success: boolean;
  calls_dispatched: number;
  results: CallResult[];
  call_context: any;
  error?: string;
}

export interface CallLog {
  call_id: string;
  status: string;
  duration?: number;
  transcript?: string;
  summary?: string;
  extracted_variables?: any;
}

export interface CallStatusResponse {
  success: boolean;
  call_log: CallLog;
  error?: string;
}

class OmniDimensionService {
  private baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000/api'  // Local testing with Python server
    : '/api';                      // Production Vercel serverless functions

  /**
   * Dispatch phone calls using OmniDimension API
   */
  async dispatchCall(request: CallDispatchRequest): Promise<CallDispatchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/dispatch_call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error dispatching call:', error);
      throw error;
    }
  }

  /**
   * Get call status and logs
   */
  async getCallStatus(callId: string): Promise<CallStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/call_status/${callId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting call status:', error);
      throw error;
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{ status: string; api_configured: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Extract phone numbers from text (client-side fallback)
   */
  extractPhoneNumbers(text: string): string[] {
    const phoneRegex = /(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/g;
    const matches = text.match(phoneRegex) || [];
    
    return matches.map(phone => {
      const digits = phone.replace(/[^\d]/g, '');
      if (digits.length === 10) {
        return `+1${digits}`;
      } else if (digits.length === 11 && digits.startsWith('1')) {
        return `+${digits}`;
      }
      return phone;
    });
  }

  /**
   * Determine call purpose from user query
   */
  determineCallPurpose(userQuery: string): string {
    const query = userQuery.toLowerCase();
    
    if (query.includes('dentist') || query.includes('dental')) {
      return 'dental_appointment';
    } else if (query.includes('restaurant') || query.includes('dining') || query.includes('reservation')) {
      return 'restaurant_reservation';
    } else if (query.includes('doctor') || query.includes('medical') || query.includes('health')) {
      return 'medical_appointment';
    } else {
      return 'general_inquiry';
    }
  }

  /**
   * Extract business information from Gemini search results
   */
  extractBusinessInfo(searchResults: string): { businesses: Array<{ name: string; info: string; phones: string[] }> } {
    // Simple extraction - this can be enhanced with better parsing
    const businesses: Array<{ name: string; info: string; phones: string[] }> = [];
    
    // Split by common business separators
    const businessBlocks = searchResults.split(/(?=\d+\.\s)|(?=Name:|Business:|Phone:)/i);
    
    for (const block of businessBlocks) {
      if (block.trim().length < 10) continue;
      
      const phones = this.extractPhoneNumbers(block);
      if (phones.length > 0) {
        // Extract business name (simple heuristic)
        const lines = block.split('\n');
        let name = '';
        
        for (const line of lines) {
          if (line.includes(':')) {
            const parts = line.split(':');
            if (parts[0].toLowerCase().includes('name') || parts[0].toLowerCase().includes('business')) {
              name = parts[1].trim();
              break;
            }
          } else if (line.trim().length > 0 && !line.includes('http') && !phones.some(p => line.includes(p))) {
            name = line.trim();
            break;
          }
        }
        
        if (!name) {
          name = `Business ${businesses.length + 1}`;
        }
        
        businesses.push({
          name,
          info: block.trim(),
          phones
        });
      }
    }
    
    return { businesses };
  }

  /**
   * Format call results for display
   */
  formatCallResults(response: CallDispatchResponse): string {
    let formattedResults = `## 📞 OmniDimension Call Results\n\n`;
    formattedResults += `**Status:** ${response.success ? '✅ Success' : '❌ Failed'}\n`;
    formattedResults += `**Calls Dispatched:** ${response.calls_dispatched}\n\n`;

    if (response.results && response.results.length > 0) {
      formattedResults += `### 📋 Call Details\n\n`;
      
      response.results.forEach((result, index) => {
        formattedResults += `**Call ${index + 1}:**\n`;
        formattedResults += `📞 **Phone:** ${result.phone_number}\n`;
        formattedResults += `📊 **Status:** ${result.status === 'dispatched' ? '✅ Dispatched' : '❌ Failed'}\n`;
        
        if (result.call_id) {
          formattedResults += `🆔 **Call ID:** ${result.call_id}\n`;
        }
        
        if (result.error) {
          formattedResults += `⚠️ **Error:** ${result.error}\n`;
        }
        
        if (result.business_info) {
          // Extract business name for display
          const lines = result.business_info.split('\n');
          const businessLine = lines.find(line => 
            line.toLowerCase().includes('name:') || 
            line.toLowerCase().includes('business:') ||
            (!line.includes('phone') && !line.includes('address') && line.trim().length > 5)
          );
          
          if (businessLine) {
            const businessName = businessLine.includes(':') 
              ? businessLine.split(':')[1].trim() 
              : businessLine.trim();
            formattedResults += `🏢 **Business:** ${businessName}\n`;
          }
        }
        
        formattedResults += `\n`;
      });
    }

    if (response.call_context) {
      formattedResults += `### 🎯 Call Context\n`;
      formattedResults += `**Purpose:** ${response.call_context.call_purpose || response.call_context.service_type || 'General inquiry'}\n`;
      
      if (response.call_context.appointment_reason) {
        formattedResults += `**Reason:** ${response.call_context.appointment_reason}\n`;
      }
      
      if (response.call_context.urgency) {
        formattedResults += `**Urgency:** ${response.call_context.urgency}\n`;
      }
    }

    return formattedResults;
  }
}

export const omniDimensionService = new OmniDimensionService(); 