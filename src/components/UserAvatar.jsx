import { USERS } from '../store/AppContext'

export default function UserAvatar({ userId, size = 24, showTooltip = false }) {
  const user = USERS.find(u => u.id === userId)
  if (!user) return null

  return (
    <div
      title={showTooltip ? user.name : undefined}
      className="rounded-full flex items-center justify-center flex-shrink-0 font-semibold select-none"
      style={{
        width: size,
        height: size,
        background: user.color + '33',
        border: `1.5px solid ${user.color}66`,
        color: user.color,
        fontSize: size * 0.38,
      }}
    >
      {user.initials}
    </div>
  )
}
