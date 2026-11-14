import { IconProps } from "@/utils/interfaces";
import { animStyle, barAnim } from "./logo-animations";

interface LogoIconProps extends IconProps {
  animated?: boolean;
}

export default function LogoIcon({
  width = 26,
  height = 26,
  style,
  className,
  animated = false,
}: LogoIconProps) {
  return (
    <>
      {animStyle(animated)}
      <svg
        className={className}
        style={style}
        width={width}
        height={height}
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className={animated ? "logo-anim-square" : undefined}
          d="M26 0H0V26H26V0Z"
          fill="var(--on-bg-high)"
        />
        <path
          {...barAnim(animated, 1)}
          d="M10.6505 20.8585V20.2949H9.55555V6.33398H10.6505V5.76172H8.97313V20.8585H10.6505Z"
          fill="var(--bg)"
        />
        <path
          {...barAnim(animated, 2)}
          d="M15.1643 20.8585V20.2949H16.2593V6.33398H15.1643V5.76172H16.8418V20.8585H15.1643Z"
          fill="var(--bg)"
        />
      </svg>
    </>
  );
}