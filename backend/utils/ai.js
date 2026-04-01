export const generateSuggestion = (marks) => {
  if (marks < 40) return "Focus on basics and practice daily.";
  if (marks < 70) return "You are improving, revise weak topics.";
  return "Excellent performance, keep going!";
};

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function firstItems(list, count = 3) {
  return toArray(list).slice(0, count);
}

export function generateAssistantReply({ role = "admin", message = "", context = {} }) {
  const prompt = String(message || "").trim();
  const normalizedPrompt = prompt.toLowerCase();

  const stats = context.stats || {};
  const attentionStudents = toArray(context.attentionStudents);
  const upcomingPayments = toArray(context.upcomingPayments);
  const feeDefaulters = toArray(context.feeDefaulters);
  const operations = toArray(context.operations);
  const student = context.student || {};
  const notifications = toArray(context.notifications);
  const tasks = toArray(context.tasks);
  const tests = toArray(context.tests);
  const insight = context.insight || {};
  const schedule = toArray(context.schedule);

  const highlights = [];
  const actions = [];
  let answer = "";

  if (role === "admin") {
    const riskyStudents = attentionStudents.filter((item) => String(item.risk || "").toLowerCase() === "high");
    const unpaidPayments = upcomingPayments.filter((item) => String(item.status || "").toLowerCase() !== "paid");

    if (normalizedPrompt.includes("fee") || normalizedPrompt.includes("payment") || normalizedPrompt.includes("revenue")) {
      answer = `Revenue status is ${formatCurrency(stats.revenue)} collected with ${formatCurrency(
        stats.pendingRevenue
      )} still pending. There are ${stats.pendingFees || 0} unpaid fee records that need follow-up.`;

      highlights.push(
        `${feeDefaulters.length} students are already visible in the fee defaulters report.`,
        `${unpaidPayments.length} upcoming payments are still unpaid.`,
        `Current network revenue is ${formatCurrency(stats.revenue)}.`
      );

      actions.push(
        "Call or message the top fee defaulters first.",
        "Prioritize payments with the nearest due date.",
        "Export the fee defaulters report for daily follow-up."
      );
    } else if (
      normalizedPrompt.includes("risk") ||
      normalizedPrompt.includes("attention") ||
      normalizedPrompt.includes("student")
    ) {
      const names = firstItems(riskyStudents.length ? riskyStudents : attentionStudents)
        .map((item) => item.name)
        .filter(Boolean);

      answer = riskyStudents.length
        ? `${riskyStudents.length} students are in the highest-risk band right now. They need fast academic and fee intervention before momentum drops further.`
        : `The current attention queue has ${attentionStudents.length} students, with the strongest risk coming from attendance and fee signals.`;

      highlights.push(
        names.length ? `Priority students: ${names.join(", ")}.` : "Use the attention queue to review the next students needing support.",
        `${stats.totalStudents || 0} total students are being monitored across institutes.`,
        `${stats.notificationsCount || 0} active alerts can support intervention planning.`
      );

      actions.push(
        "Schedule mentor calls for the top-risk students.",
        "Review attendance drops before the next batch cycle.",
        "Pair academic revision plans with fee follow-up where needed."
      );
    } else {
      answer = `Network health is steady across ${stats.totalInstitutes || 0} institutes with ${
        stats.totalStudents || 0
      } students, ${stats.activeBatches || 0} active batches, and ${stats.totalTests || 0} live tests. The biggest pressure point is pending recovery and high-risk student monitoring.`;

      highlights.push(
        `${formatCurrency(stats.revenue)} collected so far.`,
        `${attentionStudents.length} students are in the AI attention queue.`,
        operations[0]?.title ? `Top ops item: ${operations[0].title}.` : "Operations checklist is available for next actions."
      );

      actions.push(
        "Review the AI attention queue first.",
        "Push fee follow-up on pending records this week.",
        "Track monthly revenue momentum against campus activity."
      );
    }
  } else {
    const pendingAmount = Number(student.pendingAmount || 0);
    const attendance = Number(student.attendance || 0);
    const marks = Number(student.marks || 0);
    const upcomingTest = tests[0];

    if (
      normalizedPrompt.includes("study") ||
      normalizedPrompt.includes("improve") ||
      normalizedPrompt.includes("marks")
    ) {
      answer = `Your current score is ${marks}/100 with ${attendance}% attendance. The best improvement path is to strengthen weak topics, stay regular in class, and convert upcoming tests into revision checkpoints.`;

      highlights.push(
        `Attendance is ${attendance}% and directly affects learning momentum.`,
        upcomingTest?.title ? `Next test: ${upcomingTest.title} on ${upcomingTest.date}.` : "No scheduled test is blocking your progress right now.",
        insight.summary || generateSuggestion(marks)
      );

      actions.push(
        "Revise one weak topic every day for the next 7 days.",
        "Keep attendance above 85% for stronger score stability.",
        "Use the next test as a timed revision milestone."
      );
    } else if (normalizedPrompt.includes("fee") || normalizedPrompt.includes("payment")) {
      answer = pendingAmount
        ? `You currently have ${formatCurrency(pendingAmount)} pending in fees. Clearing dues early will help avoid admin friction and keep your focus on study.`
        : "Your fee status looks clear right now, so you can stay focused on classes and tests.";

      highlights.push(
        pendingAmount ? `${formatCurrency(pendingAmount)} is still pending.` : "No pending amount is visible.",
        `${notifications.length} notifications may include reminders or updates.`,
        schedule[0]?.title ? `Next scheduled item: ${schedule[0].title}.` : "No immediate schedule conflict is visible."
      );

      actions.push(
        pendingAmount ? "Plan the next payment before the due date." : "Keep downloading receipts for your records.",
        "Check notifications for fee-related reminders.",
        "Stay aligned with your weekly learning schedule."
      );
    } else {
      answer = insight.summary
        ? insight.summary
        : `You are making progress, and the main focus now is balancing attendance, revision, and upcoming assessments.`;

      highlights.push(
        `Current attendance: ${attendance}%.`,
        `Current marks: ${marks}/100.`,
        tasks[0]?.title ? `This week's focus: ${tasks[0].title}.` : "Use your dashboard focus section to plan the week."
      );

      actions.push(
        "Review your dashboard focus items first.",
        "Protect your attendance rhythm this week.",
        "Track your next test and revise early."
      );
    }
  }

  return {
    answer,
    highlights: highlights.filter(Boolean).slice(0, 3),
    actions: actions.filter(Boolean).slice(0, 3),
  };
}

function extractTextFromResponse(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const output = Array.isArray(data?.output) ? data.output : [];

  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (typeof part?.text === "string" && part.text.trim()) {
        return part.text.trim();
      }
    }
  }

  return "";
}

function createAssistantInstructions(role) {
  return [
    "You are an AI assistant inside a coaching management application.",
    `Current user role: ${role}.`,
    "Answer using only the dashboard data provided by the application.",
    "Do not invent students, payments, marks, or schedules that are not in the context.",
    "Be practical, concise, and action-oriented.",
    "Return strict JSON with keys: answer, highlights, actions.",
    "answer must be a short paragraph string.",
    "highlights must be an array of up to 3 short strings.",
    "actions must be an array of up to 3 short action strings.",
  ].join(" ");
}

function createAssistantInput({ role, message, context }) {
  return [
    `User role: ${role}`,
    `User question: ${message}`,
    `Dashboard context JSON: ${JSON.stringify(context)}`,
  ].join("\n\n");
}

export async function generateOpenAiAssistantReply({ role = "admin", message = "", context = {} }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENAI_MODEL || "gpt-5-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      store: false,
      temperature: 0.4,
      max_output_tokens: 350,
      instructions: createAssistantInstructions(role),
      input: createAssistantInput({ role, message, context }),
      text: {
        format: {
          type: "json_schema",
          name: "assistant_reply",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              answer: { type: "string" },
              highlights: {
                type: "array",
                items: { type: "string" },
                maxItems: 3,
              },
              actions: {
                type: "array",
                items: { type: "string" },
                maxItems: 3,
              },
            },
            required: ["answer", "highlights", "actions"],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawText = extractTextFromResponse(data);
  const parsed = JSON.parse(rawText);

  return {
    answer: String(parsed.answer || "").trim(),
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights.filter(Boolean).slice(0, 3) : [],
    actions: Array.isArray(parsed.actions) ? parsed.actions.filter(Boolean).slice(0, 3) : [],
    provider: "openai",
    model,
  };
}
