// Crime Pattern Prediction Routes
import express from "express";
import db from "../db.js";
import { authenticateToken, requireOfficer } from "../middleware/auth.js";

const router = express.Router();

// GET /api/crime-prediction - Crime Prediction Analytics (Simple Analytics)
// Group by area and month, calculate crime frequency trend, classify area risk
router.get("/", authenticateToken, requireOfficer, (req, res) => {
  // Get historical crime data grouped by area and month
  // Use area_name if it exists, otherwise use description or 'Unknown'
  const sql = `SELECT 
    COALESCE(
      area_name,
      CASE 
        WHEN description IS NOT NULL AND description != '' THEN SUBSTRING_INDEX(description, ',', 1)
        ELSE 'Unknown'
      END,
      'Unknown'
    ) as area,
    DATE_FORMAT(incident_date, '%Y-%m') as month,
    COUNT(*) as crime_count,
    SUM(CASE WHEN severity IN ('high', 'critical') THEN 1 ELSE 0 END) as high_severity_count,
    AVG(CASE 
      WHEN severity = 'critical' THEN 4
      WHEN severity = 'high' THEN 3
      WHEN severity = 'medium' THEN 2
      ELSE 1
    END) as avg_severity_score
  FROM crime_data
  WHERE incident_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    AND incident_date IS NOT NULL
  GROUP BY area, month
  ORDER BY month DESC, crime_count DESC`;

  db.query(sql, [], (err, results) => {
    if (err) {
      console.error("Crime prediction query error:", err);
      return res.status(500).json({ error: "Database error: " + err.message });
    }

    // If no data, return empty predictions
    if (!results || results.length === 0) {
      return res.json({
        predictions: [],
        summary: {
          totalAreas: 0,
          highRiskAreas: 0,
          mediumRiskAreas: 0,
          lowRiskAreas: 0
        }
      });
    }

    // Process data to calculate trends and risk levels
    const areaData = {};
    
    // Group by area
    results.forEach(row => {
      if (!areaData[row.area]) {
        areaData[row.area] = {
          area: row.area,
          months: [],
          totalCrimes: 0,
          avgSeverity: 0
        };
      }
      areaData[row.area].months.push({
        month: row.month,
        crimeCount: row.crime_count,
        highSeverityCount: row.high_severity_count
      });
      areaData[row.area].totalCrimes += row.crime_count;
      areaData[row.area].avgSeverity = 
        (areaData[row.area].avgSeverity * (areaData[row.area].months.length - 1) + parseFloat(row.avg_severity_score)) / 
        areaData[row.area].months.length;
    });

    // Calculate trends and classify risk
    const predictions = Object.values(areaData).map(area => {
      // Calculate trend (comparing last 3 months to previous 3 months)
      const sortedMonths = area.months.sort((a, b) => a.month.localeCompare(b.month));
      const recentMonths = sortedMonths.slice(-3);
      const previousMonths = sortedMonths.slice(-6, -3);
      
      const recentCrimes = recentMonths.reduce((sum, m) => sum + m.crimeCount, 0);
      const previousCrimes = previousMonths.reduce((sum, m) => sum + m.crimeCount, 0);
      
      const trend = previousCrimes > 0 
        ? ((recentCrimes - previousCrimes) / previousCrimes * 100).toFixed(2)
        : recentCrimes > 0 ? 100 : 0;
      
      // Calculate crime frequency (crimes per month on average)
      const monthsWithData = sortedMonths.length;
      const frequency = monthsWithData > 0 ? (area.totalCrimes / monthsWithData).toFixed(2) : 0;
      
      // Classify risk level based on frequency, severity, and trend
      let riskLevel = 'Low';
      let riskScore = parseFloat(frequency) + (area.avgSeverity * 2) + (parseFloat(trend) > 20 ? 5 : 0);
      
      if (riskScore >= 15) riskLevel = 'High';
      else if (riskScore >= 8) riskLevel = 'Medium';
      
      return {
        area: area.area,
        totalCrimes: area.totalCrimes,
        crimeFrequency: parseFloat(frequency),
        avgSeverity: parseFloat(area.avgSeverity.toFixed(2)),
        trend: parseFloat(trend),
        trendDirection: parseFloat(trend) > 0 ? 'Increasing' : parseFloat(trend) < 0 ? 'Decreasing' : 'Stable',
        riskLevel: riskLevel,
        riskScore: parseFloat(riskScore.toFixed(2)),
        monthlyBreakdown: sortedMonths.slice(-6) // Last 6 months
      };
    });

    // Sort by risk score descending
    predictions.sort((a, b) => b.riskScore - a.riskScore);

    res.json({
      predictions: predictions,
      summary: {
        totalAreas: predictions.length,
        highRiskAreas: predictions.filter(p => p.riskLevel === 'High').length,
        mediumRiskAreas: predictions.filter(p => p.riskLevel === 'Medium').length,
        lowRiskAreas: predictions.filter(p => p.riskLevel === 'Low').length
      }
    });
  });
});

// Get crime predictions
router.get("/predictions", authenticateToken, (req, res) => {
  const { area } = req.query;
  
  let sql = `SELECT * FROM crime_predictions 
    WHERE prediction_date >= CURDATE()`;
  
  const params = [];
  if (area) {
    sql += " AND area_name = ?";
    params.push(area);
  }
  
  sql += " ORDER BY risk_level DESC, confidence_score DESC";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.json({ predictions: results });
  });
});

// Get prediction for specific area
router.get("/area/:area", authenticateToken, (req, res) => {
  const { area } = req.params;
  
  // Get historical crime data for the area
  const sql = `SELECT DATE(incident_date) as date, COUNT(*) as crime_count
    FROM crime_data
    WHERE incident_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(incident_date)
    ORDER BY date ASC`;
  
  db.query(sql, [], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    // Get predictions for the area
    const predSql = `SELECT * FROM crime_predictions 
      WHERE area_name = ? AND prediction_date >= CURDATE()
      ORDER BY prediction_date ASC`;
    
    db.query(predSql, [area], (err, predictions) => {
      if (err) {
        return res.status(500).json({ error: "Database error: " + err.message });
      }
      
      res.json({
        historical: results,
        predictions: predictions
      });
    });
  });
});

// Generate crime predictions (ML logic using historical data)
router.post("/generate", authenticateToken, (req, res) => {
  // Get historical crime data (last 90 days)
  const sql = `SELECT area_name, latitude, longitude, crime_type, severity, COUNT(*) as crime_count
    FROM crime_data
    WHERE incident_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    GROUP BY area_name, crime_type, severity
    ORDER BY crime_count DESC`;
  
  db.query(sql, [], (err, crimeData) => {
    if (err) {
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    // Get patrolling data
    const patrolSql = "SELECT area_name, latitude, longitude, patrol_intensity FROM patrolling_data";
    
    db.query(patrolSql, [], (err, patrollingData) => {
      if (err) {
        return res.status(500).json({ error: "Database error: " + err.message });
      }
      
      // Simple ML prediction algorithm
      const predictions = generatePredictions(crimeData, patrollingData);
      
      // Clear old predictions
      db.query("DELETE FROM crime_predictions WHERE prediction_date < CURDATE()", [], (err) => {
        if (err) {
          console.error("Error clearing old predictions:", err);
        }
        
        // Insert new predictions
        if (predictions.length > 0) {
          const insertSql = `INSERT INTO crime_predictions 
            (area_name, latitude, longitude, predicted_crime_type, risk_level, confidence_score, prediction_date) 
            VALUES ?`;
          
          const values = predictions.map(p => [
            p.area_name,
            p.latitude,
            p.longitude,
            p.predicted_crime_type,
            p.risk_level,
            p.confidence_score,
            new Date()
          ]);
          
          db.query(insertSql, [values], (err, result) => {
            if (err) {
              return res.status(500).json({ error: "Database error: " + err.message });
            }
            
            res.json({ 
              message: "Predictions generated successfully",
              count: predictions.length,
              predictions: predictions
            });
          });
        } else {
          res.json({ 
            message: "No predictions generated",
            count: 0
          });
        }
      });
    });
  });
});

// Generate predictions using simple trend analysis
function generatePredictions(crimeData, patrollingData) {
  const predictions = [];
  const areaMap = new Map();
  
  // Group crimes by area
  crimeData.forEach(crime => {
    const area = crime.area_name || 'Unknown';
    if (!areaMap.has(area)) {
      areaMap.set(area, {
        crimes: [],
        totalCrimes: 0,
        highSeverityCount: 0
      });
    }
    
    const areaData = areaMap.get(area);
    areaData.crimes.push(crime);
    areaData.totalCrimes += crime.crime_count;
    
    if (crime.severity === 'high' || crime.severity === 'critical') {
      areaData.highSeverityCount += crime.crime_count;
    }
  });
  
  // Get patrolling intensity by area
  const patrolMap = new Map();
  patrollingData.forEach(patrol => {
    patrolMap.set(patrol.area_name, patrol);
  });
  
  // Generate predictions for each area
  areaMap.forEach((areaData, areaName) => {
    const patrol = patrolMap.get(areaName);
    const patrolIntensity = patrol ? patrol.patrol_intensity : 0;
    
    // Calculate risk level based on crime frequency and severity
    const crimeRate = areaData.totalCrimes;
    const severityRate = areaData.highSeverityCount / areaData.totalCrimes;
    
    // Risk calculation: higher crime rate + higher severity = higher risk
    // Patrolling reduces risk
    let riskScore = (crimeRate * 10) + (severityRate * 50) - (patrolIntensity * 5);
    riskScore = Math.max(0, Math.min(100, riskScore));
    
    // Determine risk level
    let riskLevel = 'low';
    if (riskScore >= 70) riskLevel = 'critical';
    else if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';
    
    // Confidence based on data volume
    const confidenceScore = Math.min(100, (crimeRate / 10) * 100);
    
    // Get most common crime type
    const crimeTypeCounts = {};
    areaData.crimes.forEach(crime => {
      crimeTypeCounts[crime.crime_type] = (crimeTypeCounts[crime.crime_type] || 0) + crime.crime_count;
    });
    
    const predictedCrimeType = Object.keys(crimeTypeCounts).reduce((a, b) => 
      crimeTypeCounts[a] > crimeTypeCounts[b] ? a : b
    ) || 'theft';
    
    // Get coordinates from patrol data or use default
    const latitude = patrol ? parseFloat(patrol.latitude) : 23.8103; // Default Dhaka
    const longitude = patrol ? parseFloat(patrol.longitude) : 90.4125;
    
    predictions.push({
      area_name: areaName,
      latitude: latitude,
      longitude: longitude,
      predicted_crime_type: predictedCrimeType,
      risk_level: riskLevel,
      confidence_score: Math.round(confidenceScore * 10) / 10
    });
  });
  
  return predictions;
}

export default router;
