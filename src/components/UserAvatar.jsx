import { USERS } from '../store/AppContext'

const AVATAR_IMG = {
  igor: '/pm/avatar-beatrice.png',
  beatrice: '/pm/avatar-igor.jpg',
}

function SingleAvatar({ userId, size, showTooltip, style }) {
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
        ...style,
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

export default function UserAvatar({ userId, size = 24, showTooltip = false }) {
  if (userId === 'both') {
    const overlap = size * 0.45
    return (
      <div className="flex-shrink-0 flex items-center" style={{ width: size + overlap, height: size }} title={showTooltip ? 'Igor & Beatrice' : undefined}>
        <SingleAvatar userId="igor" size={size} style={{ zIndex: 1, background: '#1a1a1d' }} />
        <SingleAvatar userId="beatrice" size={size} style={{ marginLeft: -overlap, background: '#1a1a1d' }} />
      </div>
    )
  }

  return <SingleAvatar userId={userId} size={size} showTooltip={showTooltip} />
}
