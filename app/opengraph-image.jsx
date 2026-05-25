import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const alt = 'Rate My Hospital Food';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  const logoData = readFileSync(join(process.cwd(), 'public', 'logo.png'));
  const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFF7ED',
          padding: '100px 120px',
          justifyContent: 'center',
          fontFamily: 'sans-serif'
        }}
      >
        {/* Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '50px' }}>
          <img
            src={logoBase64}
            alt="Logo"
            style={{ width: 80, height: 80, marginRight: '24px' }}
          />
          <div style={{ fontSize: 52, fontWeight: 'bold', color: '#27272a', display: 'flex' }}>
            Rate My <span style={{ color: '#C5612B', marginLeft: '8px' }}>Hospital Food</span>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 96, fontWeight: '900', color: '#18181b', lineHeight: 1.1, marginBottom: '24px' }}>
            Find your hospital food.
          </div>
          <div style={{ fontSize: 44, color: '#52525b', lineHeight: 1.4, maxWidth: '900px' }}>
            Read reviews, check ratings, and avoid the mystery meat.
          </div>
        </div>

        {/* Footer Domain */}
        <div style={{ marginTop: '60px', fontSize: 36, color: '#C5612B', fontWeight: 'bold' }}>
          ratemyhospitalfood.com
        </div>
      </div>
    ),
    { ...size }
  );
}
