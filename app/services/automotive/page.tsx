"use client"
import { Header } from "@/components/header"
import { useState } from "react"
import { Car, FileText, Wrench, Shield, Package, Plane, ChevronRight, CreditCard, Scale, Tag, AlertCircle, Map } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { STATES } from "@/lib/types"

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"

const serviceCategories = [
  { name: "Driver's License", icon: FileText, id: "drivers-license" },
  { name: "Buying/Selling a Car", icon: Car, id: "buying-selling" },
  { name: "Vehicle Maintenance", icon: Wrench, id: "maintenance" },
  { name: "PCS & Vehicle Shipping", icon: Plane, id: "shipping" },
  { name: "Deployment & Storage", icon: Package, id: "deployment" },
  { name: "Car Insurance", icon: Shield, id: "insurance" },
  { name: "Registrations / ID", icon: CreditCard, id: "registration" },
  { name: "Legal Protections", icon: Scale, id: "legal" },
  { name: "Military Discounts", icon: Tag, id: "discounts" },
  { name: "Emergency & Roadside", icon: AlertCircle, id: "emergency" },
]

export default function AutomotivePage() {
  const [tooltip, setTooltip] = useState({ visible: false, name: "", x: 0, y: 0 });

  const handleMouseMove = (
    evt: React.MouseEvent<SVGPathElement>,
    name: string
  ) => {
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

  const handleStateClick = (stateName: string) => {
    const state = STATES.find((s) => s.name === stateName)
    if (state) {
      window.open(state.dmv, "_blank")
    }
  }

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

      <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)] overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 bg-slate-100 border-r overflow-y-auto">
          <div className="top-20 p-6">
            <a href="/services/automotive">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-slate-300 text-center">
                Automotive Services
              </h2>
            </a>
            <div className="space-y-3">
              {serviceCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Card
                    key={category.name}
                    className="p-4 hover:shadow-md transition-all cursor-pointer bg-white border-2 hover:border-primary group"
                  >
                    <a key={category.name} href={`/services/automotive/${category.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </a>
                  </Card>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative overflow-auto">
          <div className="relative z-10 p-6 lg:p-12">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Automotive Services and Benefits</h1>
                <p className="text-xl text-muted-foreground">
                  Choose your state for your local Department of Transportation
                </p>
              </div>

              {/* Interactive US Map */}
              <ComposableMap
                projection="geoAlbersUsa"
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }: { geographies: RSMGeography[] }) =>
                    geographies.map((geo: RSMGeography) => {
                      const name = geo.properties.name ?? "Unknown";
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={(evt: React.MouseEvent<SVGPathElement>) => handleMouseMove(evt, name)}
                          onMouseMove={(evt: React.MouseEvent<SVGPathElement>) => handleMouseMove(evt, name)}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => handleStateClick(name)}
                          className="fill-[lightgrey] stroke-[#fff] stroke-1 transition-[fill] duration-0.2 ease-in-out cursor-pointer hover:fill-[rgb(0,0,76)]"
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>

              {tooltip.visible && (
                <div
                  className="fixed bg-[#1e3a8a] text-white font-bold p-4 rounded-xl"
                  style={{ top: tooltip.y, left: tooltip.x }}
                >
                  {tooltip.name}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
