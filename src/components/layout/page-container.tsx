import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main className={cn("mx-auto max-w-4xl px-4 py-10", className)}>
      {children}
    </main>
  );
}
