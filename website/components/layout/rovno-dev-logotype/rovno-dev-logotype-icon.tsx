import { IconProps } from "@/utils/interfaces";


export default function RovnoLogotypeIcon({ width = 26, height = 26, style, className }: IconProps) {
  return (
    <svg className={className} style={style} width={width} height={height} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26 0H0V26H26V0Z" fill="var(--on-bg-high)" />
      <path d="M15.1643 20.8585V20.2949H16.2593V6.33398H15.1643V5.76172H16.8418V20.8585H15.1643Z" fill="var(--bg)" />
      <path d="M10.6505 20.8585V20.2949H9.55555V6.33398H10.6505V5.76172H8.97313V20.8585H10.6505Z" fill="var(--bg)" />
    </svg>
  );
}
