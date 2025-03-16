"use client"

import { useState } from "react"
import ExoplanetViewer from "./exoplanet-viewer"
import StarManager from "./star-manager"
import PlanetManager from "./planet-manager"
import SatelliteManager from "./satellite-manager"
import AstronomyDBViewer from "./search-dashboard"

export default function AstronomyDashboard() {
  const [activeTab, setActiveTab] = useState("search")

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Astronomy Data Management
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400">
          Explore and manage celestial objects in our database
        </p>
      </header>

      {/* Custom Tabs */}
      <div className="w-full mb-8">
        <div className="grid grid-cols-4 gap-2 bg-gray-100 p-1 rounded-lg">
          {["search", "viewer", "stars", "planets", "satellites"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 rounded-md transition-all ${
                activeTab === tab ? "bg-white shadow-sm font-medium" : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "search" && <AstronomyDBViewer />}
      {activeTab === "viewer" && <ExoplanetViewer />}
      {activeTab === "stars" && <StarManager />}
      {activeTab === "planets" && <PlanetManager />}
      {activeTab === "satellites" && <SatelliteManager />}
    </div>
  )
}
