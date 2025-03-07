"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

const API_BASE_URL = "http://localhost:8000"

// Types for our celestial objects
interface SatelliteData {
  satellite_name: string
  parent_planet: string
  satellite_radii: number
  satellite_mass: number
  orbital_period: number
  atmosphere: string
}

export default function SatelliteManager() {
  const { toast } = useToast()
  const [satellites, setSatellites] = useState<SatelliteData[]>([])
  const [planets, setPlanets] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingPlanets, setFetchingPlanets] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"list" | "create" | "edit">("list")
  const [currentSatellite, setCurrentSatellite] = useState<SatelliteData>({
    satellite_name: "",
    parent_planet: "",
    satellite_radii: 0,
    satellite_mass: 0,
    orbital_period: 0,
    atmosphere: "",
  })

  // Fetch all planets for parent planet dropdown
  const fetchPlanets = async () => {
    setFetchingPlanets(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/parent-planet/`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Failed to fetch planets: ${response.status}`)
      }
      const data = await response.json()
      console.log("Fetched planets data:", data) // Debug: Check the raw response

      // Handle the expected response format: {"planet_names": [...]}
      if (data.planet_names && Array.isArray(data.planet_names)) {
        const planetNames = data.planet_names.filter(Boolean) // Remove falsy values
        if (planetNames.length === 0) {
          setError("No planets available to select")
        }
        setPlanets(planetNames)
      } else {
        setError("Unexpected API response format")
        setPlanets([])
      }
    } catch (err) {
      console.error("Error fetching planets:", err)
      setError(err instanceof Error ? err.message : "Failed to load planets")
      setPlanets([])
    } finally {
      setFetchingPlanets(false)
    }
  }

  // Create a new satellite
  const createSatellite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const satelliteData: SatelliteData = {
        satellite_name: currentSatellite.satellite_name,
        parent_planet: currentSatellite.parent_planet,
        satellite_radii: Number.parseFloat(currentSatellite.satellite_radii.toString()),
        satellite_mass: Number.parseFloat(currentSatellite.satellite_mass.toString()),
        orbital_period: Number.parseFloat(currentSatellite.orbital_period.toString()),
        atmosphere: currentSatellite.atmosphere,
      }

      const response = await fetch(`${API_BASE_URL}/satellite/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(satelliteData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create satellite")
      }

      toast({
        title: "Satellite Created!",
        description: `"${satelliteData.satellite_name}" has been added successfully.`,
        variant: "default",
        className: "bg-green-600 text-white border-green-700",
        duration: 3000,
      })

      setMode("list")
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Update an existing satellite
  const updateSatellite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const satelliteUpdateData: Record<string, any> = {}
      if (currentSatellite.parent_planet) {
        satelliteUpdateData.parent_planet = currentSatellite.parent_planet
      }
      if (currentSatellite.satellite_radii) {
        satelliteUpdateData.satellite_radii = Number.parseFloat(currentSatellite.satellite_radii.toString())
      }
      if (currentSatellite.satellite_mass) {
        satelliteUpdateData.satellite_mass = Number.parseFloat(currentSatellite.satellite_mass.toString())
      }
      if (currentSatellite.orbital_period) {
        satelliteUpdateData.orbital_period = Number.parseFloat(currentSatellite.orbital_period.toString())
      }
      if (currentSatellite.atmosphere) {
        satelliteUpdateData.atmosphere = currentSatellite.atmosphere
      }

      if (Object.keys(satelliteUpdateData).length === 0) {
        setError("Please fill at least one field to update")
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/satellite/${currentSatellite.satellite_name}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(satelliteUpdateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update satellite")
      }

      toast({
        title: "Satellite Updated!",
        description: `"${currentSatellite.satellite_name}" has been updated successfully.`,
        variant: "default",
        className: "bg-green-600 text-white border-green-700",
        duration: 3000,
      })

      setMode("list")
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Delete a satellite
  const deleteSatellite = async (satelliteName: string) => {
    if (!confirm(`Are you sure you want to delete ${satelliteName}?`)) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/satellite/${satelliteName}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to delete satellite")
      }

      toast({
        title: "Satellite Deleted!",
        description: `"${satelliteName}" has been removed successfully.`,
        variant: "default",
        className: "bg-green-600 text-white border-green-700",
        duration: 3000,
      })

      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCurrentSatellite({
      ...currentSatellite,
      [name]:
        name === "satellite_name" || name === "parent_planet" || name === "atmosphere"
          ? value
          : value === "" ? 0 : Number.parseFloat(value),
    })
  }

  // Reset form to default values
  const resetForm = () => {
    setCurrentSatellite({
      satellite_name: "",
      parent_planet: "",
      satellite_radii: 0,
      satellite_mass: 0,
      orbital_period: 0,
      atmosphere: "",
    })
  }

  // Load planets only once on component mount
  useEffect(() => {
    fetchPlanets()
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-purple-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Satellite Management
        </h2>
        <div className="flex gap-2">
          {mode === "list" ? (
            <button
              onClick={() => setMode("create")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Satellite
            </button>
          ) : (
            <button
              onClick={() => {
                setMode("list")
                resetForm()
              }}
              className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {mode === "list" && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Satellite Management</h3>
            <p className="text-sm text-gray-500">Create, update, or delete satellites in the database</p>
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setMode("create")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Satellite
              </button>

              <div className="text-center py-4 text-gray-500">
                To update or delete a satellite, enter its name below:
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSatellite.satellite_name}
                  onChange={(e) => setCurrentSatellite({ ...currentSatellite, satellite_name: e.target.value })}
                  placeholder="Enter satellite name"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    if (currentSatellite.satellite_name) {
                      fetch(`${API_BASE_URL}/satellites/${currentSatellite.satellite_name}`)
                        .then((response) => {
                          if (response.ok) return response.json()
                          throw new Error("Satellite not found")
                        })
                        .then((data) => {
                          setCurrentSatellite(data)
                          setMode("edit")
                        })
                        .catch((err) => {
                          setError("Satellite not found. Please check the name and try again.")
                        })
                    } else {
                      setError("Please enter a satellite name")
                    }
                  }}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (currentSatellite.satellite_name) {
                      deleteSatellite(currentSatellite.satellite_name)
                    } else {
                      setError("Please enter a satellite name")
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(mode === "create" || mode === "edit") && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {mode === "create" ? "Add New Satellite" : "Edit Satellite"}
            </h3>
            <p className="text-sm text-gray-500">
              {mode === "create"
                ? "Enter the details for the new satellite"
                : `Editing satellite: ${currentSatellite.satellite_name}. Only fill fields you want to update.`}
            </p>
          </div>
          <div className="p-4">
            {fetchingPlanets && <p className="text-gray-500 mb-4">Loading planets...</p>}
            <form onSubmit={mode === "create" ? createSatellite : updateSatellite} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="satellite_name" className="block text-sm font-medium text-gray-700">
                    Satellite Name
                  </label>
                  <input
                    id="satellite_name"
                    name="satellite_name"
                    type="text"
                    value={currentSatellite.satellite_name}
                    onChange={handleInputChange}
                    required={mode === "create"}
                    disabled={mode === "edit"}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="parent_planet" className="block text-sm font-medium text-gray-700">
                    Parent Planet
                  </label>
                  <select
                    id="parent_planet"
                    name="parent_planet"
                    value={currentSatellite.parent_planet}
                    onChange={handleInputChange}
                    required={mode === "create"}
                    disabled={fetchingPlanets || planets.length === 0}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">{mode === "create" ? "Select a planet" : "Leave unchanged"}</option>
                    {planets.map((planet) => (
                      <option key={planet} value={planet}>
                        {planet}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="satellite_radii" className="block text-sm font-medium text-gray-700">
                    Satellite Radii
                  </label>
                  <input
                    id="satellite_radii"
                    name="satellite_radii"
                    type="number"
                    step="0.01"
                    value={currentSatellite.satellite_radii || ""}
                    onChange={handleInputChange}
                    required={mode === "create"}
                    placeholder={mode === "edit" ? "Leave empty to keep current" : ""}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="satellite_mass" className="block text-sm font-medium text-gray-700">
                    Satellite Mass
                  </label>
                  <input
                    id="satellite_mass"
                    name="satellite_mass"
                    type="number"
                    step="0.01"
                    value={currentSatellite.satellite_mass || ""}
                    onChange={handleInputChange}
                    required={mode === "create"}
                    placeholder={mode === "edit" ? "Leave empty to keep current" : ""}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="orbital_period" className="block text-sm font-medium text-gray-700">
                    Orbital Period (days)
                  </label>
                  <input
                    id="orbital_period"
                    name="orbital_period"
                    type="number"
                    step="0.01"
                    value={currentSatellite.orbital_period || ""}
                    onChange={handleInputChange}
                    required={mode === "create"}
                    placeholder={mode === "edit" ? "Leave empty to keep current" : ""}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="atmosphere" className="block text-sm font-medium text-gray-700">
                    Atmosphere
                  </label>
                  <textarea
                    id="atmosphere"
                    name="atmosphere"
                    value={currentSatellite.atmosphere || ""}
                    onChange={handleInputChange}
                    placeholder={mode === "edit" ? "Leave empty to keep current" : ""}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm min-h-[80px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading || fetchingPlanets}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {mode === "create" ? "Creating..." : "Updating..."}
                    </span>
                  ) : (
                    <span>{mode === "create" ? "Create Satellite" : "Update Satellite"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}