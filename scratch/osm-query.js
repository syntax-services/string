import fs from 'fs';

// Bounding box for Ago-Iwoye region: (minLat, minLon, maxLat, maxLon)
const query = `
[out:json][timeout:90];
(
  way["highway"]["name"](6.91, 3.90, 6.97, 3.97);
  node["highway"~"bus_stop|mini_roundabout"](6.91, 3.90, 6.97, 3.97);
  node["amenity"~"hospital|place_of_worship|school|market|university"](6.91, 3.90, 6.97, 3.97);
);
out geom;
`;

async function fetchOSM() {
  console.log("Querying OpenStreetMap Overpass API for Ago-Iwoye bounding box...");
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: 'data=' + encodeURIComponent(query),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'StringPlatformVerificationScript/1.0 (contact: support@string.com.ng)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.elements.length} elements from OpenStreetMap.`);

    fs.writeFileSync('scratch/osm_ago_iwoye_raw.json', JSON.stringify(data, null, 2), 'utf8');
    
    // Process streets and landmarks
    const streets = [];
    const landmarks = [];

    data.elements.forEach(el => {
      if (el.type === 'way' && el.tags && el.tags.name) {
        // This is a street
        // Calculate center coordinate from geometry
        let lat = 0;
        let lon = 0;
        if (el.geometry && el.geometry.length > 0) {
          el.geometry.forEach(pt => {
            lat += pt.lat;
            lon += pt.lon;
          });
          lat /= el.geometry.length;
          lon /= el.geometry.length;
        }
        streets.push({
          name: el.tags.name,
          highway: el.tags.highway,
          lat,
          lon
        });
      } else if (el.type === 'node' && el.tags && el.tags.name) {
        // This is a landmark/node
        landmarks.push({
          name: el.tags.name,
          type: el.tags.amenity || el.tags.highway || el.tags.shop || 'landmark',
          lat: el.lat,
          lon: el.lon
        });
      }
    });

    // Remove duplicates by name
    const uniqueStreets = Array.from(new Set(streets.map(s => s.name.trim()))).map(name => streets.find(s => s.name.trim() === name));
    const uniqueLandmarks = Array.from(new Set(landmarks.map(l => l.name.trim()))).map(name => landmarks.find(l => l.name.trim() === name));

    console.log(`Processed ${uniqueStreets.length} unique streets and ${uniqueLandmarks.length} unique landmarks.`);

    const processed = {
      streets: uniqueStreets,
      landmarks: uniqueLandmarks
    };

    fs.writeFileSync('scratch/osm_ago_iwoye_processed.json', JSON.stringify(processed, null, 2), 'utf8');
    console.log("Saved processed results to scratch/osm_ago_iwoye_processed.json");

  } catch (err) {
    console.error("OSM Fetch failed:", err);
  }
}

fetchOSM();
