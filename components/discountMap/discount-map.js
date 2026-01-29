"use client"

import { useState, useRef, useEffect } from "react";

export function DiscountMap() {
  const [status, setStatus] = useState(null);
  const [coords, setCoords] = useState(null);
  const [currentAddress, setCurrentAddress] = useState("Charleston, SC");
  const [addressInput, setAddressInput] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [category, setCategory] = useState("all");
  const [cachedZipCodes, setCachedZipCodes] = useState(new Set());

  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const markers = useRef([]);
  const centerMarker = useRef(null);
  const placesService = useRef(null);
  const geocoder = useRef(null);
  const initialLoadComplete = useRef(false);
  const autocompleteService = useRef(null);

  // Verified national chains with precise matching
  const KNOWN_CHAINS = {
    // RESTAURANTS - Only verified with current corporate policies
    "applebee's": { discount: "Free Veterans Day meal", category: "restaurant", note: "Veterans Day only" },
    "chili's": { discount: "Free Veterans Day meal", category: "restaurant", note: "Veterans Day only" },
    "outback steakhouse": { discount: "10% off year-round", category: "restaurant", note: "Plus Veterans Day free meal" },
    "buffalo wild wings": { discount: "10% off at participating locations", category: "restaurant", note: "Location-dependent" },
    "denny's": { discount: "Free Grand Slam on Veterans Day", category: "restaurant", note: "Veterans Day only" },
    "ihop": { discount: "Free pancake combo on Veterans Day", category: "restaurant", note: "Veterans Day only" },
    "golden corral": { discount: "Free Veterans Day buffet", category: "restaurant", note: "Plus year-round 10-20% at participating locations" },
    "texas roadhouse": { discount: "Free Veterans Day meal voucher", category: "restaurant", note: "Veterans Day only" },

    // RETAIL - Only verified with current corporate policies  
    "the home depot": { discount: "10% off year-round", category: "retail", note: "Excludes appliances" },
    "home depot": { discount: "10% off year-round", category: "retail", note: "Excludes appliances" },
    "lowe's": { discount: "10% off year-round", category: "retail", note: "Year-round discount" },
    "target": { discount: "10% off during military events", category: "retail", note: "Limited time events only" },
    "gap": { discount: "10% off factory stores only", category: "retail", note: "Factory stores only" },
    "under armour": { discount: "20% off year-round", category: "retail", note: "ID.me verification required" },
    "nike": { discount: "10% off year-round", category: "retail", note: "Online verification required" },
    "foot locker": { discount: "10% off most purchases", category: "retail", note: "Restrictions apply" },

    // AUTOMOTIVE - Only verified with current corporate policies
    "jiffy lube": { discount: "15% off year-round", category: "automotive", note: "Participating Team Car Care locations only" },
    "valvoline": { discount: "15% off year-round", category: "automotive", note: "Excludes battery replacement/state inspection" },
    "meineke": { discount: "Free Veterans Day oil change", category: "automotive", note: "Veterans Day only" },
    "firestone": { discount: "10% off year-round", category: "automotive", note: "Tax-free advantages available" },

    // HOTELS - Only verified with current corporate policies
    "hampton inn": { discount: "10% off government rate", category: "hotel", note: "Military ID required" },
    "marriott": { discount: "15% off flexible rates", category: "hotel", note: "Participating resorts, code XYD" },
    "hilton": { discount: "Military family rate", category: "hotel", note: "Varies by hotel, military ID required" },
    "holiday inn": { discount: "5%+ off best flexible rate", category: "hotel", note: "Minimum 5% discount" },
    "best western": { discount: "10% off + per diem rates", category: "hotel", note: "Military/government personnel" },
    "la quinta inn": { discount: "12% off standard rate", category: "hotel", note: "Military ID required" },
    "motel 6": { discount: "10% off year-round", category: "hotel", note: "All 1,400+ locations" },

    // ENTERTAINMENT/FITNESS - Only verified with current corporate policies
    "24 hour fitness": { discount: "$0 initiation + $5 off monthly", category: "entertainment", note: "Select memberships, military ID required" }
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

  const getAddressFromCoords = async (lat, lng) => {
    try {
      if (!geocoder.current) {
        geocoder.current = new window.google.maps.Geocoder();
      }

      return new Promise((resolve) => {
        geocoder.current.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              resolve(results[0].formatted_address);
            } else {
              resolve(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            }
          }
        );
      });
    } catch (err) {
      console.error('Error getting address:', err);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
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

  // Get all zip codes within 25-mile radius for caching
  const getZipCodesInRadius = async (centerLat, centerLng, radiusMiles = 25) => {
    const zipCodes = new Set();
    
    const latDelta = radiusMiles / 69;
    const lngDelta = radiusMiles / (69 * Math.cos(centerLat * Math.PI / 180));
    
    const samplePoints = [
      { lat: centerLat, lng: centerLng },
      { lat: centerLat + latDelta, lng: centerLng },
      { lat: centerLat - latDelta, lng: centerLng },
      { lat: centerLat, lng: centerLng + lngDelta },
      { lat: centerLat, lng: centerLng - lngDelta },
      { lat: centerLat + latDelta, lng: centerLng + lngDelta },
      { lat: centerLat + latDelta, lng: centerLng - lngDelta },
      { lat: centerLat - latDelta, lng: centerLng + lngDelta },
      { lat: centerLat - latDelta, lng: centerLng - lngDelta },
    ];
    
    for (const point of samplePoints) {
      const zip = await getZipCodeFromCoords(point.lat, point.lng);
      if (zip) {
        zipCodes.add(zip);
      }
    }
    
    return Array.from(zipCodes);
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

      cachedList.forEach(zipCode => {
        localStorage.removeItem(`military_discount_zip_${zipCode}`);
      });

      localStorage.removeItem('military_discount_cached_zips');

      setCachedZipCodes(new Set());
      setStatus('Cache cleared successfully');

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

  const updateCenterMarker = (lat, lng) => {
    if (!googleMap.current) return;

    if (centerMarker.current) {
      centerMarker.current.setMap(null);
    }

    centerMarker.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: googleMap.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#FF0000",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 2,
      },
      zIndex: 1000,
      title: "Current Search Center"
    });
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
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
      autocompleteService.current = new window.google.maps.places.AutocompleteService();

      googleMap.current.addListener('idle', async () => {
        // Skip the initial idle event that fires when map first loads
        if (!initialLoadComplete.current) {
          initialLoadComplete.current = true;
          return;
        }
        
        const center = googleMap.current.getCenter();
        const newCoords = { lat: center.lat(), lon: center.lng() };
        const address = await getAddressFromCoords(newCoords.lat, newCoords.lon);
        setCurrentAddress(address);
        updateCenterMarker(newCoords.lat, newCoords.lon);
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
    if (coords) {
      searchBusinesses(coords);
    }
  }, [category]);

  const getCurrentLocation = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      const c = { lat: 32.7765, lon: -79.9311 };
      setCoords(c);
      getAddressFromCoords(c.lat, c.lon).then(addr => setCurrentAddress(addr));
      updateCenterMarker(c.lat, c.lon);
      searchBusinesses(c);
      return;
    }
    setLoading(true);
    setStatus("Requesting location...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCoords(c);
        const addr = await getAddressFromCoords(c.lat, c.lon);
        setCurrentAddress(addr);
        updateCenterMarker(c.lat, c.lon);
        setStatus("Got current location");
        searchBusinesses(c);
        setLoading(false);
      },
      async (err) => {
        setError("Unable to retrieve location: " + err.message);
        setLoading(false);
        const c = { lat: 32.7765, lon: -79.9311 };
        setCoords(c);
        const addr = await getAddressFromCoords(c.lat, c.lon);
        setCurrentAddress(addr);
        updateCenterMarker(c.lat, c.lon);
        searchBusinesses(c);
      }
    );
  };

  const handleAddressInputChange = (e) => {
    const value = e.target.value;
    setAddressInput(value);
    
    if (value.length > 2 && autocompleteService.current) {
      autocompleteService.current.getPlacePredictions(
        { input: value },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setAddressSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setAddressSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    setAddressInput(suggestion.description);
    setShowSuggestions(false);
    setAddressSuggestions([]);
    
    // Geocode the selected suggestion
    geocoder.current.geocode(
      { placeId: suggestion.place_id },
      (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const loc = results[0].geometry.location;
          const c = { lat: loc.lat(), lon: loc.lng() };
          setCoords(c);
          setCurrentAddress(results[0].formatted_address);
          updateCenterMarker(c.lat, c.lon);
          searchBusinesses(c);
        }
      }
    );
  };

  const geocodeAddress = async () => {
    setError(null);
    if (!addressInput) return;
    setLoading(true);
    setStatus("Geocoding address...");
    setShowSuggestions(false);

    try {
      const q = encodeURIComponent(addressInput);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${q}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
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
      setCurrentAddress(data.results[0].formatted_address);
      updateCenterMarker(c.lat, c.lon);
      searchBusinesses(c);
    } catch (err) {
      console.error(err);
      setError("Geocoding error");
    }
    setLoading(false);
  };

  const searchBusinessesInZipCode = async (center, zipCode) => {
    const allResults = [];
    const searchTypes = CATEGORY_TYPES.all;

    // Search from multiple points to get better coverage
    // Create a grid of 5 search points within the area
    const searchPoints = [
      { lat: center.lat, lon: center.lon }, // center
      { lat: center.lat + 0.05, lon: center.lon }, // north
      { lat: center.lat - 0.05, lon: center.lon }, // south
      { lat: center.lat, lon: center.lon + 0.05 }, // east
      { lat: center.lat, lon: center.lon - 0.05 }, // west
    ];

    for (const searchPoint of searchPoints) {
      for (const type of searchTypes) {
        try {
          const request = {
            location: new window.google.maps.LatLng(searchPoint.lat, searchPoint.lon),
            radius: 25000, // 25km radius from each search point
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

                    allResults.push({
                      id: place.place_id,
                      name: place.name,
                      lat: lat,
                      lng: lng,
                      address: place.vicinity,
                      category: chainInfo.category,
                      discount: chainInfo.discount,
                      rating: place.rating,
                      note: chainInfo.note,
                      zipCode: zipCode
                    });
                  }
                });
              }
              resolve();
            });
          });

          await new Promise(resolve => setTimeout(resolve, 300)); // Increased delay to avoid rate limits
        } catch (err) {
          console.error(`Error searching for ${type}:`, err);
        }
      }
    }

    return allResults;
  };

  const searchBusinesses = async (center) => {
    if (!placesService.current || !geocoder.current) return;

    setLoading(true);
    setStatus("Finding zip codes in 25-mile radius...");

    const zipCodes = await getZipCodesInRadius(center.lat, center.lon, 25);

    if (zipCodes.length === 0) {
      setError("Could not determine zip codes for this location");
      setLoading(false);
      return;
    }

    setStatus(`Found ${zipCodes.length} zip codes. Checking cache...`);

    const allBusinesses = [];
    const zipCodesNeedingSearch = [];

    for (const zipCode of zipCodes) {
      const cachedData = loadCachedBusinesses(zipCode);
      if (cachedData) {
        allBusinesses.push(...cachedData);
      } else {
        zipCodesNeedingSearch.push(zipCode);
      }
    }

    if (allBusinesses.length > 0) {
      // Remove duplicates BEFORE filtering
      const uniqueBusinesses = Array.from(
        new Map(allBusinesses.map(item => [item.id, item])).values()
      );
      
      const filteredBusinesses = uniqueBusinesses
        .map(b => {
          const chainInfo = matchKnownChain(b.name);
          const dist = distance(center, { lat: b.lat, lon: b.lng });
          return {
            ...b,
            distance: dist,
            note: chainInfo ? chainInfo.note : undefined
          };
        })
        .filter(b => b.distance <= 10) // Only within 10 miles of center
        .filter(b => category === 'all' || b.category === category)
        .sort((a, b) => a.distance - b.distance);

      setBusinesses(filteredBusinesses);
      
      if (zipCodesNeedingSearch.length === 0) {
        setStatus(`Loaded ${filteredBusinesses.length} businesses within 10 miles (${zipCodes.length} ZIP codes cached)`);
        setLoading(false);
        return;
      }
      
      // Continue showing cached results while searching new zip codes
      setStatus(`Showing ${filteredBusinesses.length} cached results, searching ${zipCodesNeedingSearch.length} new ZIP codes...`);
    }

    if (zipCodesNeedingSearch.length > 0) {
      setStatus(`Searching ${zipCodesNeedingSearch.length} new ZIP codes...`);

      for (let i = 0; i < zipCodesNeedingSearch.length; i++) {
        const zipCode = zipCodesNeedingSearch[i];
        setStatus(`Searching ZIP ${zipCode} (${i + 1}/${zipCodesNeedingSearch.length})...`);

        const zipResults = await searchBusinessesInZipCode(center, zipCode);
        
        const uniqueZipResults = Array.from(
          new Map(zipResults.map(item => [item.id, item])).values()
        );

        saveCachedBusinesses(zipCode, uniqueZipResults);
        allBusinesses.push(...uniqueZipResults);
      }
    }

    const uniqueResults = Array.from(
      new Map(allBusinesses.map(item => [item.id, item])).values()
    );

    const filteredResults = uniqueResults
      .map(b => {
        const chainInfo = matchKnownChain(b.name);
        const dist = distance(center, { lat: b.lat, lon: b.lng });
        return {
          ...b,
          distance: dist,
          note: chainInfo ? chainInfo.note : undefined
        };
      })
      .filter(b => b.distance <= 10 && (category === 'all' || b.category === category))
      .sort((a, b) => a.distance - b.distance);

    setBusinesses(filteredResults);
    setStatus(`Found ${filteredResults.length} businesses within 10 miles (${zipCodes.length} ZIP codes cached)`);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', width: '100%', margin: '0 auto', border: '2px solid #ccc', borderRadius: '8px', overflow: 'hidden', height: '600px' }}>
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #ccc' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #ccc', backgroundColor: '#f8f9fa' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '15px', marginTop: 0 }}>Find Military Discounts</h2>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input
                  value={addressInput}
                  onChange={handleAddressInputChange}
                  onKeyDown={(e) => { 
                    if (e.key === "Enter") {
                      geocodeAddress();
                      setShowSuggestions(false);
                    }
                    if (e.key === "Escape") {
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    if (addressSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
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
              
              {showSuggestions && addressSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: '80px',
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginTop: '4px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  {addressSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.place_id}
                      onClick={() => selectSuggestion(suggestion)}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderBottom: index < addressSuggestions.length - 1 ? '1px solid #eee' : 'none',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <div style={{ fontSize: '0.9rem', color: '#333' }}>
                        {suggestion.structured_formatting.main_text}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                        {suggestion.structured_formatting.secondary_text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ color: '#666' }}>OR</div>
            <button
              onClick={getCurrentLocation}
              style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Use My Location
            </button>
          </div>

          <div style={{ margin: '15px 0', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#495057', textAlign: 'center' }}>
              <strong>Current Center:</strong><br />
              {currentAddress}
            </p>
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
              💡 Showing results within 10 miles
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

          {!loading && businesses.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>No known military discounts found within 10 miles. Try a different location or category.</p>}

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
                  {b.note && (
                    <span style={{ color: '#999', fontSize: '0.85rem', marginLeft: '6px' }}>
                      ({b.note})
                    </span>
                  )}
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