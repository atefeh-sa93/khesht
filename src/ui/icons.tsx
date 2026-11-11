import type { ReactNode, SVGProps } from 'react'

// A few hand-drawn icons instead of an icon library: they are tiny, need no
// dependency and always match the text color. Add more in the same style:
// a 24×24 box, 1.5 stroke, round caps and joins, no fill.

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number
}

function Icon({ size = 24, strokeWidth = 1.5, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      // Decorative by default: the text next to an icon names it.
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconHome(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 9.5V20h4v-5h4v5h4V9.5" />
    </Icon>
  )
}

export function IconSettings(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="18" r="2" />
    </Icon>
  )
}

export function IconWorld(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z" />
    </Icon>
  )
}
