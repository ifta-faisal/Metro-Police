// Safe Route GPS Routes
import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Calculate safe route between two points
router.post("/calculate", authenticateToken, (req, res) => {
  const { startLat, startLng, endLat, endLng } = req.body;
  
  if (!startLat || !startLng || !endLat || !endLng) {
    return res.status(400).json({ error: "Start and end coordinates are required" });
  }
  
  // Get crime data for route calculation
  const sql = `SELECT latitude, longitude, severity, crime_type, incident_date 
    FROM crime_data 
    WHERE incident_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    ORDER BY incident_date DESC`;
  
  db.query(sql, [], (err, crimeResults) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    // Get patrolling data
    const patrolSql = `SELECT latitude, longitude, patrol_intensity 
      FROM patrolling_data`;
    
    db.query(patrolSql, [], (err, patrolResults) => {
      if (err) {
        return res.status(500).json({ error: "Database error: " + err.message });
      }
      
      // Calculate safe route using simple algorithm
      const safeRoute = calculateSafeRoute(
        parseFloat(startLat),
        parseFloat(startLng),
        parseFloat(endLat),
        parseFloat(endLng),
        crimeResults,
        patrolResults
      );
      
      res.json({ 
        route: safeRoute,
        crimeData: crimeResults,
        patrollingData: patrolResults
      });
    });
  });
});

// Calculate safe route algorithm
function calculateSafeRoute(startLat, startLng, endLat, endLng, crimes, patrolling) {
  // Simple route calculation with safety scoring
  // In production, use proper routing API like Google Maps or OSRM
  
  // Calculate direct distance
  const directDistance = calculateDistance(startLat, startLng, endLat, endLng);
  
  // Create waypoints with safety scores
  const waypoints = generateWaypoints(startLat, startLng, endLat, endLng, crimes, patrolling);
  
  // Calculate total route distance
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateDistance(
      waypoints[i].lat,
      waypoints[i].lng,
      waypoints[i + 1].lat,
      waypoints[i + 1].lng
    );
  }
  
  // Calculate safety score (0-100, higher is safer)
  const safetyScore = calculateSafetyScore(waypoints, crimes, patrolling);
  
  return {
    waypoints: waypoints,
    totalDistance: totalDistance.toFixed(2),
    directDistance: directDistance.toFixed(2),
    safetyScore: safetyScore,
    estimatedTime: (totalDistance / 30 * 60).toFixed(0) + " minutes", // Assuming 30 km/h average
    routeType: safetyScore > 70 ? 'safe' : safetyScore > 40 ? 'moderate' : 'risky'
  };
}

// Generate waypoints with safety consideration
function generateWaypoints(startLat, startLng, endLat, endLng, crimes, patrolling) {
  const waypoints = [
    { lat: startLat, lng: startLng, safetyScore: 100 }
  ];
  
  // Add intermediate waypoints avoiding high-crime areas
  const steps = 5;
  for (let i = 1; i < steps; i++) {
    const ratio = i / steps;
    let lat = startLat + (endLat - startLat) * ratio;
    let lng = startLng + (endLng - startLng) * ratio;
    
    // Adjust waypoint to avoid high-crime areas
    const nearbyCrimes = getNearbyCrimes(lat, lng, crimes, 0.01); // 0.01 degree ~ 1km
    if (nearbyCrimes.length > 0) {
      // Slight adjustment to avoid crime hotspot
      const avgCrimeLat = nearbyCrimes.reduce((sum, c) => sum + parseFloat(c.latitude), 0) / nearbyCrimes.length;
      const avgCrimeLng = nearbyCrimes.reduce((sum, c) => sum + parseFloat(c.longitude), 0) / nearbyCrimes.length;
      
      // Move waypoint away from crime hotspot
      lat = lat + (lat - avgCrimeLat) * 0.3;
      lng = lng + (lng - avgCrimeLng) * 0.3;
    }
    
    const safetyScore = calculatePointSafety(lat, lng, crimes, patrolling);
    waypoints.push({ lat, lng, safetyScore });
  }
  
  waypoints.push({ lat: endLat, lng: endLng, safetyScore: 100 });
  
  return waypoints;
}

// Calculate safety score for a point
function calculatePointSafety(lat, lng, crimes, patrolling) {
  let score = 100;
  
  // Reduce score for nearby crimes
  const nearbyCrimes = getNearbyCrimes(lat, lng, crimes, 0.01);
  nearbyCrimes.forEach(crime => {
    const distance = calculateDistance(lat, lng, parseFloat(crime.latitude), parseFloat(crime.longitude));
    const severityPenalty = { 'low': 5, 'medium': 10, 'high': 20, 'critical': 30 }[crime.severity] || 10;
    score -= severityPenalty / (distance + 0.001);
  });
  
  // Increase score for nearby patrolling
  const nearbyPatrols = getNearbyPatrols(lat, lng, patrolling, 0.01);
  nearbyPatrols.forEach(patrol => {
    const distance = calculateDistance(lat, lng, parseFloat(patrol.latitude), parseFloat(patrol.longitude));
    score += (patrol.patrol_intensity * 2) / (distance + 0.001);
  });
  
  return Math.max(0, Math.min(100, score));
}

// Calculate overall route safety score
function calculateSafetyScore(waypoints, crimes, patrolling) {
  const scores = waypoints.map(wp => wp.safetyScore || calculatePointSafety(wp.lat, wp.lng, crimes, patrolling));
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

// Get nearby crimes
function getNearbyCrimes(lat, lng, crimes, radius) {
  return crimes.filter(crime => {
    const distance = calculateDistance(lat, lng, parseFloat(crime.latitude), parseFloat(crime.longitude));
    return distance <= radius;
  });
}

// Get nearby patrolling
function getNearbyPatrols(lat, lng, patrolling, radius) {
  return patrolling.filter(patrol => {
    const distance = calculateDistance(lat, lng, parseFloat(patrol.latitude), parseFloat(patrol.longitude));
    return distance <= radius;
  });
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default router;
