import { useState, useRef, useEffect, use } from "react";
import Papa from "papaparse";

export function FinAdvisor({setModal}) {
  const [status, setStatus] = useState(null);
  const [coords, setCoords] = useState(null);
  const [addressInput, setAddressInput] = useState("");
  const [advisors, setAdvisors] = useState([]);
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

      getCurrentLocation();
      googleMap.current = new window.google.maps.Map(mapRef.current, {
        center: coords || { lat: 38.8895, lng: -77.0353 },
        zoom: 13,
      });
    } catch (err) {
      console.error("Map initialization error:", err);
    }
  };

  const updateMarkers = () => {
    if (!googleMap.current) return;
    markers.current.forEach((m) => m.setMap(null));
    markers.current = [];

    advisors.forEach((a, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: Number(a.lat), lng: Number(a.long) },
        map: googleMap.current,
        title: a.name,
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
        searchAdvisors({ lat: position.lat(), lon: position.lng() });
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
    Papa.parse("/data/SEC_fa_data.csv", {
      download: true,
      header: true,
      complete: (results) => {setLocations(results.data)},
      error: (err) => console.error("CSV parsing error:", err),
    });
    Papa.parse("/data/SEC_fa_noaddy_data.csv", {
      download: true,
      header: true,
      complete: (results) => {setOnlineLocations(results.data)},
      error: (err) => console.error("CSV parsing error:", err),
    });
  }, []);

  useEffect(() => {
    if (locations.length > 0) {
      initMap();
    }
  }, [locations]);

  useEffect(() => {
    if (coords) {
    googleMap.current.setCenter({ lat: Number(coords.lat), lng: Number(coords.lon) });
    }
  }, [coords]);


  useEffect(() => {
    updateMarkers();
  }, [advisors]);

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
        searchAdvisors(c);
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
      searchAdvisors(c);
    } catch (err) {
      console.error(err);
      setError("Geocoding error");
    }
    setLoading(false);
  };

  const searchAdvisors = (center) => {
    setStatus("Searching for advisors...");

    const enriched = locations.map((a) => ({
      ...a,
      distance: distance(center, { lat: Number(a.lat), lon: Number(a.long) }),
    }));

    enriched.sort((x, y) => x.distance - y.distance); 
    const nearest = enriched.slice(0, 100);

    setAdvisors(nearest);
    setStatus(`Showing 100 advisors`);
  };

  return (
    <div className='modal-background'
        onClick={() => setModal(null)}>
      <div className='modal'
        onClick={(e) => e.stopPropagation()}
        style={{display:'flex', width:'90%'}}>
        <div style={{width:'50%', overflowY:'auto'}}>
          <div className="exit-button" onClick={() => setModal(null)}>x</div>
          <div className="modal-wrapper-top">
            <h2 style={{textAlign:'center', marginBottom:0}}>Find a Financial Advisor</h2>

            <div>
              <div className="center">
                <div className="center" style={{gap:5}}>
                  <input value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    onKeyDown={(e) => {if (e.key === "Enter") geocodeAddress()}}
                    placeholder="Enter Address or ZIP Code"/>
                  <button onClick={geocodeAddress}>Search</button>
                </div>
                <div>OR</div>
                <button style={{marginBottom:'5px'}} onClick={getCurrentLocation}>Use My Location</button>
              </div>
              <hr />
              <div className="center">
                <button onClick={() => setOnline(!online)}>{online?"Show In-Person Advisors":"Show Online Advisors"}</button>
                <a href="https://installations.militaryonesource.mil/search?program-service=26/view-by=ALL" target="_blank" rel="noopener noreferrer">
                  {<button>Find Local Military Support Center</button>}
                </a>
              </div>
              
              {status && <p className="status">{status}</p>}
              {error && <p className="error">{error}</p>}
            </div>
          </div>

          <div className="modal-wrapper-bottom">
            {loading && <p>Loading...</p>}

            {!loading && advisors.length === 0 && <p>No advisors yet</p>}

            <div className="advisor-list">
              {online?
                <div>
                  {onlineLocations.map((a) => (
                  <div key={a.id} className={'advisor-card'}>
                      <h3>{a.name}</h3>
                      <div className='benefit-links'>
                        {a.website && <a href={a.website} target="_blank" rel="noopener noreferrer">
                          {<button>Visit Website</button>}
                        </a>}
                      </div>
                    </div>
                  ))}
                </div>:
                <div>
                  {advisors.map((a, i) => (
                  <div key={a.id}
                    className={`advisor-card ${highlightedIndex === i ? "highlight-card" : ""}`}
                    onMouseEnter={() => highlightMarker(i)}
                    onMouseLeave={() => {
                      markers.current.forEach((m) => {
                        m.setIcon(null);
                        m.setAnimation(null);
                      })
                    }}
                    onClick={() => {
                      googleMap.current.setCenter({ lat: Number(a.lat), lng: Number(a.long) })
                    }}
                  >
                      <h3>{a.name}</h3>
                      <p>{a.address}</p>
                      <p>{a.distance.toFixed(1)} miles away</p>
                      <div className='benefit-links'>
                        {a.website && <a href={a.website} target="_blank" rel="noopener noreferrer">
                          {<button>Visit Website</button>}
                        </a>}
                        <button
                          onClick={() => {
                          const maps = `https://www.google.com/maps/dir/?api=1&destination=${a.lat},${a.long}`;
                          window.open(maps, "_blank");
                          }}
                        >
                            Directions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        </div>
        <div>
          <div id="map" ref={mapRef} className="map"></div>
        </div>
      </div>
    </div>
  );
}

