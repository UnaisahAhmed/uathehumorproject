import { createClient } from '@/utils/supabase/server'
import LoginButton from '@/components/auth/login-button'
import SignOutButton from '@/components/auth/signout-button'

interface Image {
  id: string
  url: string | null
  image_description: string | null
  created_datetime_utc: string
  is_public: boolean | null
}

export default async function Home() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let images: Image[] = []
  
  // Only fetch images if user is logged in
  if (user) {
    const { data, error } = await supabase
      .from('images')
      .select('id, url, image_description, created_datetime_utc, is_public')
      .eq('is_public', true)
      .order('created_datetime_utc', { ascending: false })

    if (error) {
      console.error('Error fetching images:', error)
    } else {
      images = data || []
    }
  }

  return (
    <div>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">Humor Project Gallery</div>
          <div className="nav-links">
            <a href="#">Home</a>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{user.email}</span>
                <SignOutButton />
              </div>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero">
        <h1>Explore the Gallery!</h1>
        {user ? (
          <p>{images?.length || 0} images</p>
        ) : (
          <p>Please sign in to view images</p>
        )}
      </div>

      {/* Gallery or Login Prompt */}
      <div className="gallery-container">
        {user ? (
          // Authenticated View: Show Gallery
          images && images.length > 0 ? (
            <div className="image-grid">
              {images.map((image: Image) => (
                <div key={image.id} className="image-card">
                  {image.url ? (
                    <div className="image-wrapper">
                      <img
                        src={image.url}
                        alt={image.image_description || 'Image'}
                      />
                    </div>
                  ) : (
                    <div className="image-placeholder">
                      No image
                    </div>
                  )}

                  {image.image_description && (
                    <div className="image-content">
                      <p className="image-description">
                        {image.image_description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No images found</h3>
              <p>Check back later</p>
            </div>
          )
        ) : (
          // Unauthenticated View: Show Login Prompt
          <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Welcome to the Humor Project</h2>
            <p style={{ marginBottom: '20px' }}>Sign in with Google to access the full gallery.</p>
            <LoginButton />
          </div>
        )}
      </div>
    </div>
  )
}