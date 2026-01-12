"use client"

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
  const [cachedZipCodes, setCachedZipCodes] = useState(new Set());

  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const markers = useRef([]);
  const placesService = useRef(null);
  const geocoder = useRef(null);

  // Verified national chains with precise matching
  const KNOWN_CHAINS = {
    /*"applebee's": { discount: "10% off", category: "restaurant" },
    "chili's": { discount: "10% off", category: "restaurant" },
    "outback steakhouse": { discount: "10% off", category: "restaurant" },
    "buffalo wild wings": { discount: "10% off", category: "restaurant" },
    "denny's": { discount: "10-20% off", category: "restaurant" },
    "ihop": { discount: "10-20% off", category: "restaurant" },
    "golden corral": { discount: "10% off", category: "restaurant" },
    "texas roadhouse": { discount: "10% off", category: "restaurant" },
    "subway": { discount: "10% off", category: "restaurant" },
    "arby's": { discount: "10% off", category: "restaurant" },
    "the home depot": { discount: "10% off year-round", category: "retail" },
    "home depot": { discount: "10% off year-round", category: "retail" },
    "lowe's": { discount: "10% off year-round", category: "retail" },
    "target": { discount: "10% off select days", category: "retail" },
    "old navy": { discount: "10% off", category: "retail" },
    "gap": { discount: "10% off", category: "retail" },
    "under armour": { discount: "20% off", category: "retail" },
    "nike": { discount: "10% off", category: "retail" },
    "dick's sporting goods": { discount: "10% off", category: "retail" },
    "best buy": { discount: "Varies", category: "retail" },
    "foot locker": { discount: "10% off", category: "retail" },
    //"walmart": { discount: "Military discount available", category: "retail" },
    "kohl's": { discount: "15% off Mondays", category: "retail" },
    "jiffy lube": { discount: "15% off", category: "automotive" },
    "goodyear": { discount: "10% off", category: "automotive" },
    "valvoline": { discount: "Varies", category: "automotive" },
    "meineke": { discount: "10% off", category: "automotive" },
    "firestone": { discount: "10% off", category: "automotive" },
    "hampton inn": { discount: "Up to 15% off", category: "hotel" },
    "marriott": { discount: "Government rate", category: "hotel" },
    "hilton": { discount: "Government rate", category: "hotel" },
    "holiday inn": { discount: "Government rate", category: "hotel" },
    "best western": { discount: "10-20% off", category: "hotel" },
    "la quinta inn": { discount: "Military rate", category: "hotel" },
    "motel 6": { discount: "10% off", category: "hotel" },
    "amc": { discount: "$1 off tickets", category: "entertainment" },
    "regal cinemas": { discount: "Discount varies", category: "entertainment" },
    "24 hour fitness": { discount: "$0 initiation", category: "entertainment" },
    "la fitness": { discount: "Varies", category: "entertainment" },
    "anytime fitness": { discount: "Varies", category: "entertainment" }*/
    // RESTAURANTS - Only verified with current corporate policies
    "applebee's": { discount: "Free Veterans Day meal", category: "restaurant", verification: "verified", note: "Veterans Day only" },
    "chili's": { discount: "Free Veterans Day meal", category: "restaurant", verification: "verified", note: "Veterans Day only" },
    "outback steakhouse": { discount: "10% off year-round", category: "restaurant", verification: "verified", note: "Plus Veterans Day free meal" },
    "buffalo wild wings": { discount: "10% off at participating locations", category: "restaurant", verification: "verified", note: "Location-dependent" },
    "denny's": { discount: "Free Grand Slam on Veterans Day", category: "restaurant", verification: "verified", note: "Veterans Day only" },
    "ihop": { discount: "Free pancake combo on Veterans Day", category: "restaurant", verification: "verified", note: "Veterans Day only" },
    "golden corral": { discount: "Free Veterans Day buffet", category: "restaurant", verification: "verified", note: "Plus year-round 10-20% at participating locations" },
    "texas roadhouse": { discount: "Free Veterans Day meal voucher", category: "restaurant", verification: "verified", note: "Veterans Day only" },

    // RETAIL - Only verified with current corporate policies  
    "the home depot": { discount: "10% off year-round", category: "retail", verification: "verified", note: "Excludes appliances" },
    "home depot": { discount: "10% off year-round", category: "retail", verification: "verified", note: "Excludes appliances" },
    "lowe's": { discount: "10% off year-round", category: "retail", verification: "verified" },
    "target": { discount: "10% off during military events", category: "retail", verification: "verified", note: "Limited time events only" },
    "gap": { discount: "10% off factory stores only", category: "retail", verification: "verified", note: "Factory stores only" },
    "under armour": { discount: "20% off year-round", category: "retail", verification: "verified", note: "ID.me verification required" },
    "nike": { discount: "10% off year-round", category: "retail", verification: "verified", note: "Online verification required" },
    "foot locker": { discount: "10% off most purchases", category: "retail", verification: "verified", note: "Restrictions apply" },

    // AUTOMOTIVE - Only verified with current corporate policies
    "jiffy lube": { discount: "15% off year-round", category: "automotive", verification: "verified", note: "Participating Team Car Care locations only" },
    "valvoline": { discount: "15% off year-round", category: "automotive", verification: "verified", note: "Excludes battery replacement/state inspection" },
    "meineke": { discount: "Free Veterans Day oil change", category: "automotive", verification: "verified", note: "Veterans Day only" },
    "firestone": { discount: "10% off year-round", category: "automotive", verification: "verified", note: "Tax-free advantages available" },

    // HOTELS - Only verified with current corporate policies
    "hampton inn": { discount: "10% off government rate", category: "hotel", verification: "verified", note: "Military ID required" },
    "marriott": { discount: "15% off flexible rates", category: "hotel", verification: "verified", note: "Participating resorts, code XYD" },
    "hilton": { discount: "Military family rate", category: "hotel", verification: "verified", note: "Varies by hotel, military ID required" },
    "holiday inn": { discount: "5%+ off best flexible rate", category: "hotel", verification: "verified", note: "Minimum 5% discount" },
    "best western": { discount: "10% off + per diem rates", category: "hotel", verification: "verified", note: "Military/government personnel" },
    "la quinta inn": { discount: "12% off standard rate", category: "hotel", verification: "verified", note: "Military ID required" },
    "motel 6": { discount: "10% off year-round", category: "hotel", verification: "verified", note: "All 1,400+ locations" },

    // ENTERTAINMENT/FITNESS - Only verified with current corporate policies
    "24 hour fitness": { discount: "$0 initiation + $5 off monthly", category: "entertainment", verification: "verified", note: "Select memberships, military ID required" }
  };

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

  const matchKnownChain = (businessName) => {
    const nameLower = businessName.toLowerCase().trim();

    if (KNOWN_CHAINS[nameLower]) {
      return KNOWN_CHAINS[nameLower];
    }

    for (const [chainName, info] of Object.entries(KNOWN_CHAINS)) {
      if (nameLower === chainName ||
        nameLower.startsWith(chainName + " ") ||
        nameLower.endsWith(" " + chainName) ||
        nameLower.includes(" " + chainName + " ")) {
        return info;
      }
    }

    return null;
  };

  const getZipCodeFromCoords = async (lat, lng) => {
    try {
      if (!geocoder.current) {
        geocoder.current = new window.google.maps.Geocoder();
      }

      return new Promise((resolve) => {
        geocoder.current.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              for (const result of results) {
                const zipComponent = result.address_components.find(
                  comp => comp.types.includes('postal_code')
                );
                if (zipComponent) {
                  resolve(zipComponent.short_name);
                  return;
                }
              }
            }
            resolve(null);
          }
        );
      });
    } catch (err) {
      console.error('Error getting zip code:', err);
      return null;
    }
  };

  const loadCachedBusinesses = (zipCode) => {
    try {
      const data = localStorage.getItem(`military_discount_zip_${zipCode}`);
      if (data) {
        return JSON.parse(data);
      }
    } catch (err) {
      console.log(`No cached data for zip ${zipCode}`);
    }
    return null;
  };

  const saveCachedBusinesses = (zipCode, businesses) => {
    try {
      localStorage.setItem(`military_discount_zip_${zipCode}`, JSON.stringify(businesses));

      const cachedList = getCachedZipCodeList();
      if (!cachedList.includes(zipCode)) {
        cachedList.push(zipCode);
        localStorage.setItem('military_discount_cached_zips', JSON.stringify(cachedList));
      }

      setCachedZipCodes(new Set(cachedList));
    } catch (err) {
      console.error('Error saving cached data:', err);
    }
  };

  const getCachedZipCodeList = () => {
    try {
      const data = localStorage.getItem('military_discount_cached_zips');
      return data ? JSON.parse(data) : [];
    } catch (err) {
      return [];
    }
  };

  const loadCachedZipCodeList = () => {
    const zips = getCachedZipCodeList();
    setCachedZipCodes(new Set(zips));
  };

  const clearCache = () => {
    try {
      const cachedList = getCachedZipCodeList();

      // Remove all cached zip code data
      cachedList.forEach(zipCode => {
        localStorage.removeItem(`military_discount_zip_${zipCode}`);
      });

      // Remove the cached zip codes list
      localStorage.removeItem('military_discount_cached_zips');

      // Update state
      setCachedZipCodes(new Set());
      setStatus('Cache cleared successfully');

      // Clear the success message after 3 seconds
      setTimeout(() => {
        if (coords) {
          searchBusinesses(coords);
        }
      }, 1000);
    } catch (err) {
      console.error('Error clearing cache:', err);
      setError('Failed to clear cache');
    }
  };

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
      loadCachedZipCodeList();

      if (!mapRef.current) {
        console.error("mapRef is not ready yet.");
        return;
      }

      googleMap.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 32.7765, lng: -79.9311 },
        zoom: 12,
      });

      placesService.current = new window.google.maps.places.PlacesService(googleMap.current);
      geocoder.current = new window.google.maps.Geocoder();

      googleMap.current.addListener('idle', () => {
        const center = googleMap.current.getCenter();
        const newCoords = { lat: center.lat(), lon: center.lng() };
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
    if (!placesService.current || !geocoder.current) return;

    setLoading(true);
    setStatus("Checking for cached data...");

    const zipCode = await getZipCodeFromCoords(center.lat, center.lon);

    if (!zipCode) {
      setError("Could not determine zip code for this location");
      setLoading(false);
      return;
    }

    const cachedData = loadCachedBusinesses(zipCode);

    if (cachedData) {
      setStatus(`Loading cached data for ${zipCode}...`);

      const filteredBusinesses = cachedData
        .filter(b => category === 'all' || b.category === category)
        .map(b => ({
          ...b,
          distance: distance(center, { lat: b.lat, lon: b.lng })
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 100);

      setBusinesses(filteredBusinesses);
      setStatus(`Loaded ${filteredBusinesses.length} businesses from cache (ZIP: ${zipCode})`);
      setLoading(false);
      return;
    }

    setStatus(`Searching ${zipCode} for military discounts (first time)...`);

    const allResults = [];
    const searchTypes = CATEGORY_TYPES.all;

    for (const type of searchTypes) {
      try {
        const request = {
          location: new window.google.maps.LatLng(center.lat, center.lon),
          radius: 8000,
          type: type,
        };

        await new Promise((resolve) => {
          placesService.current.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              results.forEach(place => {
                const chainInfo = matchKnownChain(place.name);

                if (chainInfo) {
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
                    category: chainInfo.category,
                    discount: chainInfo.discount,
                    rating: place.rating
                  });
                }
              });
            }
            resolve();
          });
        });

        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`Error searching for ${type}:`, err);
      }
    }

    const uniqueResults = Array.from(
      new Map(allResults.map(item => [item.id, item])).values()
    );

    saveCachedBusinesses(zipCode, uniqueResults);

    const filteredResults = uniqueResults
      .filter(b => category === 'all' || b.category === category)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 100);

    setBusinesses(filteredResults);
    setStatus(`Found ${filteredResults.length} businesses with military discounts (ZIP: ${zipCode})`);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', width: '100%', margin: '0 auto', border: '2px solid #ccc', borderRadius: '8px', overflow: 'hidden', height: '600px' }}>
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #ccc' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #ccc', backgroundColor: '#f8f9fa' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '15px', marginTop: 0 }}>Find Military Discounts</h2>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '5px', width: '100%', maxWidth: '400px' }}>
              <input
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") geocodeAddress() }}
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
              💡 Move or zoom map to search new areas
            </p>
            {cachedZipCodes.size > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <p style={{ fontSize: '0.8rem', color: '#28a745', margin: 0, textAlign: 'center' }}>
                  📦 {cachedZipCodes.size} ZIP codes cached locally
                </p>
                <button
                  onClick={clearCache}
                  style={{
                    padding: '4px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  Clear Cache
                </button>
              </div>
            )}
          </div>

          {status && <p style={{ textAlign: 'center', color: '#0066cc', marginTop: '10px', marginBottom: 0, fontSize: '0.9rem' }}>{status}</p>}
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