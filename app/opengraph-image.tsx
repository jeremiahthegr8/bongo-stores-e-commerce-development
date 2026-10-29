import { ImageResponse } from 'next/og'

export const alt = 'Bongo Stores — Good shoes. Good energy.'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'stretch',
          background: '#fbfaf7',
          color: '#1f4d3b',
          display: 'flex',
          fontFamily: 'Arial, sans-serif',
          height: '100%',
          padding: 54,
          position: 'relative',
          width: '100%',
        }}
      >
        <div
          style={{
            background: '#1f4d3b',
            borderRadius: 40,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'space-between',
            padding: 54,
            width: '100%',
          }}
        >
          <div style={{ alignItems: 'center', display: 'flex' }}>
            <div
              style={{
                alignItems: 'center',
                background: '#e58d54',
                borderRadius: 22,
                color: '#1f4d3b',
                display: 'flex',
                fontFamily: 'Georgia, serif',
                fontSize: 74,
                fontWeight: 700,
                height: 104,
                justifyContent: 'center',
                paddingBottom: 8,
                width: 104,
              }}
            >
              b
            </div>
            <div
              style={{
                fontSize: 29,
                fontWeight: 700,
                letterSpacing: 1,
                marginLeft: 22,
                textTransform: 'uppercase',
              }}
            >
              Bongo Stores
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                color: '#e58d54',
                display: 'flex',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 4,
                textTransform: 'uppercase',
              }}
            >
              Accra · Ghana
            </div>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Georgia, serif',
                fontSize: 78,
                letterSpacing: -3,
                lineHeight: 1.06,
                marginTop: 18,
              }}
            >
              Good shoes. Good energy.
            </div>
            <div
              style={{
                color: '#d2dfd6',
                display: 'flex',
                fontSize: 28,
                marginTop: 24,
              }}
            >
              Sneakers, slides &amp; jerseys — delivered across Accra every Saturday.
            </div>
          </div>

          <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ color: '#d2dfd6', display: 'flex', fontSize: 22 }}>
              bongostores.netlify.app
            </div>
            <div
              style={{
                background: '#e58d54',
                borderRadius: 999,
                color: '#1f4d3b',
                display: 'flex',
                fontSize: 21,
                fontWeight: 700,
                padding: '15px 25px',
              }}
            >
              Shop the drop →
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
