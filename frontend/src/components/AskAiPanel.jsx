import { useState } from "react";
import API from "../services/api";

const starterPrompts = {
  admin: "Where should I focus first today?",
  staff: "What should I focus on this week?",
  student: "How can I improve my performance this week?",
};

export default function AskAiPanel({ role = "admin", context = {}, title = "Ask AI", description = "Get quick guidance from your dashboard data." }) {
  const [prompt, setPrompt] = useState(starterPrompts[role] || starterPrompts.student);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = prompt.trim();
    if (!message) return;

    setLoading(true);

    try {
      const res = await API.post("/ai/assist", { message, role, context });
      setResult(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="panel-card panel-card--accent">
      <div className="panel-card__header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <textarea
          className="app-input app-textarea"
          rows="4"
          placeholder="Ask about fees, performance, attendance, or what to do next."
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </form>

      {result ? (
        <div className="ai-response">
          <div className="ai-response__block">
            <div className="ai-response__meta">
              <span className="hero-panel__badge">AI Answer</span>
              <span className="pill pill--neutral">
                {result.provider === "openai" ? `OpenAI${result.model ? ` · ${result.model}` : ""}` : "Local fallback"}
              </span>
            </div>
            <p>{result.answer}</p>
          </div>

          {result.highlights?.length ? (
            <div className="ai-response__block">
              <strong>Highlights</strong>
              <div className="stack-list">
                {result.highlights.map((item) => (
                  <div key={item} className="list-row list-row--compact">
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {result.actions?.length ? (
            <div className="ai-response__block">
              <strong>Suggested Actions</strong>
              <div className="stack-list">
                {result.actions.map((item) => (
                  <div key={item} className="list-row list-row--compact">
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
