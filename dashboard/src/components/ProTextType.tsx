"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface ProTextTypeProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  initialDelay?: number;
  loop?: boolean;
  className?: string;
  cursorChar?: string;
  cursorColor?: string;
  textColor?: string;
  fontSize?: string | number;
  fontWeight?: number;
  startOnVisible?: boolean;
}

export default function ProTextType({
  texts,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseDuration = 2000,
  initialDelay = 0,
  loop = true,
  className = "",
  cursorChar = "|",
  cursorColor = "var(--text-hero)",
  textColor = "var(--text-hero)",
  fontSize = "clamp(18px, 2vw, 28px)",
  fontWeight = 600,
  startOnVisible = true,
}: ProTextTypeProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentText = texts[currentTextIndex] ?? "";

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;
    const el = containerRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible(true);
        });
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [startOnVisible]);

  const run = useCallback(() => {
    if (!isVisible) return;
    let timeout: ReturnType<typeof setTimeout>;

    const processed = currentText;

    const step = () => {
      if (isDeleting) {
        if (displayedText.length === 0) {
          setIsDeleting(false);
          if (currentTextIndex === texts.length - 1 && !loop) return;
          setCurrentTextIndex((i) => (i + 1) % texts.length);
          setCurrentCharIndex(0);
          timeout = setTimeout(() => {}, pauseDuration);
        } else {
          timeout = setTimeout(() => {
            setDisplayedText((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        }
      } else {
        if (currentCharIndex < processed.length) {
          timeout = setTimeout(() => {
            setDisplayedText((prev) => prev + processed[currentCharIndex]);
            setCurrentCharIndex((i) => i + 1);
          }, typingSpeed);
        } else {
          if (texts.length > 1 && (loop || currentTextIndex < texts.length - 1)) {
            timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
          }
        }
      }
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === "") {
      timeout = setTimeout(step, initialDelay);
    } else {
      step();
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [
    isVisible,
    currentText,
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    initialDelay,
    loop,
    texts.length,
    currentTextIndex,
    texts,
  ]);

  useEffect(() => {
    const cleanup = run();
    return cleanup;
  }, [run]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        flexWrap: "wrap",
        fontSize,
        fontWeight,
        color: textColor,
        lineHeight: 1.4,
        minHeight: "1.4em",
      }}
    >
      <span style={{ whiteSpace: "pre-wrap" }}>{displayedText}</span>
      <motion.span
        style={{
          marginLeft: "0.15em",
          display: "inline-block",
          color: cursorColor,
          fontSize,
          fontWeight,
        }}
        animate={{ opacity: [1, 0] }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        {cursorChar}
      </motion.span>
    </div>
  );
}
