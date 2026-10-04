interface SpinBadgeProps {
  /** 원주를 따라 흐르는 텍스트 */
  text: string;
  /** 중앙 이모지/심볼 */
  centerEmoji?: string;
  className?: string;
}

/**
 * 회전하는 원형 스탬프 배지 (san.framer "WORKED WITH CLIENTS").
 * SVG textPath로 원주 텍스트, CSS spin-slow 키프레임.
 */
export function SpinBadge({ text, centerEmoji = "✦", className }: SpinBadgeProps) {
  // 텍스트를 두 바퀴 반복해 자연스럽게 채움
  const labelText = `${text} • ${text} • `;
  return (
    <div className={`spin-badge ${className ?? ""}`} aria-label={text}>
      <svg className="ring" viewBox="0 0 100 100" aria-hidden>
        <defs>
          <path
            id="spin-circle"
            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
          />
        </defs>
        <text>
          <textPath href="#spin-circle">{labelText}</textPath>
        </text>
      </svg>
      <span className="text-2xl" aria-hidden>
        {centerEmoji}
      </span>
    </div>
  );
}
