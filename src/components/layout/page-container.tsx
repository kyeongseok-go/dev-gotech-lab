import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main className={cn("mx-auto max-w-5xl px-5 py-12", className)}>
      {children}
    </main>
  );
}
