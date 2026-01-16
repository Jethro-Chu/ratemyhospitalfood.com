export default function SearchHero({ onSearch }) {
    return (
        <div style={{
            padding: '80px 20px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
            color: 'white',
            marginBottom: '40px'
        }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '16px', letterSpacing: '-1px' }}>
                Find your hospital food.
            </h1>
            <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                Read reviews, check ratings, and avoid the mystery meat.
            </p>

            <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                <input
                    type="text"
                    placeholder="Search for a hospital..."
                    onChange={(e) => onSearch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '16px 24px',
                        fontSize: '1.2rem',
                        borderRadius: '50px',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        outline: 'none'
                    }}
                />
                <div style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'var(--accent)',
                    color: 'black',
                    height: '40px',
                    width: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}>
                    🔍
                </div>
            </div>
        </div>
    );
}
