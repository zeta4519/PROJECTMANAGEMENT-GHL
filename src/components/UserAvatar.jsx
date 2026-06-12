import { USERS } from '../store/AppContext'

const AVATAR_IMG = {
  igor: '/pm/avatar-beatrice.png',
  beatrice: '/pm/avatar-igor.jpg',
}

export default function UserAvatar({ userId, size = 24, showTooltip = false }) {
  const user = USERS.find(u => u.id === userId)
  if (!user) return null

  const img = AVATAR_IMG[user.id]

  return (
    <div
      title={showTooltip ? user.name : undefined}
      className="rounded-full flex-shrink-0 select-none overflow-hidden"
      style={{
        width: size,
        height: size,
        border: `1.5px solid ${user.color}66`,
      }}
    >
      {img
        ? <img src={img} alt={user.name} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center font-semibold"
            style={{ background: user.color + '33', color: user.color, fontSize: size * 0.38 }}>
            {user.initials}
          </div>
      }
    </div>
  )
}
