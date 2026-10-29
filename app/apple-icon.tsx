import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1f4d3b',
          border: '10px solid #e58d54',
          borderRadius: 40,
          color: '#ffffff',
          display: 'flex',
          fontFamily: 'Georgia, serif',
          fontSize: 126,
          fontWeight: 700,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          width: '100%',
          paddingBottom: 12,
        }}
      >
        b
      </div>
    ),
    size,
  )
}

