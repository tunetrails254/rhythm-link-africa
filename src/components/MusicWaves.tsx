import { cn } from "@/lib/utils";

interface MusicWavesProps {
  className?: string;
  barCount?: number;
}

export const MusicWaves = ({ className, barCount = 5 }: MusicWavesProps) => {
  return (
    <div className={cn("flex items-end gap-1 h-8", className)}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full animate-wave"
          style={{
            height: "100%",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
};
