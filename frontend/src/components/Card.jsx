import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

export default function Card({ title, value, meta, tone = "teal", accent, footer }) {
  const shouldAnimateNumber = typeof value === "number";
  const [displayValue, setDisplayValue] = useState(shouldAnimateNumber ? 0 : value);

  const formattedValue = useMemo(() => {
    if (!shouldAnimateNumber) return value;
    return Math.round(displayValue);
  }, [displayValue, shouldAnimateNumber, value]);

  useEffect(() => {
    if (!shouldAnimateNumber) {
      setDisplayValue(value);
      return;
    }

    let frameId;
    const duration = 900;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * eased);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [shouldAnimateNumber, value]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.012, rotateX: -2 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={`metric-card metric-card--${tone}`}
    >
      <span className="metric-card__glow" aria-hidden="true" />
      <span className="metric-card__grid" aria-hidden="true" />
      <span className="metric-card__label">{title}</span>
      {accent ? <span className="metric-card__accent">{accent}</span> : null}
      <strong className="metric-card__value">{formattedValue}</strong>
      {meta ? <span className="metric-card__meta">{meta}</span> : null}
      {footer ? <span className="metric-card__footer">{footer}</span> : null}
    </motion.article>
  );
}
