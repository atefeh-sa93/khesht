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

export function IconRefresh(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M19.5 4.5v4h-4" />
    </Icon>
  )
}

export function IconWifiOff(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 18.5h.01" />
      <path d="M9.2 15.6a4 4 0 0 1 5.6 0" />
      <path d="M6.3 12.7a8 8 0 0 1 4-2.1M14.6 10.8a8 8 0 0 1 3.1 1.9" />
      <path d="M3.5 9.8a12 12 0 0 1 3.4-2.3M10.8 6.6a12 12 0 0 1 9.7 3.2" />
      <path d="M4 4l16 16" />
    </Icon>
  )
}

export function IconShieldCheck(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5l7 3v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9v-5z" />
      <path d="M9 12l2 2 4-4" />
    </Icon>
  )
}

export function IconAlertTriangle(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4L3 19.5h18z" />
      <path d="M12 10v4M12 17h.01" />
    </Icon>
  )
}

export function IconPlus(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  )
}

export function IconX(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 7h15M10 11v6M14 11v6" />
      <path d="M6 7l1 12.5h10L18 7M9.5 7V4.5h5V7" />
    </Icon>
  )
}

export function IconNote(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 3.5h9l3.5 3.5v13.5H6z" />
      <path d="M9 10h6M9 13.5h6M9 17h3.5" />
    </Icon>
  )
}

export function IconDownload(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14" />
    </Icon>
  )
}

export function IconUpload(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 19.5h14" />
    </Icon>
  )
}
