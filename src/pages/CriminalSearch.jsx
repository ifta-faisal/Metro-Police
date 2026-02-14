// Criminal Database Search
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './CriminalSearch.css';

export default function CriminalSearch() {
  const { isAuthenticated, user } = useAuth();
  const [searchType, setSearchType] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      let res;
      if (searchType === 'nid') {
        res = await api.get(`/criminals/search/nid/${searchQuery}`);
      } else if (searchType === 'name') {
        res = await api.get(`/criminals/search/name?name=${searchQuery}`);
      } else if (searchType === 'face_id') {
        res = await api.post('/criminals/search/face', { face_id: searchQuery });
      }

      if (searchType === 'face_id') {
        setResults(res.data.matches || []);
      } else {
        setResults(res.data.criminals || []);
      }

      if (results.length === 0 && !loading) {
        setError('No results found');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error searching database');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateRiskScore = (criminal) => {
    // Simple risk score calculation based on status and crime records
    let score = 0;
    if (criminal.status === 'wanted') score += 50;
    if (criminal.status === 'arrested') score += 20;
    
    // Count crime types mentioned
    if (criminal.crime_records) {
      const crimes = criminal.crime_records.split(',').length;
      score += crimes * 10;
    }
    
    return Math.min(100, score);
  };

  if (!isAuthenticated || (user?.role !== 'officer' && user?.role !== 'admin')) {
    return (
      <div className="criminal-search">
        <h1>Criminal Database Search</h1>
        <p>Officer/Admin access required</p>
      </div>
    );
  }

  return (
    <div className="criminal-search">
      <h1>Criminal Database Search</h1>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-type-selector">
          <label>Search By:</label>
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="name">Name</option>
            <option value="nid">NID Number</option>
            <option value="face_id">Face ID</option>
          </select>
        </div>

        <div className="search-input-group">
          <input
            type="text"
            placeholder={
              searchType === 'nid' ? 'Enter NID number' :
              searchType === 'face_id' ? 'Enter Face ID' :
              'Enter name'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="btn-search">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {results.length > 0 && (
        <div className="results-section">
          <h2>Search Results ({results.length})</h2>
          <div className="results-grid">
            {results.map((criminal) => (
              <div key={criminal.id} className="criminal-card">
                {criminal.photo_path && (
                  <img 
                    src={`http://localhost:5000${criminal.photo_path}`} 
                    alt={criminal.name}
                    className="criminal-photo"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="criminal-info">
                  <h3>{criminal.name}</h3>
                  <p><strong>NID:</strong> {criminal.nid || 'N/A'}</p>
                  <p><strong>Status:</strong> <span className={`status ${criminal.status}`}>{criminal.status}</span></p>
                  <p><strong>Date of Birth:</strong> {criminal.date_of_birth || 'N/A'}</p>
                  <p><strong>Gender:</strong> {criminal.gender || 'N/A'}</p>
                  {criminal.crime_records && (
                    <p><strong>Crime Records:</strong> {criminal.crime_records}</p>
                  )}
                  <p><strong>Risk Score:</strong> <span className="risk-score">{calculateRiskScore(criminal)}/100</span></p>
                  {criminal.face_id && (
                    <p><strong>Face ID:</strong> {criminal.face_id}</p>
                  )}
                  {criminal.match_confidence && (
                    <p><strong>Match Confidence:</strong> {criminal.match_confidence.toFixed(2)}%</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
