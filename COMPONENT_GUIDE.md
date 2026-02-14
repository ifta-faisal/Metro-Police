# Component Implementation Guide

This guide provides templates and patterns for implementing the remaining frontend components.

## 📋 Remaining Components to Implement

### 1. Lost Items Page (`src/pages/LostItems.jsx`)
```jsx
// Similar structure to CrimeReports.jsx
// Features:
// - Form to report lost item
// - List of user's lost item reports
// - Generate certificate button
// - Status tracking
```

### 2. Missing Persons Page (`src/pages/MissingPersons.jsx`)
```jsx
// Features:
// - Form to report missing person
// - Auto-match results display
// - List of all missing persons
// - Match suggestions
```

### 3. Missing Vehicles Page (`src/pages/MissingVehicles.jsx`)
```jsx
// Similar to MissingPersons.jsx
// Features:
// - Vehicle report form
// - Auto-match by vehicle number
// - Vehicle search
```

### 4. PCC Application Page (`src/pages/PCC.jsx`)
```jsx
// Features:
// - PCC application form
// - Application status tracking
// - Certificate download
// - Application history
```

### 5. Safe Route Page (`src/pages/SafeRoute.jsx`)
```jsx
// Features:
// - Start/End location input
// - Map visualization (integrate Google Maps)
// - Route calculation
// - Safety score display
// - Alternative routes
```

### 6. Chatbot Page (`src/pages/Chatbot.jsx`)
```jsx
// Features:
// - Chat interface
// - Message history
// - Intent-based responses
// - Quick action buttons
```

### 7. Criminal Search Page (`src/pages/CriminalSearch.jsx`)
```jsx
// Features:
// - Search by NID
// - Search by name
// - Face upload (for face recognition)
// - Search results display
```

### 8. Crime Prediction Page (`src/pages/CrimePrediction.jsx`)
```jsx
// Features:
// - Generate predictions button
// - Prediction map visualization
// - Risk level indicators
// - Area-wise predictions
```

## 🔧 Common Patterns

### API Call Pattern
```jsx
import { useState, useEffect } from 'react';
import api from '../utils/api';

function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/endpoint');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {/* Render data */}
    </div>
  );
}
```

### Form Submission Pattern
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const res = await api.post('/api/endpoint', formData);
    setMessage('Success!');
    // Reset form or redirect
  } catch (err) {
    setError(err.response?.data?.error || 'Error');
  } finally {
    setLoading(false);
  }
};
```

### Protected Route Pattern
```jsx
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedComponent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/Login" />;

  return <div>Protected Content</div>;
}
```

## 🗺️ Map Integration (Google Maps)

### Install Google Maps
```bash
npm install @react-google-maps/api
```

### Example Usage
```jsx
import { GoogleMap, LoadScript, HeatmapLayer } from '@react-google-maps/api';

function MapComponent() {
  const mapContainerStyle = {
    width: '100%',
    height: '500px'
  };

  const center = {
    lat: 23.8103,
    lng: 90.4125
  };

  return (
    <LoadScript googleMapsApiKey="YOUR_API_KEY">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
      >
        {/* Add markers, heatmap, etc. */}
      </GoogleMap>
    </LoadScript>
  );
}
```

## 📄 PDF Generation (jsPDF)

### Install jsPDF
```bash
npm install jspdf
```

### Example Usage
```jsx
import jsPDF from 'jspdf';

const generatePDF = (data) => {
  const doc = new jsPDF();
  doc.text('Certificate', 20, 20);
  doc.text(`Name: ${data.name}`, 20, 30);
  // Add more content
  doc.save('certificate.pdf');
};
```

## 🎨 Styling Guidelines

- Use CSS modules or component-specific CSS files
- Follow existing component styles
- Use consistent color scheme:
  - Primary: #0066cc
  - Success: #28a745
  - Warning: #ff9900
  - Danger: #ff3333
- Responsive design with flexbox/grid

## 🔗 Adding Routes

Update `src/App.jsx`:
```jsx
import NewComponent from "./pages/NewComponent";

// In Routes:
<Route path="/new-feature" element={<NewComponent />} />
```

## ✅ Testing Checklist

- [ ] Component renders without errors
- [ ] API calls work correctly
- [ ] Error handling works
- [ ] Loading states display
- [ ] Form validation works
- [ ] Responsive design
- [ ] Authentication required (if needed)
