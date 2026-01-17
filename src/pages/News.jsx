import './News.css'

export default function News() {
  const articles = [
    {
      id: 1,
      title: 'New Mobile App Launch',
      date: 'January 2, 2026',
      category: 'Announcement',
      excerpt: 'We are excited to announce the launch of our new mobile application, making it even easier to access services on the go.',
      image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      id: 2,
      title: 'Enhanced Security Measures',
      date: 'December 28, 2025',
      category: 'Security',
      excerpt: 'We have implemented additional security layers to better protect your personal information and ensure safe transactions.',
      image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      id: 3,
      title: '50% Faster Processing Times',
      date: 'December 20, 2025',
      category: 'Improvement',
      excerpt: 'Thanks to our system upgrades, we can now process most applications 50% faster than before.',
      image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      id: 4,
      title: 'New Services Added',
      date: 'December 15, 2025',
      category: 'Services',
      excerpt: 'We have added 10 new services to our portal, expanding our offerings to better serve the community.',
      image: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      id: 5,
      title: 'Community Feedback Program',
      date: 'December 10, 2025',
      category: 'Community',
      excerpt: 'Help us improve! Join our community feedback program and share your suggestions for better services.',
      image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      id: 6,
      title: 'Maintenance Schedule',
      date: 'December 5, 2025',
      category: 'Maintenance',
      excerpt: 'Scheduled system maintenance will take place on December 12 from 2 AM to 4 AM EST. Services will be temporarily unavailable.',
      image: 'https://images.pexels.com/photos/3194519/pexels-photo-3194519.jpeg?auto=compress&cs=tinysrgb&w=600'
    }
  ]

  const getCategoryClass = (category) => {
    return `category-${category.toLowerCase().replace(/\s+/g, '-')}`
  }

  return (
    <main className="news-page">
      <section className="page-hero">
        <div className="container">
          <h1>News & Updates</h1>
          <p>Stay informed about the latest developments and announcements</p>
        </div>
      </section>

      <section className="news-section">
        <div className="container">
          <div className="news-grid">
            {articles.map(article => (
              <article key={article.id} className="news-card">
                <div className="news-image">
                  <img src={article.image} alt={article.title} />
                  <div className={`category-badge ${getCategoryClass(article.category)}`}>
                    {article.category}
                  </div>
                </div>
                <div className="news-content">
                  <p className="news-date">{article.date}</p>
                  <h3>{article.title}</h3>
                  <p className="news-excerpt">{article.excerpt}</p>
                  {/* <a href="#" className="read-more">
                    Read More →
                  </a> */}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
