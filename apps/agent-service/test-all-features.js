#!/usr/bin/env node

const AGENT_SERVICE_URL = 'http://localhost:8081';

async function testEndpoint(name, method, path, body = null) {
  console.log(`\n📍 Testing: ${name}`);
  console.log(`   ${method} ${path}`);
  
  try {
    const options = {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${AGENT_SERVICE_URL}${path}`, options);
    
    if (!response.ok) {
      console.log(`   ❌ Failed with status: ${response.status}`);
      return false;
    }
    
    const contentType = response.headers.get('content-type');
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
      console.log(`   ✅ Success!`);
      console.log(`   Response preview:`, JSON.stringify(result).slice(0, 150) + '...');
    } else {
      result = await response.text();
      console.log(`   ✅ Success!`);
      console.log(`   Response type: ${contentType || 'text'}`);
      console.log(`   Response size: ${result.length} bytes`);
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 NOMAD EMAIL AGENT - CORE FEATURES TEST');
  console.log('==========================================');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Health Check
  totalTests++;
  if (await testEndpoint('Health Check', 'GET', '/health')) passedTests++;
  
  // Email Ingestion
  totalTests++;
  const ingestData = {
    emails: [
      {
        from: "test@example.com",
        subject: "Test Email for Demo",
        bodyText: "This is a test email to verify the ingestion endpoint is working correctly."
      }
    ]
  };
  if (await testEndpoint('Email Ingestion', 'POST', '/api/emails/ingest', ingestData)) passedTests++;
  
  // Get All Emails
  totalTests++;
  if (await testEndpoint('Get All Emails', 'GET', '/api/emails')) passedTests++;
  
  // Generate Reply (assuming email_001 exists from samples)
  totalTests++;
  const replyData = {
    action: "acknowledge",
    tone: "professional"
  };
  if (await testEndpoint('Generate Email Reply', 'POST', '/api/emails/email_001/reply', replyData)) passedTests++;
  
  // Quick Responses
  totalTests++;
  if (await testEndpoint('Generate Quick Responses', 'POST', '/api/emails/email_001/quick-responses')) passedTests++;
  
  // Voice - Text to Speech
  totalTests++;
  const speakData = {
    text: "Testing voice synthesis endpoint"
  };
  if (await testEndpoint('Voice Text-to-Speech', 'POST', '/api/voice/speak', speakData)) passedTests++;
  
  // Voice - Process Command (without actual audio)
  totalTests++;
  console.log(`\n📍 Testing: Voice Transcribe`);
  console.log(`   POST /api/voice/transcribe`);
  console.log(`   ⚠️  Skipped (requires audio file upload)`);
  
  // Summary
  console.log('\n==========================================');
  console.log('📊 TEST SUMMARY');
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${totalTests - passedTests}`);
  console.log(`   Success Rate: ${Math.round(passedTests/totalTests * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n✅ All core features are working correctly!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }
}

// Run tests
runTests().catch(console.error);