export default function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Navigation Bar */}
      <nav style={{
        backgroundColor: '#000',
        padding: '1.5rem 2rem',
        borderBottom: '1px solid #e5e5e5'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <a href="#" style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>Home</a>
          <a href="#" style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>About</a>
          <a href="#" style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>Contact</a>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        padding: '2rem'
      }}>
        <h1 style={{
          fontSize: '5rem',
          fontWeight: '300',
          color: '#000',
          letterSpacing: '-0.02em',
          margin: 0
        }}>
          Hello World
        </h1>
      </main>
    </div>
  );
}