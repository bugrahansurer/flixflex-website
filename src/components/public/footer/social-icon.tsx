import { getSocialIcon } from "@/lib/social-platforms"

export function SocialIcon({
  platform,
  size = 16,
}: {
  platform: string
  size?: number
}) {
  const Icon = getSocialIcon(platform)
  return <Icon size={size} aria-hidden />
}
