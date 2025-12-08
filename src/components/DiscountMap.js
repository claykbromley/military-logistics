import { useState, useRef, useEffect } from "react";

export function DiscountMap() {
  const [status, setStatus] = useState(null);
  const [coords, setCoords] = useState(null);
  const [addressInput, setAddressInput] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [category, setCategory] = useState("all");

  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const markers = useRef([]);
  const placesService = useRef(null);

  // List of major chains known to offer military discounts
  const KNOWN_MILITARY_DISCOUNTS = {
    // Restaurants
    "applebee's": { discount: "10% off", category: "restaurant" },
    "chili's": { discount: "10% off", category: "restaurant" },
    "outback steakhouse": { discount: "10% off", category: "restaurant" },
    "outback": { discount: "10% off", category: "restaurant" },
    "buffalo wild wings": { discount: "10% off", category: "restaurant" },
    "denny's": { discount: "10-20% off varies by location", category: "restaurant" },
    "ihop": { discount: "10-20% off varies by location", category: "restaurant" },
    "golden corral": { discount: "10% off", category: "restaurant" },
    "texas roadhouse": { discount: "10% off", category: "restaurant" },
    "subway": { discount: "10% off", category: "restaurant" },
    "arby's": { discount: "10% off", category: "restaurant" },
    
    // Retail
    "home depot": { discount: "10% off year-round", category: "retail" },
    "lowe's": { discount: "10% off year-round", category: "retail" },
    "lowes": { discount: "10% off year-round", category: "retail" },
    "target": { discount: "10% off select days", category: "retail" },
    "old navy": { discount: "10% off", category: "retail" },
    "gap": { discount: "10% off", category: "retail" },
    "under armour": { discount: "20% off", category: "retail" },
    "nike": { discount: "10% off", category: "retail" },
    "dick's sporting goods": { discount: "10% off", category: "retail" },
    "dicks sporting goods": { discount: "10% off", category: "retail" },
    "best buy": { discount: "Varies", category: "retail" },
    "foot locker": { discount: "10% off", category: "retail" },
    "walmart": { discount: "Military discount available", category: "retail" },
    "kohls": { discount: "15% off Mondays", category: "retail" },
    "kohl's": { discount: "15% off Mondays", category: "retail" },
    
    // Automotive
    "jiffy lube": { discount: "15% off", category: "automotive" },
    "goodyear": { discount: "10% off", category: "automotive" },
    "valvoline": { discount: "Varies by location", category: "automotive" },
    "meineke": { discount: "10% off", category: "automotive" },
    "firestone": { discount: "10% off", category: "automotive" },
    
    // Hotels
    "hampton inn": { discount: "Up to 15% off", category: "hotel" },
    "hampton": { discount: "Up to 15% off", category: "hotel" },
    "marriott": { discount: "Government rate", category: "hotel" },
    "hilton": { discount: "Government rate", category: "hotel" },
    "holiday inn": { discount: "Government rate", category: "hotel" },
    "best western": { discount: "10-20% off", category: "hotel" },
    "la quinta": { discount: "Military rate", category: "hotel" },
    "motel 6": { discount: "10% off", category: "hotel" },
    
    // Entertainment
    "amc": { discount: "$1 off tickets", category: "entertainment" },
    "amc theatres": { discount: "$1 off tickets", category: "entertainment" },
    "regal": { discount: "Discount varies", category: "entertainment" },
    "regal cinemas": { discount: "Discount varies", category: "entertainment" },
    "24 hour fitness": { discount: "$0 initiation", category: "entertainment" },
    "la fitness": { discount: "Varies by location", category: "entertainment" },
    "anytime fitness": { discount: "Varies by location", category: "entertainment" },
  };

  // Category to search type mapping for Google Places API
  const CATEGORY_TYPES = {
    restaurant: ['restaurant', 'cafe', 'food'],
    retail: ['store', 'shopping_mall', 'clothing_store', 'department_store'],
    automotive: ['car_repair', 'car_dealer', 'gas_station'],
    hotel: ['lodging', 'hotel', 'motel'],
    entertainment: ['movie_theater', 'gym', 'amusement_park', 'tourist_attraction'],
    all: ['restaurant', 'cafe', 'store', 'shopping_mall', 'lodging', 'movie_theater', 'gym', 'car_repair']
  };

  function distance(a, b) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 3958.8;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const h = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const existingScript = document.querySelector("#google-maps-script");
      if (existingScript) {
        existingScript.addEventListener("load", resolve);
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAdrCyFkQA2fmt-Lup40KN4qhI2yKpRLbI&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.google && window.google.maps) {
          resolve();
        } else {
          reject("Google Maps API failed to load.");
        }
      };

      script.onerror = () => reject("Google Maps script could not be loaded.");
      document.body.appendChild(script);
    });
  };

  const initMap = async () => {
    try {
      await loadGoogleMaps();
      if (!mapRef.current) {
        console.error("mapRef is not ready yet.");
        return;
      }

      googleMap.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 32.7765, lng: -79.9311 },
        zoom: 12,
      });

      placesService.current = new window.google.maps.places.PlacesService(googleMap.current);

      // Add listener for when user stops moving/zooming the map
      googleMap.current.addListener('idle', () => {
        const center = googleMap.current.getCenter();
        const newCoords = { lat: center.lat(), lon: center.lng() };
        
        // Search for the new visible area
        searchBusinesses(newCoords);
      });

      getCurrentLocation();
    } catch (err) {
      console.error("Map initialization error:", err);
    }
  };

  const updateMarkers = () => {
    if (!googleMap.current) return;
    markers.current.forEach((m) => m.setMap(null));
    markers.current = [];

    businesses.forEach((b, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: Number(b.lat), lng: Number(b.lng) },
        map: googleMap.current,
        title: b.name,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        }
      });

      marker.addListener("mouseover", () => {
        highlightMarker(index);
        setHighlightedIndex(index); 
      });
      marker.addListener("mouseout", () => {
        setHighlightedIndex(null);
      });
      marker.addListener("click", () => {
        const position = marker.getPosition();
        googleMap.current.setCenter(position);
        googleMap.current.setZoom(15);
      });
      markers.current.push(marker);
    });
  };

  const highlightMarker = (index) => {
    markers.current.forEach((m, i) => {
      if (i === index) {
        m.setIcon("http://maps.google.com/mapfiles/ms/icons/blue-dot.png");
      } else {
        m.setIcon("http://maps.google.com/mapfiles/ms/icons/green-dot.png");
      }
    });
  };

  useEffect(() => {
    initMap();
  }, []);

  useEffect(() => {
    if (coords && googleMap.current && placesService.current) {
      googleMap.current.setCenter({ lat: Number(coords.lat), lng: Number(coords.lon) });
    }
  }, [coords]);

  useEffect(() => {
    updateMarkers();
  }, [businesses]);

  useEffect(() => {
    // Re-search when category changes, but only if we already have a location
    if (coords && businesses.length > 0) {
      searchBusinesses(coords);
    }
  }, [category]);

  const getCurrentLocation = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      const c = { lat: 32.7765, lon: -79.9311 };
      setCoords(c);
      searchBusinesses(c);
      return;
    }
    setLoading(true);
    setStatus("Requesting location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCoords(c);
        setStatus("Got current location");
        searchBusinesses(c);
        setLoading(false);
      },
      (err) => {
        setError("Unable to retrieve location: " + err.message);
        setLoading(false);
        const c = { lat: 32.7765, lon: -79.9311 };
        setCoords(c);
        searchBusinesses(c);
      }
    );
  };

  const geocodeAddress = async () => {
    setError(null);
    if (!addressInput) return;
    setLoading(true);
    setStatus("Geocoding address...");

    try {
      const q = encodeURIComponent(addressInput);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${q}&key=AIzaSyAdrCyFkQA2fmt-Lup40KN4qhI2yKpRLbI`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        setError("Address not found");
        setLoading(false);
        return;
      }

      const loc = data.results[0].geometry.location;
      const c = { lat: loc.lat, lon: loc.lng };
      setCoords(c);
      searchBusinesses(c);
    } catch (err) {
      console.error(err);
      setError("Geocoding error");
    }
    setLoading(false);
  };

  const searchBusinesses = async (center) => {
    if (!placesService.current) return;
    
    setStatus("Searching for military discounts...");
    setLoading(true);
    
    const allResults = [];
    const searchTypes = CATEGORY_TYPES[category] || CATEGORY_TYPES.all;

    // Search for each type of business
    for (const type of searchTypes) {
      try {
        const request = {
          location: new window.google.maps.LatLng(center.lat, center.lon),
          radius: 8000, // ~5 miles
          type: type,
        };

        await new Promise((resolve) => {
          placesService.current.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              results.forEach(place => {
                // Check if this business is known to offer military discounts
                const nameLower = place.name.toLowerCase();
                let discountInfo = null;
                
                // Check for exact match or partial match in known discounts
                for (const [businessName, info] of Object.entries(KNOWN_MILITARY_DISCOUNTS)) {
                  if (nameLower.includes(businessName) || businessName.includes(nameLower.split(' ')[0])) {
                    discountInfo = info;
                    break;
                  }
                }
                
                // Only include businesses with known military discounts
                if (discountInfo) {
                  const lat = place.geometry.location.lat();
                  const lng = place.geometry.location.lng();
                  const dist = distance(center, { lat, lon: lng });
                  
                  allResults.push({
                    id: place.place_id,
                    name: place.name,
                    lat: lat,
                    lng: lng,
                    address: place.vicinity,
                    distance: dist,
                    category: discountInfo.category,
                    discount: discountInfo.discount,
                    rating: place.rating,
                  });
                }
              });
            }
            resolve();
          });
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`Error searching for ${type}:`, err);
      }
    }

    // Remove duplicates based on place_id
    const uniqueResults = Array.from(
      new Map(allResults.map(item => [item.id, item])).values()
    );

    // Sort by distance
    uniqueResults.sort((a, b) => a.distance - b.distance);

    // Limit to top 100 results
    const topResults = uniqueResults.slice(0, 100);

    setBusinesses(topResults);
    setStatus(`Found ${topResults.length} businesses with military discounts nearby`);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', width: '90%', margin: '0 auto', border: '2px solid #ccc', borderRadius: '8px', overflow: 'hidden', height: '600px' }}>
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #ccc' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #ccc', backgroundColor: '#f8f9fa' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '15px', marginTop: 0 }}>Find Military Discounts</h2>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '5px', width: '100%', maxWidth: '400px' }}>
              <input 
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onKeyDown={(e) => {if (e.key === "Enter") geocodeAddress()}}
                placeholder="Enter Address or ZIP Code"
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <button 
                onClick={geocodeAddress}
                style={{ padding: '8px 16px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Search
              </button>
            </div>
            <div style={{ color: '#666' }}>OR</div>
            <button 
              onClick={getCurrentLocation}
              style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Use My Location
            </button>
          </div>

          <hr style={{ margin: '15px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>Filter by Category:</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', minWidth: '200px' }}
            >
              <option value="all">All Categories</option>
              <option value="restaurant">Restaurants</option>
              <option value="retail">Retail</option>
              <option value="automotive">Automotive</option>
              <option value="hotel">Hotels</option>
              <option value="entertainment">Entertainment</option>
            </select>
            <p style={{ fontSize: '0.85rem', color: '#666', margin: 0, textAlign: 'center' }}>
              💡 Move or zoom the map to search a new area
            </p>
          </div>
          
          {status && <p style={{ textAlign: 'center', color: '#0066cc', marginTop: '10px', marginBottom: 0 }}>{status}</p>}
          {error && <p style={{ textAlign: 'center', color: '#dc3545', marginTop: '10px', marginBottom: 0 }}>{error}</p>}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '15px', backgroundColor: '#fff' }}>
          {loading && <p style={{ textAlign: 'center' }}>Searching for nearby military discounts...</p>}

          {!loading && businesses.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>No known military discounts found in this area. Try a different location or category.</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {businesses.map((b, i) => (
              <div 
                key={b.id}
                style={{ 
                  backgroundColor: 'white', 
                  padding: '15px', 
                  border: highlightedIndex === i ? '2px solid #0066cc' : '1px solid #ddd', 
                  borderRadius: '4px', 
                  marginBottom: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={() => highlightMarker(i)}
                onMouseLeave={() => {
                  markers.current.forEach((m) => {
                    m.setIcon("http://maps.google.com/mapfiles/ms/icons/green-dot.png");
                  });
                }}
                onClick={() => {
                  if (googleMap.current) {
                    googleMap.current.setCenter({ lat: Number(b.lat), lng: Number(b.lng) });
                    googleMap.current.setZoom(15);
                  }
                }}
              >
                <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>{b.name}</h3>
                <p style={{ color: '#666', margin: '5px 0', fontSize: '0.95rem' }}>
                  <strong>Discount:</strong> {b.discount}
                </p>
                <p style={{ color: '#666', margin: '5px 0' }}>{b.address}</p>
                <p style={{ color: '#888', fontSize: '0.9rem', margin: '5px 0' }}>
                  {b.distance.toFixed(1)} miles away
                  {b.rating && ` • ⭐ ${b.rating}`}
                </p>
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const maps = `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`;
                      window.open(maps, "_blank");
                    }}
                    style={{ padding: '6px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: '50%' }}>
        <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
      </div>
    </div>
  );
}