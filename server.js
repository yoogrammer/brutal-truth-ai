require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// ─── ANALYZE ENDPOINT ────────────────────────────────────────────────────────
app.post("/api/analyze", async (req, res) => {
    const { tasks, availableHours, currentTime, userName } = req.body;

    const taskList = tasks
        .map(
            (t, i) =>
                `Task ${i + 1}: "${t.title}"
         - Deadline: ${t.deadline}
         - Estimated hours needed: ${t.estimatedHours}
         - Work done so far: ${t.progressPercent}%
         - Importance: ${t.importance}/5`
        )
        .join("\n\n");

    const prompt = `
You are Brutal Truth AI — an unflinchingly honest productivity coach.
Your job is NOT to be encouraging. Your job is to tell the TRUTH.

Current time: ${currentTime}
User's free hours available today: ${availableHours} hours
User name: ${userName || "User"}

Here are the user's tasks:

${taskList}

Your job:
1. Calculate for EACH task: hours remaining needed = estimatedHours * (1 - progressPercent/100)
2. Add up ALL hours needed vs hours available
3. Give a brutal honest verdict: will they make it or not?
4. If they cannot make it, tell them EXACTLY how much they are short
5. Rank tasks by: which ones WILL be missed first
6. For each at-risk task, give ONE of these options:
   a) Scope reduction — what is the minimum viable version?
   b) Deadline renegotiation — draft a 2-line message to send now
   c) Drop it — is it even necessary?
7. Give one immediate action for the next 15 minutes

Be direct. Be mathematically precise. Do not soften the truth.
Use phrases like:
- "The math does not lie"
- "You are X hours short"
- "You will miss [task] unless you act in the next X minutes"

Return ONLY valid JSON in this exact format:
{
  "verdict": "WILL_MAKE_IT" or "WILL_NOT_MAKE_IT" or "BARELY",
  "verdictMessage": "2-sentence brutal honest summary",
  "totalHoursNeeded": 0.0,
  "totalHoursAvailable": 0.0,
  "hoursShortfall": 0.0,
  "willMakeItPercent": 0,
  "tasks": [
    {
      "title": "",
      "hoursRemaining": 0.0,
      "deadline": "",
      "status": "ON_TRACK" or "AT_RISK" or "WILL_MISS",
      "brutalTruth": "one honest sentence about this task",
      "minutesUntilDeadline": 0,
      "recommendation": "REDUCE_SCOPE" or "RENEGOTIATE" or "DROP" or "CONTINUE",
      "actionOption": {
        "type": "REDUCE_SCOPE" or "RENEGOTIATE" or "DROP" or "CONTINUE",
        "title": "short action title",
        "description": "specific action to take",
        "draftMessage": "if renegotiate: a ready-to-send 2-line message, else empty string"
      }
    }
  ],
  "immediateAction": "exactly what to do in next 15 minutes",
  "mathBreakdown": "show the actual math in 2-3 lines",
  "survivalPlan": "if barely possible, the exact strategy to survive"
}
`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const clean = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        const data = JSON.parse(clean);
        res.json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── RENEGOTIATE EMAIL ENDPOINT ───────────────────────────────────────────────
app.post("/api/draft-email", async (req, res) => {
    const { taskTitle, deadline, recipient, reason } = req.body;

    const prompt = `
Write a SHORT, professional, honest email to request a deadline extension.

Task: ${taskTitle}
Original deadline: ${deadline}
Recipient: ${recipient || "Professor/Manager"}
Reason: ${reason || "underestimated the scope"}

Rules:
- Maximum 5 lines
- Honest but professional
- Include a proposed new deadline that is realistic
- No excessive apology
- Subject line included

Return ONLY valid JSON:
{
  "subject": "",
  "body": ""
}
`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const clean = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        const data = JSON.parse(clean);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Brutal Truth AI running on port ${PORT}`));