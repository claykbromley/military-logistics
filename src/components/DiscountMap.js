import { useState, useRef, useEffect } from "react";
import Papa from "papaparse";

export function DiscountMap() {
  const [status, setStatus] = useState(null);
  const [coords, setCoords] = useState(null);
  const [addressInput, setAddressInput] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [onlineLocations, setOnlineLocations] = useState([]);
  const [online, setOnline] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const markers = useRef([]);

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
        center: coords || { lat: 38.8895, lng: -77.0353 },
        zoom: 13,
      });

      // Call getCurrentLocation after map is initialized
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
        position: { lat: Number(b.lat), lng: Number(b.long) },
        map: googleMap.current,
        title: b.name,
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
        searchBusinesses({ lat: position.lat(), lon: position.lng() });
      });
      markers.current.push(marker);
    });
  };

  const highlightMarker = (index) => {
    markers.current.forEach((m, i) => {
      m.setIcon(null);
      m.setAnimation(null);
      if (i === index) {
        m.setIcon("http://maps.google.com/mapfiles/ms/icons/blue-dot.png");
        setTimeout(() => m.setAnimation(null), 1200);
      }
    });
  };

  useEffect(() => {
    // Initialize map immediately
    initMap();
    
    // Then load CSV data
    Papa.parse("/data/military_discounts.csv", {
      download: true,
      header: true,
      complete: (results) => {setLocations(results.data)},
      error: (err) => {
        console.error("CSV parsing error:", err);
        // Set empty array if CSV doesn't exist
        setLocations([]);
      },
    });
    Papa.parse("/data/military_discounts_online.csv", {
      download: true,
      header: true,
      complete: (results) => {setOnlineLocations(results.data)},
      error: (err) => {
        console.error("CSV parsing error:", err);
        // Set empty array if CSV doesn't exist
        setOnlineLocations([]);
      },
    });
  }, []);

  useEffect(() => {
    if (coords) {
      if (googleMap.current) {
        googleMap.current.setCenter({ lat: Number(coords.lat), lng: Number(coords.lon) });
      }
    }
  }, [coords]);

  useEffect(() => {
    updateMarkers();
  }, [businesses]);

  const getCurrentLocation = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
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

  const searchBusinesses = (center) => {
    setStatus("Searching for military discounts...");

    const enriched = locations.map((b) => ({
      ...b,
      distance: distance(center, { lat: Number(b.lat), lon: Number(b.long) }),
    }));

    enriched.sort((x, y) => x.distance - y.distance); 
    const nearest = enriched.slice(0, 100);

    setBusinesses(nearest);
    setStatus(`Showing ${nearest.length} businesses with military discounts`);
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

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setOnline(!online)}
              style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {online ? "Show In-Person Locations" : "Show Online Discounts"}
            </button>
            <a 
              href="https://installations.militaryonesource.mil/search?program-service=26/view-by=ALL" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <button style={{ padding: '8px 16px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Find Local Military Support Center
              </button>
            </a>
          </div>
          
          {status && <p style={{ textAlign: 'center', color: '#0066cc', marginTop: '10px', marginBottom: 0 }}>{status}</p>}
          {error && <p style={{ textAlign: 'center', color: '#dc3545', marginTop: '10px', marginBottom: 0 }}>{error}</p>}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '15px', backgroundColor: '#fff' }}>
          {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}

          {!loading && businesses.length === 0 && !online && <p style={{ textAlign: 'center', color: '#666' }}>No discounts found yet. Try searching for a location.</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {online ? (
              <div>
                {onlineLocations.map((b) => (
                  <div key={b.id} style={{ backgroundColor: 'white', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' }}>
                    <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>{b.name}</h3>
                    {b.discount && <p style={{ color: '#666', margin: '5px 0', fontSize: '0.95rem' }}>
                      <strong>Discount:</strong> {b.discount}
                    </p>}
                    <div>
                      {b.website && (
                        <a href={b.website} target="_blank" rel="noopener noreferrer">
                          <button style={{ padding: '6px 12px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Visit Website
                          </button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
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
                        m.setIcon(null);
                        m.setAnimation(null);
                      });
                    }}
                    onClick={() => {
                      if (googleMap.current) {
                        googleMap.current.setCenter({ lat: Number(b.lat), lng: Number(b.long) });
                      }
                    }}
                  >
                    <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>{b.name}</h3>
                    {b.discount && <p style={{ color: '#666', margin: '5px 0', fontSize: '0.95rem' }}>
                      <strong>Discount:</strong> {b.discount}
                    </p>}
                    <p style={{ color: '#666', margin: '5px 0' }}>{b.address}</p>
                    <p style={{ color: '#888', fontSize: '0.9rem', margin: '5px 0' }}>{b.distance.toFixed(1)} miles away</p>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                      {b.website && (
                        <a href={b.website} target="_blank" rel="noopener noreferrer">
                          <button style={{ padding: '6px 12px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                            Visit Website
                          </button>
                        </a>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const maps = `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.long}`;
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
            )}
          </div>
        </div>
      </div>

      <div style={{ width: '50%' }}>
        <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
      </div>
    </div>
  );
}