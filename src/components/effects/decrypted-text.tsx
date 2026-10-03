/* 출처: React Bits "DecryptedText" (@react-bits/DecryptedText-TS-TW, https://reactbits.dev)
   라이선스: MIT + Commons Clause © David Haz — 사이트 내 사용은 허용, 컴포넌트 자체 재판매 금지.
   변경: 랩 노트북 라벨용으로 '진입 시 1회 · 순차 해독'만 남기고 축약.
   motion 의존 제거, prefers-reduced-motion 시 원문 즉시 표시, 스크린리더에는 항상 원문. */
"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·#_";

interface DecryptedTextProps {
	text: string;
	/** 한 글자 해독 간격 (ms) */
	speed?: number;
	className?: string;
	/** 아직 해독되지 않은 글자 스타일 */
	encryptedClassName?: string;
}

function scramble(text: string, revealed: number): string {
	return text
		.split("")
		.map((ch, i) => {
			if (i < revealed || ch === " ") return ch;
			return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
		})
		.join("");
}

export function DecryptedText({
	text,
	speed = 32,
	className = "",
	encryptedClassName = "",
}: DecryptedTextProps) {
	const prefersReduced = useReducedMotion();
	const ref = useRef<HTMLSpanElement>(null);
	const [revealed, setRevealed] = useState(text.length);
	const [display, setDisplay] = useState(text);

	useEffect(() => {
		const el = ref.current;
		if (!el || prefersReduced) return;

		let timer: ReturnType<typeof setInterval> | null = null;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				observer.disconnect();
				let count = 0;
				timer = setInterval(() => {
					count += 1;
					setRevealed(count);
					setDisplay(scramble(text, count));
					if (count >= text.length && timer) clearInterval(timer);
				}, speed);
			},
			{ threshold: 0.1 },
		);
		observer.observe(el);
		return () => {
			observer.disconnect();
			if (timer) clearInterval(timer);
		};
	}, [text, speed, prefersReduced]);

	return (
		<span ref={ref} className="inline-block whitespace-pre-wrap">
			<span className="sr-only">{text}</span>
			<span aria-hidden="true">
				{display.split("").map((ch, i) => (
					<span key={i} className={i < revealed ? className : encryptedClassName}>
						{ch}
					</span>
				))}
			</span>
		</span>
	);
}
