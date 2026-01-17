// Cyberbullying / Harassment Chat Assistant Routes
import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Chat with assistant
router.post("/chat", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  
  // Detect intent and generate response
  const intent = detectIntent(message);
  const response = generateResponse(message, intent);
  
  // Save conversation
  const sql = `INSERT INTO chatbot_conversations (user_id, message, response, intent) 
    VALUES (?, ?, ?, ?)`;
  
  db.query(sql, [userId, message, response.text, intent], (err, result) => {
    if (err) {
      console.error("Error saving conversation:", err);
    }
    
    res.json({
      response: response.text,
      intent: intent,
      suggestions: response.suggestions,
      urgent: response.urgent
    });
  });
});

// Get conversation history
router.get("/history", authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  const sql = `SELECT * FROM chatbot_conversations 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 50`;
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ conversations: results });
  });
});

// Rule-based intent detection
function detectIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  // Cyberbullying keywords
  if (lowerMessage.match(/\b(bully|harass|threat|abuse|insult|hate|attack|hurt)\b/)) {
    return 'cyberbullying';
  }
  
  // Harassment keywords
  if (lowerMessage.match(/\b(stalk|follow|unwanted|uncomfortable|scared|fear|danger)\b/)) {
    return 'harassment';
  }
  
  // Emergency keywords
  if (lowerMessage.match(/\b(emergency|urgent|help|sos|danger|immediate|now)\b/)) {
    return 'emergency';
  }
  
  // General inquiry
  if (lowerMessage.match(/\b(how|what|where|when|why|help|info|information)\b/)) {
    return 'inquiry';
  }
  
  // Report keywords
  if (lowerMessage.match(/\b(report|file|complaint|gd|case)\b/)) {
    return 'report';
  }
  
  return 'general';
}

// Generate response based on intent
function generateResponse(message, intent) {
  const responses = {
    'cyberbullying': {
      text: "I understand you're experiencing cyberbullying. This is serious and we're here to help. You can:\n1. File a cyberbullying report through our online GD system\n2. Contact our cybercrime unit at 01712345678\n3. Block and report the person on the platform\n4. Save all evidence (screenshots, messages)\n\nWould you like me to help you file a report?",
      suggestions: ['File Report', 'Contact Support', 'Get Help'],
      urgent: true
    },
    'harassment': {
      text: "I'm sorry you're experiencing harassment. Your safety is important. Please:\n1. Report this immediately through our online system\n2. Contact emergency services if you feel in immediate danger: 999\n3. Document all incidents with dates and details\n4. Consider reaching out to support services\n\nWould you like to file a harassment report now?",
      suggestions: ['File Report', 'Emergency Help', 'Safety Tips'],
      urgent: true
    },
    'emergency': {
      text: "If this is an emergency, please call 999 immediately. For non-emergency police assistance, you can:\n1. Use the SOS button in the app for immediate help\n2. Contact your nearest police station\n3. File an emergency report online\n\nYour safety is our priority. How can I help you right now?",
      suggestions: ['Call 999', 'Use SOS Button', 'Find Police Station'],
      urgent: true
    },
    'report': {
      text: "I can help you file a report. You can report:\n1. Crime/Incident (GD)\n2. Lost Items\n3. Missing Person\n4. Missing Vehicle\n5. Cyberbullying/Harassment\n\nWhich type of report would you like to file?",
      suggestions: ['File GD', 'Lost Item', 'Missing Person', 'Missing Vehicle'],
      urgent: false
    },
    'inquiry': {
      text: "I'm here to help with information about Metro Police services. You can:\n1. Check traffic fines\n2. Track case status\n3. Apply for Police Clearance Certificate\n4. View crime risk maps\n5. Get safety information\n\nWhat would you like to know more about?",
      suggestions: ['Services', 'Help', 'Contact'],
      urgent: false
    },
    'general': {
      text: "Hello! I'm the Metro Police Assistant. I can help you with:\n- Filing reports (GD, Lost Items, Missing Persons)\n- Checking traffic fines\n- Getting safety information\n- Emergency assistance\n- General inquiries\n\nHow can I assist you today?",
      suggestions: ['Services', 'Help', 'Report'],
      urgent: false
    }
  };
  
  return responses[intent] || responses['general'];
}

export default router;
