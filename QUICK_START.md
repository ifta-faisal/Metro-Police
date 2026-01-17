# Quick Start Guide - Dashboard Features

## 🚀 Installation

1. **Install new dependencies:**
   ```bash
   npm install leaflet react-leaflet recharts
   ```

2. **Start backend:**
   ```bash
   cd backend
   npm start
   ```

3. **Start frontend:**
   ```bash
   npm run dev
   ```

## 🧪 Testing the Features

### As Citizen:

1. **Login as Citizen** → Redirects to `/citizen/dashboard`

2. **Test Crime Risk Map:**
   - Click "Crime Risk Map" from dashboard
   - View heatmap with risk zones
   - Hover over zones to see risk scores

3. **Test Safe Route GPS:**
   - Click "Safe Route GPS" from dashboard
   - Enter start location (or use current location)
   - Enter destination
   - Click "Calculate Routes"
   - View shortest (gray) vs safer (green) routes

### As Officer:

1. **Login as Officer** → Redirects to `/officer/dashboard`

2. **Test Crime Prediction:**
   - Click "Crime Prediction" from dashboard
   - Select an area from dropdown
   - View chart showing actual vs predicted crimes
   - Click "Generate Predictions" to create new predictions

3. **Test Patrolling Heatmap:**
   - Click "Patrolling Heatmap" from dashboard
   - View map with patrolling intensity zones
   - Hover over zones to see priority and officer count

4. **Test Criminal Search:**
   - Click "Criminal Database" from dashboard
   - Select search type (Name/NID/Face ID)
   - Enter search query
   - View results with risk scores

## 📍 Sample Coordinates (Dhaka)

- **Gulshan**: 23.7944, 90.4144
- **Dhanmondi**: 23.7465, 90.3760
- **Uttara**: 23.8759, 90.3795
- **Banani**: 23.7944, 90.4044

## 🐛 Troubleshooting

### Map not showing:
- Check browser console for errors
- Ensure Leaflet CSS is imported
- Verify OpenStreetMap tiles are loading

### Charts not rendering:
- Check if Recharts is installed
- Verify data format matches chart expectations

### API errors:
- Ensure backend is running on port 5000
- Check CORS settings
- Verify authentication token is valid

## ✅ All Features Implemented

- ✅ Crime Risk Map with heatmap
- ✅ Safe Route GPS with route comparison
- ✅ Crime Pattern Prediction with charts
- ✅ Smart Patrolling Heatmap
- ✅ Criminal Database Search

All features are ready for academic project evaluation!
