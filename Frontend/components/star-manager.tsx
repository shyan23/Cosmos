"use client"

import type React from "react"
import { useState } from "react"
import { useToast } from "@/components/ui/simplified-toast"

const API_BASE_URL = "http://localhost:8000"

// Types for our celestial objects
interface StarData {
  star_name: string
  new_star_name?: string
  origin_system: string
  luminosity: number
  solar_radii: number
  solar_mass: number
  stellar_class: string
}

export default function StarManager() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"list" | "create" | "edit">("list")
  const [currentStar, setCurrentStar] = useState<StarData>({
    star_name: "",
    new_star_name: "",
    origin_system: "",
    luminosity: 0,
    solar_radii: 0,
    solar_mass: 0,
    stellar_class: "",
  })

  // Reset form to initial state
  const resetForm = () => {
    setCurrentStar({
      star_name: "",
      new_star_name: "",
      origin_system: "",
      luminosity: 0,
      solar_radii: 0,
      solar_mass: 0,
      stellar_class: "",
    })
    setError(null)
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCurrentStar({
      ...currentStar,
      [name]:
        name === "star_name" || name === "new_star_name" || name === "origin_system" || name === "stellar_class"
          ? value
          : Number.parseFloat(value || "0"),
    })
  }

  // Create a new star
  const createStar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const starData: StarData = {
        star_name: currentStar.star_name,
        origin_system: currentStar.origin_system,
        luminosity: Number.parseFloat(currentStar.luminosity.toString()),
        solar_radii: Number.parseFloat(currentStar.solar_radii.toString()),
        solar_mass: Number.parseFloat(currentStar.solar_mass.toString()),
        stellar_class: currentStar.stellar_class,
      }

      const response = await fetch(`${API_BASE_URL}/create-star/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(starData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create star")
      }

      addToast({
        title: "Success!",
        description: `Star "${starData.star_name}" has been created successfully.`,
        variant: "success",
      })

      setMode("list")
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Update an existing star
  const updateStar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (!currentStar.star_name) {
        throw new Error("Star name is missing. Please select a valid star to update.")
      }

      const starUpdateData: Record<string, any> = {}
      if (currentStar.new_star_name) starUpdateData.new_star_name = currentStar.new_star_name
      if (currentStar.origin_system) starUpdateData.origin_system = currentStar.origin_system
      if (currentStar.luminosity) starUpdateData.luminosity = Number.parseFloat(currentStar.luminosity.toString())
      if (currentStar.solar_radii) starUpdateData.solar_radii = Number.parseFloat(currentStar.solar_radii.toString())
      if (currentStar.solar_mass) starUpdateData.solar_mass = Number.parseFloat(currentStar.solar_mass.toString())
      if (currentStar.stellar_class) starUpdateData.stellar_class = currentStar.stellar_class

      if (Object.keys(starUpdateData).length === 0) {
        setError("Please fill at least one field to update")
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/update-star/${currentStar.star_name}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(starUpdateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update star")
      }

      const result = await response.json()
      addToast({
        title: "Success!",
        description: `Star "${currentStar.star_name}" has been updated successfully.`,
        variant: "success",
      })

      setMode("list")
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Delete a star
  const deleteStar = async (starName: string) => {
    if (!confirm(`Are you sure you want to delete ${starName}?`)) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/delete-star/${starName}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to delete star")
      }

      addToast({
        title: "Success!",
        description: `Star "${starName}" has been deleted successfully.`,
        variant: "error", // Note: Consider "success" instead of "error" for consistency
      })

      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Fetch star data for editing
  const fetchStarForEdit = async (starName: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/stars/${starName}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Star not found")
      }
      const data = await response.json()
      setCurrentStar({
        star_name: data.star_name, // Assumes API returns "star_name"
        new_star_name: "", // Reset for editing
        origin_system: data.origin_system || "",
        luminosity: data.luminosity || 0,
        solar_radii: data.solar_radii || 0,
        solar_mass: data.solar_mass || 0,
        stellar_class: data.stellar_class || "",
      })
      setMode("edit")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Star not found. Please check the name and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-yellow-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          Star Management
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
              Add Star
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
            <h3 className="text-lg font-medium text-gray-900">Star Management</h3>
            <p className="text-sm text-gray-500">Create, update, or delete stars in the database</p>
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
                Create New Star
              </button>

              <div className="text-center py-4 text-gray-500">To update or delete a star, enter its name below:</div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentStar.star_name}
                  onChange={(e) => setCurrentStar({ ...currentStar, star_name: e.target.value })}
                  placeholder="Enter star name"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    if (currentStar.star_name) {
                      fetchStarForEdit(currentStar.star_name)
                    } else {
                      setError("Please enter a star name")
                    }
                  }}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Edit"}
                </button>
                <button
                  onClick={() => {
                    if (currentStar.star_name) {
                      deleteStar(currentStar.star_name)
                    } else {
                      setError("Please enter a star name")
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(mode === "create" || mode === "edit") && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{mode === "create" ? "Add New Star" : "Edit Star"}</h3>
            <p className="text-sm text-gray-500">
              {mode === "create"
                ? "Enter the details for the new star"
                : `Editing star: ${currentStar.star_name}. Only fill fields you want to update.`}
            </p>
          </div>
          <div className="p-4">
            <form onSubmit={mode === "create" ? createStar : updateStar} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="star_name" className="block text-sm font-medium text-gray-700">
                    Star Name
                  </label>
                  <input
                    id="star_name"
                    name="star_name"
                    type="text"
                    value={currentStar.star_name}
                    onChange={handleInputChange}
                    required={mode === "create"}
                    disabled={mode === "edit"} // Disable in edit mode since it's from the path
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                {mode === "edit" && (
                  <div className="space-y-2">
                    <label htmlFor="new_star_name" className="block text-sm font-medium text-gray-700">
                      New Star Name
                    </label>
                    <input
                      id="new_star_name"
                      name="new_star_name"
                      type="text"
                      value={currentStar.new_star_name || ""}
                      onChange={handleInputChange}
                      placeholder="Leave empty to keep current name"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="origin_system" className="block text-sm font-medium text-gray-700">
                    Origin System
                  </label>
                  <input
                    id="origin_system"
                    name="origin_system"
                    type="text"
                    value={currentStar.origin_system || ""}
                    onChange={handleInputChange}
                    required={mode === "create"}
                    placeholder={mode === "edit" ? "Leave empty to keep current value" : ""}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="luminosity" className="block text-sm font-medium text-gray-700">
                    Luminosity
                  </label>
                  <input
                    id="luminosity"
                    name="luminosity"
                    type="number"
                    step="0.01"
                    value={currentStar.luminosity || ""}
                    onChange={handleInputChange}
                    required={mode === "create"}
                    placeholder={mode === "edit" ? "Leave empty to keep current value" : ""}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="solar_radii" className="block text-sm font-medium text-gray-700">
                    Solar Radii
                  </label>
                  <input
                    id="solar_radii"
                    name="solar_radii"
                    type="number"
                    step="0.01"
                    value={currentStar.solar_radii || ""}
                    onChange={handleInputChange}
                    required={mode === "create"}
                    placeholder={mode === "edit" ? "Leave empty to keep current value" : ""}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="solar_mass" className="block text-sm font-medium text-gray-700">
                    Solar Mass
                  </label>
                  <input
                    id="solar_mass"
                    name="solar_mass"
                    type="number"
                    step="0.01"
                    value={currentStar.solar_mass || ""}
                    onChange={handleInputChange}
                    required={mode === "create"}
                    placeholder={mode === "edit" ? "Leave empty to keep current value" : ""}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="stellar_class" className="block text-sm font-medium text-gray-700">
                    Stellar Class
                  </label>
                  <input
                    id="stellar_class"
                    name="stellar_class"
                    type="text"
                    value={currentStar.stellar_class || ""}
                    onChange={handleInputChange}
                    required={mode === "create"}
                    placeholder={mode === "edit" ? "Leave empty to keep current value" : ""}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                    <span>{mode === "create" ? "Create Star" : "Update Star"}</span>
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