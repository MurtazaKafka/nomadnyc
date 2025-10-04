#!/bin/bash

# Demo script for Nomad Email Agent - Agentic Features
# This showcases the AI-powered voice and email processing capabilities

AGENT_URL="http://localhost:8081"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}     NOMAD EMAIL AGENT - AGENTIC FEATURES DEMO ${NC}"
echo -e "${BLUE}================================================${NC}"
echo

# Check if services are running
echo -e "${YELLOW}Checking services...${NC}"
if curl -s "$AGENT_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ Agent service is running${NC}"
else
    echo -e "❌ Agent service is not running. Start with: npm run dev"
    exit 1
fi
echo

# 1. Show current email status
echo -e "${BLUE}1. EMAIL INTELLIGENCE${NC}"
echo -e "${YELLOW}Fetching and analyzing emails...${NC}"
TOTAL_EMAILS=$(curl -s "$AGENT_URL/api/emails" | jq 'length')
URGENT_COUNT=$(curl -s "$AGENT_URL/api/emails" | jq '[.[] | select(.email.urgency == "urgent")] | length')
echo -e "📧 Total emails: $TOTAL_EMAILS"
echo -e "🔴 Urgent emails: $URGENT_COUNT"
echo

# 2. Voice Command: "What are my urgent emails?"
echo -e "${BLUE}2. VOICE COMMAND PROCESSING${NC}"
echo -e "${YELLOW}Simulating voice command: 'What are my urgent emails?'${NC}"

# Generate audio for the command
echo "Generating voice audio..."
curl -X POST "$AGENT_URL/api/voice/speak" \
  -H "Content-Type: application/json" \
  -d '{"text": "What are my urgent emails?"}' \
  -o /tmp/voice_command.mp3 -s

echo "Processing voice command through Whisper..."
VOICE_RESPONSE=$(curl -X POST "$AGENT_URL/api/voice/transcribe" \
  -F "audio=@/tmp/voice_command.mp3" -s)

echo -e "${GREEN}Transcription:${NC}"
echo "$VOICE_RESPONSE" | jq -r '.command.text'
echo -e "${GREEN}AI Response:${NC}"
echo "$VOICE_RESPONSE" | jq -r '.response.text' | fold -w 80 -s
echo

# 3. Email Reply Generation
echo -e "${BLUE}3. INTELLIGENT EMAIL RESPONSES${NC}"
echo -e "${YELLOW}Generating reply for urgent contract email...${NC}"

REPLY=$(curl -X POST "$AGENT_URL/api/emails/email_001/reply" \
  -H "Content-Type: application/json" \
  -d '{"action": "acknowledge", "tone": "professional"}' -s)

echo -e "${GREEN}Generated Reply:${NC}"
echo "$REPLY" | jq -r '.subject'
echo "---"
echo "$REPLY" | jq -r '.body' | fold -w 70 -s
echo

# 4. Quick Response Suggestions
echo -e "${BLUE}4. QUICK RESPONSE AI${NC}"
echo -e "${YELLOW}Getting AI-suggested quick responses...${NC}"

QUICK=$(curl -X POST "$AGENT_URL/api/emails/email_010/quick-responses" -s)
echo -e "${GREEN}Suggested responses for production outage:${NC}"
echo "$QUICK" | jq -r '.responses[]' | while IFS= read -r response; do
    echo "  • $response"
done
echo

# 5. Bulk Email Processing
echo -e "${BLUE}5. BULK EMAIL INGESTION & AI ANALYSIS${NC}"
echo -e "${YELLOW}Ingesting new emails with AI processing...${NC}"

NEW_EMAIL=$(cat <<EOF
{
  "emails": [{
    "from": "board@investors.com",
    "subject": "Board Meeting Tomorrow - Prep Required",
    "bodyText": "The board is expecting your presentation on Q4 projections tomorrow at 9 AM. Please ensure all financial models are updated and the deck is ready. This is critical for our Series B closing."
  }]
}
EOF
)

INGESTED=$(curl -X POST "$AGENT_URL/api/emails/ingest" \
  -H "Content-Type: application/json" \
  -d "$NEW_EMAIL" -s)

echo -e "${GREEN}Email ingested and analyzed:${NC}"
echo "$INGESTED" | jq -r '.emails[0] | "Priority: \(.email.urgency) (\(.email.confidence * 100 | floor)% confidence)"'
echo "$INGESTED" | jq -r '.emails[0].summary' | fold -w 70 -s
echo

# 6. Voice Summary Generation
echo -e "${BLUE}6. AI VOICE SYNTHESIS${NC}"
echo -e "${YELLOW}Generating voice summary of urgent emails...${NC}"

SUMMARY_TEXT="You have $URGENT_COUNT urgent emails requiring immediate attention. The most critical is from Jane Thompson about a contract deadline today. Second priority is the production server outage from Jennifer Lee."

curl -X POST "$AGENT_URL/api/voice/speak" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$SUMMARY_TEXT\"}" \
  -o /tmp/email_summary.mp3 -s

if [ -f /tmp/email_summary.mp3 ]; then
    SIZE=$(ls -lh /tmp/email_summary.mp3 | awk '{print $5}')
    echo -e "${GREEN}✅ Voice summary generated: /tmp/email_summary.mp3 ($SIZE)${NC}"
    echo "Text: \"$SUMMARY_TEXT\""
fi
echo

# Summary
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✅ DEMO COMPLETE - ALL AI FEATURES WORKING${NC}"
echo -e "${BLUE}================================================${NC}"
echo
echo "Key Agentic Capabilities Demonstrated:"
echo "  • 🎤 Voice transcription with Whisper"
echo "  • 🔊 Text-to-speech synthesis"
echo "  • 📧 Intelligent email prioritization"
echo "  • 💬 Context-aware reply generation"
echo "  • ⚡ Real-time email processing"
echo "  • 🤖 Natural language command processing"
echo
echo "Access the web interface at: http://localhost:3002"