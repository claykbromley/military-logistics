"use client"
import { Header } from "@/components/header"
import { useState } from "react"
import { Car, FileText, DollarSign, Shield, Handshake, Plane, ChevronRight, Info } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { STATES } from "@/lib/types"

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"

const serviceCategories = [
  { name: "Driver's License", icon: FileText, description: "Renew or obtain military driver's licenses" },
  { name: "Vehicle Registration", icon: Car, description: "Register vehicles in your state or overseas" },
  { name: "Auto Loans", icon: DollarSign, description: "Special military rates for vehicle financing" },
  { name: "Insurance", icon: Shield, description: "USAA, GEICO Military & specialized coverage" },
  { name: "Buying/Selling", icon: Handshake, description: "Tips and resources for vehicle transactions" },
  { name: "Deployment", icon: Plane, description: "Vehicle storage and deployment preparation" },
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

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)]">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 bg-slate-100 border-r">
          <div className="sticky top-20 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-slate-300 text-center">
              Automotive Services
            </h2>
            <div className="space-y-3">
              {serviceCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Card
                    key={category.name}
                    className="p-4 hover:shadow-md transition-all cursor-pointer bg-white border-2 hover:border-primary group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* More Info section */}
            <Card className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-slate-900">More Information</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Military Benefits</h4>
                  <p className="text-muted-foreground text-xs">
                    Active duty members may be exempt from certain state requirements and fees.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Deployment Support</h4>
                  <p className="text-muted-foreground text-xs">
                    Special provisions for vehicle storage, insurance, and registration during deployment.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Quick Links</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex items-center gap-1">
                      <ChevronRight className="h-3 w-3 text-primary" />
                      <a href="https://www.usaa.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                        USAA Resources
                      </a>
                    </li>
                    <li className="flex items-center gap-1">
                      <ChevronRight className="h-3 w-3 text-primary" />
                      <a href="https://militaryautosource.com/home" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                        Military AutoSource
                      </a>
                    </li>
                    <li className="flex items-center gap-1">
                      <ChevronRight className="h-3 w-3 text-primary" />
                      <a href="https://www.navyfederal.org/loans-cards/auto-loans.html" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                        Navy Federal Auto
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative">
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
