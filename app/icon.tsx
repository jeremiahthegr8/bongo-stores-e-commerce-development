import { ImageResponse } from 'next/og'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1f4d3b',
          border: '28px solid #e58d54',
          borderRadius: 112,
          color: '#ffffff',
          display: 'flex',
          fontFamily: 'Georgia, serif',
          fontSize: 350,
          fontWeight: 700,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          width: '100%',
          paddingBottom: 30,
        }}
      >
        b
      </div>
    ),
    size,
  )
}

