import { IconProps } from "@/utils/interfaces";


export default function RovnoLogotypeIconEmpty({ width = 26, height = 26, style, className }: IconProps) {
  return (
    <svg className={className} style={style} width={width} height={height} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26 26H0V0H26V26ZM8.97363 20.8584H10.6504V20.2949H9.55566V6.33398H10.6504V5.76172H8.97363V20.8584ZM15.1641 6.33398H16.2598V20.2949H15.1641V20.8584H16.8418V5.76172H15.1641V6.33398Z" fill="var(--on-bg-high)" />
    </svg>
  );
}
