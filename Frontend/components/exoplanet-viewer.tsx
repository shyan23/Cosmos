"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const API_BASE_URL = "http://localhost:8000"

export default function ExoplanetViewer() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageType, setImageType] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [starSystems, setStarSystems] = useState<string[]>([])
  const [selectedSystem, setSelectedSystem] = useState<string>("")
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const [dropdownType, setDropdownType] = useState<string>("")

  useEffect(() => {
    async function fetchStarSystems() {
      try {
        const response = await fetch(`${API_BASE_URL}/star-systems/`)
        if (response.ok) {
          const data = await response.json()
          setStarSystems(data.star_systems)
          setSelectedSystem(data.star_systems[0] || "")
        } else {
          console.error("Failed to fetch star systems")
        }
      } catch (error) {
        console.error("Error fetching star systems:", error)
      }
    }

    if (showDropdown && starSystems.length === 0) {
      fetchStarSystems()
    }
  }, [showDropdown, starSystems.length])

  async function fetchImage(type: string) {
    if ((type === "coordinate" || type === "3dmap") && !showDropdown) {
      setShowDropdown(true)
      setDropdownType(type)
      return
    }

    setIsLoading(true)
    let uploadEndpoint: string, viewEndpoint: string

    switch (type) {
      case "telescope":
        uploadEndpoint = "/upload-image/"
        viewEndpoint = "/view-image"
        break
      case "coordinate":
        uploadEndpoint = "/upload-image-Coordinate_plot"
        viewEndpoint = "/view-image-Coordinate"
        break
      case "planetsys":
        uploadEndpoint = "/upload-image-Planetsys"
        viewEndpoint = "/show-image-Planetsys"
        break
      case "stellardist":
        uploadEndpoint = "/upload-image-stellerDist"
        viewEndpoint = "/show-image-stellerDist"
        break
      case "3dmap":
        uploadEndpoint = "/MAP/"
        viewEndpoint = "/viewmap"
        break
      default:
        console.error("Invalid image type")
        setIsLoading(false)
        return
    }

    try {
      // Handle 3D map case separately
      if (type === "3dmap" && selectedSystem) {
        console.log(`Fetching 3D map for system: ${selectedSystem}`)
        const response = await fetch(`${API_BASE_URL}${uploadEndpoint}?ss=${selectedSystem}`, {
          method: "POST",
        })

        if (!response.ok) {
          console.error(`Failed to generate 3D map. Status: ${response.status}`)
          const errorText = await response.text()
          console.error(`Error details: ${errorText}`)
          setIsLoading(false)
          return
        }
      }
      // Handle coordinate case
      else if (type === "coordinate" && selectedSystem) {
        console.log(`Fetching coordinate plot for system: ${selectedSystem}`)
        const response = await fetch(`${API_BASE_URL}${uploadEndpoint}?star_system=${selectedSystem}`, {
          method: "POST",
        })

        if (!response.ok) {
          console.error(`Failed to generate coordinate plot. Status: ${response.status}`)
          const errorText = await response.text()
          console.error(`Error details: ${errorText}`)
          setIsLoading(false)
          return
        }
      }
      // Handle other cases
      else if (type !== "coordinate" && type !== "3dmap") {
        const response = await fetch(`${API_BASE_URL}${uploadEndpoint}`, { method: "POST" })
        if (!response.ok) {
          console.error(`Failed to generate ${type} plot. Status: ${response.status}`)
          setIsLoading(false)
          return
        }
      }

      // Now fetch the image
      console.log(`Fetching image from: ${API_BASE_URL}${viewEndpoint}`)
      const imageResponse = await fetch(`${API_BASE_URL}${viewEndpoint}`)

      if (imageResponse.ok) {
        const blob = await imageResponse.blob()
        const imageUrl = URL.createObjectURL(blob)
        setImageUrl(imageUrl)
        setImageType(type)
        if (type === "coordinate" || type === "3dmap") {
          setShowDropdown(false)
        }
      } else {
        console.error(`Failed to fetch image. Status: ${imageResponse.status}`)
        const errorText = await imageResponse.text()
        console.error(`Error details: ${errorText}`)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <h1 className="text-4xl font-light mb-8 text-center text-teal-800"> Data Visualization</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <button onClick={() => fetchImage("telescope")} className="btn-soothing">
          Telescope Discovery vs Year
        </button>
        <button onClick={() => fetchImage("coordinate")} className="btn-soothing">
          Coordinate Plot
        </button>
        <button onClick={() => fetchImage("planetsys")} className="btn-soothing">
          Planetary Systems
        </button>
        <button onClick={() => fetchImage("stellardist")} className="btn-soothing">
          Stellar Distribution
        </button>
        <button onClick={() => fetchImage("3dmap")} className="btn-soothing">
          3D Visualization
        </button>
      </div>

      {showDropdown && starSystems.length > 0 && (
        <div className="mb-4">
          <label htmlFor="star-system" className="block text-sm font-medium text-gray-700">
            Select Star System
          </label>
          <select
            id="star-system"
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          >
            {starSystems.map((system) => (
              <option key={system} value={system}>
                {system}
              </option>
            ))}
          </select>
          <button onClick={() => fetchImage(dropdownType)} className="mt-4 btn-soothing">
            Generate Plot
          </button>
        </div>
      )}

      {isLoading && (
        <div className="text-center text-teal-600">
          <p>Loading...</p>
        </div>
      )}
      {imageUrl && !isLoading && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6 transition-all duration-300 ease-in-out">
          <h2 className="text-2xl font-light mb-4 text-teal-700">
            {imageType === "3dmap" ? "3D Visualization" : imageType.charAt(0).toUpperCase() + imageType.slice(1)} Image
          </h2>
          <div className="relative w-full h-[600px]">
            <Image
              src={imageUrl || "/placeholder.svg?height=600&width=800"}
              alt={`${imageType} image`}
              fill
              className="rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}

