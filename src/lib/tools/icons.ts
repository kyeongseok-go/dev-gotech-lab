import {
  FileText,
  Image as ImageIcon,
  KeyRound,
  Languages,
  LayoutGrid,
  ListChecks,
  type LucideIcon,
  Network,
  PenLine,
  Sparkles,
  Wand2,
  Workflow,
  Wrench,
} from "lucide-react";

/**
 * showcase frontmatter 의 `icon`(lucide 이름) → 컴포넌트. 허용 목록 밖 이름은 기본 아이콘.
 * 전체 lucide 를 동적으로 불러오면 번들이 커지므로 쓰는 것만 여기에 추가한다.
 */
const TOOL_ICONS: Record<string, LucideIcon> = {
  "file-text": FileText,
  image: ImageIcon,
  "key-round": KeyRound,
  languages: Languages,
  "layout-grid": LayoutGrid,
  "list-checks": ListChecks,
  network: Network,
  "pen-line": PenLine,
  sparkles: Sparkles,
  "wand-2": Wand2,
  workflow: Workflow,
  wrench: Wrench,
};

export const DEFAULT_TOOL_ICON: LucideIcon = Wrench;

export function getToolIcon(name: string | undefined): LucideIcon {
  return name && isKnownToolIcon(name) ? TOOL_ICONS[name] : DEFAULT_TOOL_ICON;
}

export function isKnownToolIcon(name: string): boolean {
  // `in` 은 프로토타입(toString 등)까지 참으로 본다
  return Object.hasOwn(TOOL_ICONS, name);
}
