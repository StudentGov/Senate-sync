// import type React from "react"
// declare module "framer-motion" {
//   export interface MotionProps {
//     initial?: object | string
//     animate?: object | string
//     exit?: object | string
//     transition?: {
//       duration?: number
//       delay?: number
//       staggerChildren?: number
//       [key: string]: any
//     }
//     variants?: {
//       [key: string]: object
//     }
//     className?: string
//     style?: React.CSSProperties
//     [key: string]: unknown
//   }

//   export type Motion = {
//     [K in keyof JSX.IntrinsicElements]: React.ForwardRefExoticComponent<
//       MotionProps & JSX.IntrinsicElements[K] & React.RefAttributes<Element>
//     >
//   }

//   export const motion: Motion

//   export interface AnimatePresenceProps {
//     children: React.ReactNode
//     mode?: "sync" | "wait" | "popLayout"
//     initial?: boolean
//     onExitComplete?: () => void
//     exitBeforeEnter?: boolean
//     presenceAffectsLayout?: boolean
//   }

//   export const AnimatePresence: React.FC<AnimatePresenceProps>

//   namespace JSX {
//     interface IntrinsicElements {
//       [elemName: string]: any
//     }
//   }
// }
