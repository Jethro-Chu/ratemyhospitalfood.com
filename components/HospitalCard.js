import Link from 'next/link';

export default function HospitalCard({ hospital }) {
    const ratingColor = hospital.rating >= 4 ? '#4CAF50' : hospital.rating >= 2.5 ? '#FFC107' : '#F44336';

    return (
        <Link href={`/hospital/${hospital.id}`} style={{ display: 'block', height: '100%' }}>
            <div className="card" style={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
            }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{
                        background: ratingColor,
                        color: 'white',
                        fontWeight: '900',
                        fontSize: '1.5rem',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px'
                    }}>
                        {hospital.rating.toFixed(1)}
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
                        {hospital.numRatings} ratings
                    </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>{hospital.name}</h3>
                <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '16px', flexGrow: 1 }}>{hospital.location}</p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {hospital.tags && hospital.tags.map(tag => (
                        <span key={tag} style={{
                            background: '#f0f0f0',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: '#555'
                        }}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}
