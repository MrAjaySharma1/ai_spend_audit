import Image from "next/image";
import { cn } from "@/lib/utils";
import logoPic from "../../public/logo.png";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-violet-600 to-purple-700 shadow-lg shadow-violet-500/20 flex items-center justify-center border border-white/10">
        <Image
          src={logoPic}
          alt="AI Spend Audit Logo"
          fill
          className="object-cover scale-110 opacity-90"
          priority
        />
      </div>
      {showText && (
        <span className="font-bold text-white tracking-tight text-lg">
          AI Spend <span className="text-violet-400">Audit</span>
        </span>
      )}
    </div>
  );
}
