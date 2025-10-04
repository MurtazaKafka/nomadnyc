#!/usr/bin/env node

const AGENT_SERVICE_URL = 'http://localhost:8081';

// Sample emails for ingestion
const sampleEmails = [
  {
    from: "john.doe@techcompany.com",
    subject: "Urgent: Contract Review Needed by EOD",
    bodyText: "Hi, We need your immediate attention on the new partnership contract. The legal team has flagged several clauses that require executive approval. Please review sections 4.2 and 7.3 regarding liability limits and payment terms. This is blocking our Q4 launch. Can we schedule a call today? Best regards, John",
    labels: ["urgent", "legal", "contracts"]
  },
  {
    from: "sarah.wilson@client.com",
    subject: "Meeting Request: Project Kickoff",
    bodyText: "Hello, I'd like to schedule our project kickoff meeting for next week. We have the initial requirements ready and the team is eager to start. Please let me know your availability for a 2-hour session. We'll need to cover timeline, deliverables, and success metrics. Looking forward to working together! Best, Sarah",
    labels: ["meetings", "projects"]
  },
  {
    from: "newsletter@industry.com",
    subject: "Weekly Industry Updates",
    bodyText: "This week in tech: AI advances continue to reshape the industry. New regulations proposed for data privacy. Market analysis shows strong growth in cloud services. Read our full report online for detailed insights and expert commentary on these developments.",
    labels: ["newsletter", "fyi"]
  }
];

async function testIngestion() {
  console.log('Testing email ingestion endpoint...\n');
  
  try {
    const response = await fetch(`${AGENT_SERVICE_URL}/api/emails/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emails: sampleEmails }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ Ingestion successful!');
    console.log(`📧 Processed ${result.emails.length} emails\n`);
    
    result.emails.forEach((email, index) => {
      console.log(`Email ${index + 1}:`);
      console.log(`  From: ${email.email.from}`);
      console.log(`  Subject: ${email.email.subject}`);
      console.log(`  Urgency: ${email.email.urgency} (${Math.round(email.email.confidence * 100)}% confidence)`);
      console.log(`  Summary: ${email.summary.slice(0, 100)}...`);
      if (email.suggestions.length > 0) {
        console.log(`  Suggested Action: ${email.suggestions[0].action}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Ingestion failed:', error.message);
    console.log('\nMake sure the agent service is running on port 8081');
    console.log('Run: npm run dev');
  }
}

testIngestion();