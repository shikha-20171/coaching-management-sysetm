import { generateAssistantReply, generateOpenAiAssistantReply } from "../utils/ai.js";

export const analyzeStudent = (req, res) => {
  const { marks = 0, attendance = 0, pendingFees = 0 } = req.body;

  const riskScore =
    (marks < 60 ? 40 : marks < 75 ? 20 : 5) +
    (attendance < 80 ? 35 : attendance < 90 ? 15 : 5) +
    (pendingFees > 10000 ? 25 : pendingFees > 0 ? 10 : 0);

  const recommendation =
    riskScore >= 70
      ? "High attention needed. Schedule mentor intervention, fee follow-up, and subject revision immediately."
      : riskScore >= 40
        ? "Moderate risk. Maintain weekly review cadence and monitor class consistency."
        : "Low risk. Continue current study rhythm and assign growth challenges.";

  res.json({
    riskScore,
    band: riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low",
    recommendation,
  });
};

export const askAssistant = (req, res) => {
  const { message = "", context = {}, role } = req.body || {};

  if (!String(message).trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  const effectiveRole = role || req.user?.role || "admin";
  return Promise.resolve()
    .then(async () => {
      try {
        const openAiReply = await generateOpenAiAssistantReply({
          role: effectiveRole,
          message,
          context,
        });

        if (openAiReply) {
          return res.json(openAiReply);
        }
      } catch (error) {
        console.error("OpenAI assistant fallback triggered:", error.message);
      }

      const fallbackReply = generateAssistantReply({
        role: effectiveRole,
        message,
        context,
      });

      return res.json({
        ...fallbackReply,
        provider: "local",
        model: "rule-based",
      });
    })
    .catch((error) => {
      console.error("AI assistant request failed:", error.message);
      return res.status(500).json({ error: "AI assistant is temporarily unavailable" });
    });
};
