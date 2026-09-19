import type { SVGProps } from "react";

type LineLogoProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  weight?: string;
};

export function LineLogo({ size = 24, weight = "regular", ...props }: LineLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 3.25C6.62 3.25 2.25 6.72 2.25 11c0 3.85 3.44 7.08 8.12 7.69.32.07.75.21.86.48.1.25.06.64.03.89l-.14.84c-.04.25-.2.98.85.54 1.06-.44 5.7-3.35 7.78-5.72C21.18 14.14 21.75 12.6 21.75 11c0-4.28-4.37-7.75-9.75-7.75Z"
        stroke="currentColor"
        strokeWidth={weight === "bold" ? 1.7 : 1.35}
        strokeLinejoin="round"
      />
      <text
        x="12"
        y="13.15"
        fill="currentColor"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="5.15"
        fontWeight="700"
        letterSpacing="-0.25"
      >
        LINE
      </text>
    </svg>
  );
}
