import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-16">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}
