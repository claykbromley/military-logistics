import './automotive.css'
import { Link } from "react-router-dom";
import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const dotWebsites = {
  Alabama: "https://www.dot.state.al.us/",
  Alaska: "https://dot.alaska.gov/",
  Arizona: "https://azdot.gov/",
  Arkansas: "https://www.ardot.gov/",
  California: "https://dot.ca.gov/",
  Colorado: "https://www.codot.gov/",
  Connecticut: "https://portal.ct.gov/DOT",
  Delaware: "https://deldot.gov/",
  Florida: "https://www.fdot.gov/",
  Georgia: "https://www.dot.ga.gov/",
  Hawaii: "https://hidot.hawaii.gov/",
  Idaho: "https://itd.idaho.gov/",
  Illinois: "https://idot.illinois.gov/",
  Indiana: "https://www.in.gov/indot/",
  Iowa: "https://iowadot.gov/",
  Kansas: "https://www.ksdot.gov/",
  Kentucky: "https://transportation.ky.gov/",
  Louisiana: "https://wwwsp.dotd.la.gov/",
  Maine: "https://www.maine.gov/mdot/",
  Maryland: "https://www.mdot.maryland.gov/",
  Massachusetts: "https://www.mass.gov/orgs/massachusetts-department-of-transportation",
  Michigan: "https://www.michigan.gov/mdot",
  Minnesota: "https://www.dot.state.mn.us/",
  Mississippi: "https://mdot.ms.gov/",
  Missouri: "https://www.modot.org/",
  Montana: "https://www.mdt.mt.gov/",
  Nebraska: "https://dot.nebraska.gov/",
  Nevada: "https://dot.nv.gov/",
  "New Hampshire": "https://www.nh.gov/dot/",
  "New Jersey": "https://www.state.nj.us/transportation/",
  "New Mexico": "https://www.dot.nm.gov/",
  "New York": "https://www.dot.ny.gov/",
  "North Carolina": "https://www.ncdot.gov/",
  "North Dakota": "https://www.dot.nd.gov/",
  Ohio: "https://www.transportation.ohio.gov/",
  Oklahoma: "https://oklahoma.gov/odot.html",
  Oregon: "https://www.oregon.gov/odot/",
  Pennsylvania: "https://www.penndot.pa.gov/",
  "Rhode Island": "https://www.dot.ri.gov/",
  "South Carolina": "https://www.scdot.org/",
  "South Dakota": "https://dot.sd.gov/",
  Tennessee: "https://www.tn.gov/tdot.html",
  Texas: "https://www.txdot.gov/",
  Utah: "https://udot.utah.gov/",
  Vermont: "https://vtrans.vermont.gov/",
  Virginia: "https://www.virginiadot.org/",
  Washington: "https://wsdot.wa.gov/",
  "West Virginia": "https://transportation.wv.gov/",
  Wisconsin: "https://wisconsindot.gov/",
  Wyoming: "https://dot.state.wy.us/",
};

export default function Overview() {
  const [tooltip, setTooltip] = useState({ visible: false, name: "", x: 0, y: 0 });

  const handleMouseMove = (evt, name) => {
    setTooltip({
      visible: true,
      name,
      x: evt.clientX + 10,
      y: evt.clientY + 10,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  const handleClick = (stateName) => {
    const url = dotWebsites[stateName];
    if (url) window.open(url, "_blank");
  };

  return (
    <div className='automotive-page'>
      <div className='services'>
        <div className='option-header'><Link key={"../automotive"} to={"../automotive"}>Automotive Services</Link></div>
        <hr />
        <div className='services-option'><Link key={"./liscense"} to={"./liscense"}>Driver's Liscense</Link></div>
        <div className='services-option'><Link key={"./registration"} to={"./registration"}>Vehicle Registration</Link></div>
        <div className='services-option'><Link key={"./loans"} to={"./loans"}>Auto Loans</Link></div>
        <div className='services-option'><Link key={"./insurance"} to={"./insurance"}>Insurance</Link></div>
        <div className='services-option'><Link key={"./buy-sell"} to={"./buy-sell"}>Buying/Selling</Link></div>
        <div className='services-option'><Link key={"./deployment"} to={"./deployment"}>Deployment</Link></div>
      </div>
      <div className='main'>
        <div style={{textAlign:'center'}}>
          <h1 style={{margin:0}}>Automotive Services and Benefits</h1>
          <h3 style={{marginTop:0}}>Choose your state for your local Department of Transportation</h3>
        </div>
        <div className="map-container">
          <ComposableMap
            projection="geoAlbersUsa"
            className="us-map"
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = geo.properties.name;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(evt) => handleMouseMove(evt, name)}
                      onMouseMove={(evt) => handleMouseMove(evt, name)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleClick(name)}
                      className="state"
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          {tooltip.visible && (
            <div
              className="tooltip"
              style={{ top: tooltip.y, left: tooltip.x }}
            >
              {tooltip.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
