"use client"

import type React from "react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

const API_BASE_URL = "http://localhost:8000"

// Types for our celestial objects
interface PlanetData {
  planet_name: string
  origin_system: string
  planetary_radii: number
  planetary_mass: number
  orbital_period: number
  atmosphere: string
}

export default function PlanetManager() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"list" | "create" | "edit">("list")
  const [currentPlanet, setCurrentPlanet] = useState<PlanetData>({
    planet_name: "",
    origin_system: "",
    planetary_radii: 0,
    planetary_mass: 0,
    orbital_period: 0,
    atmosphere: "",
  })

  // Create a new planet
  const createPlanet = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const planetData: PlanetData = {
        planet_name: currentPlanet.planet_name,
        origin_system: currentPlanet.origin_system,
        planetary_radii: Number.parseFloat(currentPlanet.planetary_radii.toString()),
        planetary_mass: Number.parseFloat(currentPlanet.planetary_mass.toString()),
        orbital_period: Number.parseFloat(currentPlanet.orbital_period.toString()),
        atmosphere: currentPlanet.atmosphere,
      }

      const response = await fetch(`${API_BASE_URL}/planets/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planetData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create planet")
      }

      toast({
        title: "Planet Created!",
        description: `"${planetData.planet_name}" has been added to the database.`,
        variant: "default", // Use "default" or "success" depending on your library
        className: "bg-green-600 text-white border-green-700", // Green signal styling
        duration: 3000, // Auto-dismiss after 3 seconds
      })

      setMode("list")
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Update an existing planet
  const updatePlanet = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const planetUpdateData = {
        origin_system: currentPlanet.origin_system,
        planetary_radii: Number.parseFloat(currentPlanet.planetary_radii.toString()),
        planetary_mass: Number.parseFloat(currentPlanet.planetary_mass.toString()),
        orbital_period: Number.parseFloat(currentPlanet.orbital_period.toString()),
        atmosphere: currentPlanet.atmosphere,
      }

      const response = await fetch(`${API_BASE_URL}/planets/${currentPlanet.planet_name}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planetUpdateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update planet")
      }

      toast({
        title: "Planet Updated!",
        description: `"${currentPlanet.planet_name}" has been successfully updated.`,
        variant: "default",
        className: "bg-green-600 text-white border-green-700", // Consistent green signal
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

  // Delete a planet
  const deletePlanet = async (planetName: string) => {
    if (!confirm(`Are you sure you want to delete ${planetName}?`)) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/planets/${planetName}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to delete planet")
      }

      toast({
        title: "Planet Deleted!",
        description: `"${planetName}" has been removed from the database.`,
        variant: "default",
        className: "bg-green-600 text-white border-green-700", // Green for success, even on delete
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentPlanet({
      ...currentPlanet,
      [name]:
        name === "planet_name" || name === "origin_system" || name === "atmosphere"
          ? value
          : Number.parseFloat(value || "0"),
    })
  }

  // Reset form to default values
  const resetForm = () => {
    setCurrentPlanet({
      planet_name: "",
      origin_system: "",
      planetary_radii: 0,
      planetary_mass: 0,
      orbital_period: 0,
      atmosphere: "",
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
            />
          </svg>
          Planet Management
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
              Add Planet
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
            <h3 className="text-lg font-medium text-gray-900">Planet Management</h3>
            <p className="text-sm text-gray-500">Create, update, or delete planets in the database</p>
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
                Create New Planet
              </button>

              <div className="text-center py-4 text-gray-500">To update or delete a planet, enter its name below:</div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentPlanet.planet_name}
                  onChange={(e) => setCurrentPlanet({ ...currentPlanet, planet_name: e.target.value })}
                  placeholder="Enter planet name"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    if (currentPlanet.planet_name) {
                      fetch(`${API_BASE_URL}/planets/${currentPlanet.planet_name}`)
                        .then((response) => {
                          if (response.ok) return response.json()
                          throw new Error("Planet not found")
                        })
                        .then((data) => {
                          setCurrentPlanet(data)
                          setMode("edit")
                        })
                        .catch((err) => {
                          setError("Planet not found. Please check the name and try again.")
                        })
                    } else {
                      setError("Please enter a planet name")
                    }
                  }}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (currentPlanet.planet_name) {
                      deletePlanet(currentPlanet.planet_name)
                    } else {
                      setError("Please enter a planet name")
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
              {mode === "create" ? "Add New Planet" : "Edit Planet"}
            </h3>
            <p className="text-sm text-gray-500">
              {mode === "create"
                ? "Enter the details for the new planet"
                : `Editing planet: ${currentPlanet.planet_name}`}
            </p>
          </div>
          <div className="p-4">
            <form onSubmit={mode === "create" ? createPlanet : updatePlanet} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="planet_name" className="block text-sm font-medium text-gray-700">
                    Planet Name
                  </label>
                  <input
                    id="planet_name"
                    name="planet_name"
                    type="text"
                    value={currentPlanet.planet_name}
                    onChange={handleInputChange}
                    required
                    disabled={mode === "edit"}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="origin_system" className="block text-sm font-medium text-gray-700">
                    Origin System
                  </label>
                  <input
                    id="origin_system"
                    name="origin_system"
                    type="text"
                    value={currentPlanet.origin_system}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="planetary_radii" className="block text-sm font-medium text-gray-700">
                    Planetary Radii
                  </label>
                  <input
                    id="planetary_radii"
                    name="planetary_radii"
                    type="number"
                    step="0.01"
                    value={currentPlanet.planetary_radii}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="planetary_mass" className="block text-sm font-medium text-gray-700">
                    Planetary Mass
                  </label>
                  <input
                    id="planetary_mass"
                    name="planetary_mass"
                    type="number"
                    step="0.01"
                    value={currentPlanet.planetary_mass}
                    onChange={handleInputChange}
                    required
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
                    value={currentPlanet.orbital_period}
                    onChange={handleInputChange}
                    required
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
                    value={currentPlanet.atmosphere}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm min-h-[80px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
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
                    <span>{mode === "create" ? "Create Planet" : "Update Planet"}</span>
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