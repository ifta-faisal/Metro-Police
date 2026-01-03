import { useState } from 'react'
import './Services.css'

export default function Services() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const allServices = [
    {
      id: 1,
      category: 'permits',
      title: 'Business License',
      description: 'Apply for a business operating license to legally operate your business.',
      duration: '5-7 business days',
      fee: '$150'
    },
    {
      id: 2,
      category: 'permits',
      title: 'Vehicle Registration',
      description: 'Register or renew your vehicle with the department of transportation.',
      duration: '3-5 business days',
      fee: '$50'
    },
    {
      id: 3,
      category: 'certificates',
      title: 'Background Check Certificate',
      description: 'Obtain official background clearance certificate for employment.',
      duration: '7-10 business days',
      fee: '$25'
    },
    {
      id: 4,
      category: 'certificates',
      title: 'Traffic Clearance',
      description: 'Get clearance certificate proving no outstanding traffic violations.',
      duration: '1-2 business days',
      fee: '$15'
    },
    {
      id: 5,
      category: 'reports',
      title: 'Incident Report',
      description: 'File and retrieve official incident reports for insurance purposes.',
      duration: 'Immediate',
      fee: 'Free'
    },
    {
      id: 6,
      category: 'reports',
      title: 'Property Records',
      description: 'Access and download property ownership records and history.',
      duration: 'Immediate',
      fee: 'Free'
    },
    {
      id: 7,
      category: 'payments',
      title: 'Pay Traffic Fines',
      description: 'Pay outstanding traffic violations and fines securely online.',
      duration: 'Instant',
      fee: 'Variable'
    },
    {
      id: 8,
      category: 'payments',
      title: 'Utility Bills Payment',
      description: 'Pay water, electricity, and other utility bills through the portal.',
      duration: 'Instant',
      fee: 'Variable'
    }
  ]

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'permits', label: 'Permits & Licenses' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'reports', label: 'Reports' },
    { id: 'payments', label: 'Payments' }
  ]

  const filteredServices = allServices.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main className="services-page">
      <section className="page-hero">
        <div className="container">
          <h1>Metro-Police Services</h1>
          <p>Find and apply for the services you need</p>
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
                className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
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
                  <button className="apply-btn">Apply Now</button>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No services found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}
                  className="reset-btn"
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
