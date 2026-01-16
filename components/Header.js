import Link from 'next/link';

export default function Header() {
    return (
        <header style={{
            borderBottom: '1px solid var(--border)',
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            zIndex: 100
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Link href="/" style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '40px', width: 'auto' }} />
                    <span>Rate My <span style={{ fontStyle: 'italic' }}>Hospital Food</span></span>
                </Link>
                <nav>
                    <Link href="/add" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                        Add Hospital
                    </Link>
                </nav>
            </div>
        </header>
    );
}
