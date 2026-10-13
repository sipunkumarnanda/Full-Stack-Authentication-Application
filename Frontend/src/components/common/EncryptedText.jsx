import React, { useEffect, useMemo, useState } from "react";

const DEFAULT_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*+-=?";

export function EncryptedText({
  text,
  revealDelayMs = 42,
  flipDelayMs = 34,
  charset = DEFAULT_CHARSET,
  className = "",
  encryptedClassName = "text-primary",
  revealedClassName = "",
}) {
  const characters = useMemo(() => Array.from(text || ""), [text]);
  const [revealed, setRevealed] = useState(0);
  const [scramble, setScramble] = useState(0);

  useEffect(() => {
    if (!text || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(characters.length);
      return undefined;
    }

    setRevealed(0);
    const revealTimer = window.setInterval(() => {
      setRevealed((current) => {
        if (current >= characters.length) {
          window.clearInterval(revealTimer);
          return current;
        }
        return current + 1;
      });
    }, revealDelayMs);
    const flipTimer = window.setInterval(() => setScramble((current) => current + 1), flipDelayMs);

    return () => {
      window.clearInterval(revealTimer);
      window.clearInterval(flipTimer);
    };
  }, [characters, flipDelayMs, revealDelayMs, text]);

  return (
    <span className={className} aria-label={text}>
      {characters.map((character, index) => {
        const isRevealed = index < revealed || character === " ";
        const value = isRevealed
          ? character
          : charset[(index * 17 + scramble * 13) % charset.length];
        return (
          <span key={`${index}-${character}`} aria-hidden="true" className={isRevealed ? revealedClassName : encryptedClassName}>
            {value}
          </span>
        );
      })}
    </span>
  );
}

export default EncryptedText;
