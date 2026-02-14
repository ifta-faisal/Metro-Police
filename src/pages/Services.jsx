import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Services.css'

export default function Services() {
  const navigate = useNavigate()
  const location = useLocation()

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // ✅ ADDED PART (URL-based category selection)
  useEffect(() => {
    const params = new URLSearchParams(location.search)

    if (params.has('safety')) setSelectedCategory('safety')
    else if (params.has('emergency')) setSelectedCategory('emergency')
    else if (params.has('certificates')) setSelectedCategory('certificates')
    else if (params.has('reports')) setSelectedCategory('reports')
    else if (params.has('payments')) setSelectedCategory('payments')
  }, [location])

  // 🔹 Services based on Quick Actions
  const allServices = [
    {
      id: 1,
      category: 'payments',
      title: 'Check Traffic Fine',
      description: 'Check and pay your traffic fines online.',
      duration: 'Instant',
      fee: 'Variable'
    },
    {
      id: 2,
      category: 'reports',
      title: 'File GD Report',
      description: 'Report a crime or general incident.',
      duration: 'Immediate',
      fee: 'Free'
    },
    {
      id: 3,
      category: 'reports',
      title: 'Report Lost Item',
      description: 'Report a lost item to the police database.',
      duration: 'Immediate',
      fee: 'Free'
    },
    {
      id: 4,
      category: 'reports',
      title: 'Missing Person',
      description: 'Report a missing person and track updates.',
      duration: 'Immediate',
      fee: 'Free'
    },
    {
      id: 5,
      category: 'certificates',
      title: 'Apply for PCC',
      description: 'Apply for Police Clearance Certificate.',
      duration: '3–5 business days',
      fee: '৳500'
    },
    {
      id: 6,
      category: 'emergency',
      title: 'SOS Emergency',
      description: 'Get immediate emergency police assistance.',
      duration: 'Instant',
      fee: 'Free'
    },
    {
      id: 7,
      category: 'safety',
      title: 'Crime Risk Map',
      description: 'View crime risk heatmap by location.',
      duration: 'Instant',
      fee: 'Free'
    },
    {
      id: 8,
      category: 'safety',
      title: 'Safe Route GPS',
      description: 'Plan safe routes for night travel.',
      duration: 'Instant',
      fee: 'Free'
    }
  ]

  // 🔹 Categories
  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'reports', label: 'Reports' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'payments', label: 'Payments' },
    { id: 'safety', label: 'Safety Tools' },
    { id: 'emergency', label: 'Emergency' }
  ]

  // 🔹 Filtering logic
  const filteredServices = allServices.filter(service => {
    const matchesCategory =
      selectedCategory === 'all' || service.category === selectedCategory

    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesCategory && matchesSearch
  })

  // 🔹 Redirect to Login on Apply
  const handleApply = () => {
    navigate('/login')
  }

  return (
    <main className="services-page">
      <section className="page-hero">
        <div className="container">
          <h1>Metro Police Services</h1>
          <p>Access essential police services quickly and securely</p>
        </div>
      </section>

      <section className="services-section">
        <div className="container">

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-tabs">
            {categories.map(category => (
              <button
                key={category.id}
                className={`filter-btn ${
                  selectedCategory === category.id ? 'active' : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="services-list">
            {filteredServices.length > 0 ? (
              filteredServices.map(service => (
                <div key={service.id} className="service-item">
                  <div className="service-content">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>

                    <div className="service-meta">
                      <span className="duration">⏱ {service.duration}</span>
                      <span className="fee">💰 {service.fee}</span>
                    </div>
                  </div>

                  <button
                    className="apply-btn"
                    onClick={handleApply}
                  >
                    Apply Now
                  </button>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No services found matching your search.</p>
                <button
                  className="reset-btn"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
