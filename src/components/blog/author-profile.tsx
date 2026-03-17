import Image from "next/image";
import { AUTHOR_NAME, AUTHOR_IMAGE } from "@/lib/constants";

interface AuthorProfileProps {
  date: string;
  readingTime: number;
}

export function AuthorProfile({ date, readingTime }: AuthorProfileProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-border">
        <Image
          src={AUTHOR_IMAGE}
          alt={AUTHOR_NAME}
          fill
          className="object-cover"
          style={{ objectPosition: "50% 8%" }}
          sizes="40px"
        />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{AUTHOR_NAME}</p>
        <p className="text-xs text-muted-foreground">
          {date} · {readingTime}분 읽기
        </p>
      </div>
    </div>
  );
}
