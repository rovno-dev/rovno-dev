import { buttonUnidekaVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export default function IllustrationCard({ icon, className, style }: { icon: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        buttonUnidekaVariants.glass, 
        `absolute flex items-center justify-center size-30 md:size-38 2xl:size-52 rounded-3xl md:rounded-4xl 2xl:rounded-5xl transition-transform duration-1000 ease-out select-none pointer-events-none ${className}`
      )}
      style={style}
    >
      <div className="flex items-center justify-center h-full text-(--on-bg-low) [&_svg]:size-20 md:[&_svg]:size-24 2xl:[&_svg]:size-32 opacity-80 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
    </div>
  );
}
