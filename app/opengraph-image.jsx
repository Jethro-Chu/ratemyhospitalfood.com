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
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
          padding: '80px 120px',
          fontFamily: 'sans-serif',
          textAlign: 'center'
        }}
      >
        {/* Top Branding */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <img
            src={logoBase64}
            alt="Logo"
            style={{ width: 64, height: 64, marginRight: '16px' }}
          />
          <div style={{ fontSize: 40, fontWeight: 'bold', color: '#27272a', display: 'flex' }}>
            Rate My <span style={{ color: '#C5612B', marginLeft: '8px' }}>Hospital Food</span>
          </div>
        </div>

        {/* Main Text */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '50px' }}>
          <div style={{ fontSize: 72, fontWeight: '900', color: '#18181b', lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.02em' }}>
            Find better hospital food.
          </div>
          <div style={{ fontSize: 32, color: '#52525b', lineHeight: 1.5, maxWidth: '800px', fontWeight: '500' }}>
            Real cafeteria reviews from patients, staff, and visitors.
          </div>
        </div>

        {/* Accent Rating Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '16px 32px',
          borderRadius: '100px',
          boxShadow: '0 10px 25px -5px rgba(234, 88, 12, 0.1)',
          marginBottom: '50px'
        }}>
          <div style={{ display: 'flex', marginRight: '12px' }}>
            {/* 5 Stars */}
            {[1, 2, 3, 4, 5].map(i => (
              <svg key={i} width="24" height="24" viewBox="0 0 24 24" fill="#F59E0B" style={{ margin: '0 2px' }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#3F3F46' }}>
            5.0 Trusted Reviews
          </div>
        </div>

        {/* Footer Domain */}
        <div style={{ marginTop: 'auto', fontSize: 24, color: '#C5612B', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          ratemyhospitalfood.com
        </div>
      </div>
    ),
    { ...size }
  );
}
