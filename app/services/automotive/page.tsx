"use client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState, useRef, useCallback, useEffect } from "react"
import { Car, DollarSign, FileText, Wrench, Shield, Package, Plane, ChevronRight, CreditCard, Scale, Tag, AlertCircle, Map, MapPin, Search, X, List, ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { STATES } from "@/lib/types"

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"

const serviceCategories = [
  { name: "Driver's License", icon: FileText, id: "drivers-license" },
  { name: "Buying/Selling a Car", icon: DollarSign, id: "buying-selling" },
  { name: "Vehicle Maintenance", icon: Wrench, id: "maintenance" },
  { name: "PCS & Vehicle Shipping", icon: Plane, id: "shipping" },
  { name: "Deployment & Storage", icon: Package, id: "deployment" },
  { name: "Car Insurance", icon: Shield, id: "insurance" },
  { name: "Registrations / ID", icon: CreditCard, id: "registration" },
  { name: "Legal Protections", icon: Scale, id: "legal" },
  { name: "Military Discounts", icon: Tag, id: "discounts" },
  { name: "Emergency & Roadside", icon: AlertCircle, id: "emergency" },
]

interface TooltipState {
  visible: boolean;
  name: string;
  abbr: string;
  x: number;
  y: number;
}

interface StateInfo {
  name: string;
  abbr: string;
  dmv: string;
}

export default function AutomotivePage() {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, name: "", abbr: "", x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const searchRef = useRef<HTMLInputElement>(null);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const observer = new MutationObserver(() => {
      forceUpdate({});
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);


  const findState = useCallback((name: string): StateInfo | undefined => {
    return STATES.find((s) => s.name === name);
  }, []);

  const isStateMatch = useCallback((name: string): boolean => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const state = findState(name);
    return name.toLowerCase().includes(q) || (state?.abbr.toLowerCase().includes(q) ?? false);
  }, [searchQuery, findState]);

  const handleMouseMove = (evt: React.MouseEvent<SVGPathElement>, name: string) => {
    const state = findState(name);
    setTooltip({ visible: true, name, abbr: state?.abbr ?? "", x: evt.clientX, y: evt.clientY });
    setHoveredState(name);
  };

  const handleMouseLeave = () => {
    setTooltip((t) => ({ ...t, visible: false }));
    setHoveredState(null);
  };

  const handleStateClick = (stateName: string) => {
    const state = findState(stateName);
    if (state) window.open(state.dmv, "_blank");
  };

  const filteredStates = STATES.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.abbr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary transition-colors">
              Home
            </a>
            <ChevronRight className="h-4 w-4" />
            <a className="hover:text-primary transition-colors">
              Services
            </a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Automotive</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 bg-sidebar border-r">
          <div className="top-20 p-6">
            <a href="/services/automotive">
              <h2 className="text-2xl font-bold text-sidebar-foreground mb-6 pb-3 border-b-2 border-muted-foreground text-center">
                Automotive Services
              </h2>
            </a>
            <div className="space-y-3">
              <a key={"vehicle-manager"} href={`/services/command-center/property`} className="block">
                <Card
                  key={"vehicle-manager"}
                  className="p-4 hover:shadow-md transition-all cursor-pointer bg-card border-2 hover:border-primary group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-card-foreground/10 group-hover:bg-card-foreground/20 transition-colors">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                        Vehicle Manager
                      </h3>
                    </div>
                  </div>
                </Card>
              </a>
              {serviceCategories.map((category) => {
                const Icon = category.icon
                return (
                  <a key={category.name} href={`/services/automotive/${category.id}`} className="block">
                    <Card
                      key={category.name}
                      className="p-4 hover:shadow-md transition-all cursor-pointer bg-card border-2 hover:border-primary group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-card-foreground/10 group-hover:bg-card-foreground/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </Card>
                  </a>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10">
            {/* Hero */}
            <div className="text-center mb-8 anim-up" style={{ animationDelay: "0.05s", animationFillMode: "backwards" }}>
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-5 bg-primary text-primary-foreground">
                <MapPin className="w-3 h-3" />
                Interactive Directory
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight text-foreground">
                Find Your State DMV
              </h1>
              <p className="text-base lg:text-lg max-w-lg mx-auto text-muted-foreground">
                Select a state on the map or search below to visit your local Department of Motor Vehicles.
              </p>
            </div>

            {/* Search + Toggle */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 anim-up" style={{ animationDelay: "0.15s", animationFillMode: "backwards" }}>
              <div
                className="flex items-center gap-3 flex-1 bg-card rounded-2xl px-5 py-1 border-2 border-border transition-all duration-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
              >
                <Search className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search states…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 py-3 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }} 
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex rounded-xl overflow-hidden flex-shrink-0 border-2 border-border">
                {(["map", "list"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
                      mode === "list" ? "border-l border-border" : ""
                    } ${
                      viewMode === mode 
                        ? "bg-foreground text-background" 
                        : "bg-card text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {mode === "map" ? <Map className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                    {mode === "map" ? "Map" : "List"}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="anim-up" style={{ animationDelay: "0.25s", animationFillMode: "backwards" }}>
              {viewMode === "map" ? (
                <div className="relative bg-card rounded-3xl overflow-hidden border border-border shadow-lg">
                  {/* dot pattern */}
                  <div 
                    className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none" 
                    style={{ 
                      backgroundImage: "radial-gradient(circle, currentColor 0.8px, transparent 0.8px)", 
                      backgroundSize: "24px 24px",
                      color: "var(--muted-foreground)"
                    }} 
                  />
                  <div className="relative p-4 lg:p-8">
                    <ComposableMap projection="geoAlbersUsa" projectionConfig={{ scale: 1000 }} style={{ width: "100%", height: "auto" }}>
                      <Geographies geography={geoUrl}>
                        {({ geographies }: { geographies: any[] }) =>
                          geographies.map((geo: any) => {
                            const name: string = geo.properties.name ?? "Unknown";
                            const match = isStateMatch(name);
                            const isHovered = hoveredState === name;
                            const hasSearch = searchQuery.length > 0;

                            let fill = "oklch(0.35 0.08 250)"; // primary color
                            let fillOpacity = 1;
                            if (hasSearch && match) fill = "oklch(0.35 0.08 250)"; // accent color
                            else if (hasSearch && !match) { fill = "oklch(0.5 0.02 250)"; fillOpacity = 0.3; }
                            else if (isHovered) fill = "oklch(0.48 0.12 220)"; // accent color

                            // In dark mode, adjust colors
                            if (document.documentElement.classList.contains('dark')) {
                              fill = hasSearch && match ? "oklch(0.55 0.08 250)" : 
                                    isHovered ? "oklch(0.48 0.12 220)" : 
                                    hasSearch && !match ? "oklch(0.4 0.02 250)" : 
                                    "oklch(0.55 0.08 250)";
                            }

                            return (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                onMouseEnter={(evt: React.MouseEvent<SVGPathElement>) => handleMouseMove(evt, name)}
                                onMouseMove={(evt: React.MouseEvent<SVGPathElement>) => handleMouseMove(evt, name)}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => handleStateClick(name)}
                                style={{
                                  default: { fill, fillOpacity, stroke: "var(--card)", strokeWidth: 0.8, transition: "fill 0.2s, fill-opacity 0.2s", cursor: "pointer", outline: "none" },
                                  hover: { fill: "oklch(0.48 0.12 220)", fillOpacity: 1, stroke: "var(--card)", strokeWidth: 1, cursor: "pointer", outline: "none" },
                                  pressed: { fill: "oklch(0.42 0.12 220)", stroke: "var(--card)", strokeWidth: 1, outline: "none" },
                                }}
                              />
                            );
                          })
                        }
                      </Geographies>
                    </ComposableMap>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {filteredStates.map((state) => (
                    <a
                      key={state.abbr}
                      href={state.dmv}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3.5 bg-card rounded-xl no-underline transition-all duration-200 group border border-border hover:bg-foreground hover:text-background hover:border-foreground hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold bg-muted text-muted-foreground group-hover:bg-background/10 group-hover:text-current transition-colors">
                        {state.abbr}
                      </div>
                      <div className="flex-1 text-sm font-medium truncate text-foreground group-hover:text-current">{state.name}</div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity duration-200" />
                    </a>
                  ))}
                  {filteredStates.length === 0 && (
                    <div className="col-span-full text-center py-16 text-sm text-muted-foreground">
                      No states match "<span className="font-semibold">{searchQuery}</span>"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Categories */}
            <div className="lg:hidden mt-10">
              <h3 className="text-lg font-bold mb-4 text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Service Categories
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {serviceCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button 
                      key={cat.id} 
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-card text-left border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-xs font-semibold truncate text-foreground">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />

      {/* Tooltip */}
      {tooltip.visible && (
        <div className="fixed z-50 pointer-events-none px-4 py-2.5 rounded-xl flex items-center gap-2" style={{ top: tooltip.y - 50, left: tooltip.x + 14, background: "#080d24", boxShadow: "0 8px 24px rgba(8,13,36,0.35)" }}>
          <span className="text-xs font-bold" style={{ color: "#f0c756" }}>{tooltip.abbr}</span>
          <span className="text-sm font-semibold text-white">{tooltip.name}</span>
          <ExternalLink className="w-3 h-3 ml-1" style={{ color: "rgba(255,255,255,0.35)" }} />
        </div>
      )}
    </div>
  )
}
