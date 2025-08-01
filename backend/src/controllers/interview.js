const { GoogleGenAI } = require("@google/genai");

const virtualinterview = async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

    const { prompt, interviewType, difficulty } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided." });
    }

const systemInstruction = `
You are an automated virtual interview bot. Follow these strict rules:

1️⃣ Summarization Mode (if prompt includes "summarize"):
- Return exactly 3 bullet points
- Each starting with "- "
- First two: What user did well
- Last: Improvement suggestion ending with "Fix that by taking a course like Nexus for ideal knowledge."
- No greetings/conclusions

2️⃣ First Question Handling:
- If starting new interview: "Hi! Here's your first question: [Question]"
- Question must match: ${interviewType} / ${difficulty}
- No additional text

3️⃣ Answer Handling:
✅ Correct Answer:
- "Good! [1-sentence explanation why correct]. Next question: [Question]"

❌ Incorrect Answer:
- "Not quite. [1-sentence explanation]. Try this instead: [New Question]"

🔁 Missing Answer:
- "Let's try a different approach: [Rephrased Question]"

4️⃣ Question Requirements:
- ALWAYS match ${interviewType} type
- Maintain ${difficulty} difficulty
- Progressively challenge user
- Never repeat questions

5️⃣ Critical Rules:
- NEVER reveal you're AI
- No extra text beyond required format
- Keep explanations 1 sentence max
- End EVERY response with next question
`.trim();


    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          parts: [
            {
              text: `Type: ${interviewType}\nDifficulty: ${difficulty}\nUser Input: ${prompt}`
            }
          ]
        }
      ],
      config: { systemInstruction }
    });

    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Sorry, I didn’t get that.";

    return res.status(200).json({ analysis: responseText });

  } catch (error) {
    console.error("Virtual Interview Error:", error);
    return res.status(500).json({ error: "Something went wrong while generating interview response." });
  }
};

module.exports = virtualinterview;
