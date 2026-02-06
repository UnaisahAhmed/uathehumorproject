import { supabase } from '@/lib/supabase'

interface Image {
  id: string
  url: string | null
  image_description: string | null
  created_datetime_utc: string
  is_public: boolean | null
}

export default async function Home() {
  const { data: images, error } = await supabase
    .from('images')
    .select('id, url, image_description, created_datetime_utc, is_public')
    .eq('is_public', true)
    .order('created_datetime_utc', { ascending: false })

  if (error) {
    console.error('Error fetching images:', error)
  }

  return (
    <div>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">Humor Project Gallery</div>
          <div className="nav-links">
            <a href="#">Home</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero">
        <h1>Explore the Gallery!</h1>
        <p>{images?.length || 0} images</p>
      </div>

      {/* Gallery */}
      <div className="gallery-container">
        {images && images.length > 0 ? (
          <div className="image-grid">
            {images.map((image) => (
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
        )}
      </div>
    </div>
  )
}