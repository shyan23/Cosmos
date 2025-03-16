"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AstronomyDBViewer() {
  const router = useRouter()
  const [keyword, setKeyword] = useState("")
  const [filter, setFilter] = useState("general")
  const [results, setResults] = useState<any[]>([])

  // Mapping for table headers based on the selected filter
  const headerMapping: Record<string, string[]> = {
    general: [
      "Serial",
      "Object Name",
      "Category",
      "Object Location",
      "Discovering Telescope",
      "Discovery Year",
    ],
    star: [
      "Serial",
      "Star Name",
      "Stellar Class",
      "Solar Radius",
      "Solar Mass",
      "System",
      "Distance",
    ],
    planet: [
      "Serial",
      "Planet Name",
      "Parent System",
      "Planetary Radius",
      "Planetary Mass",
      "Orbital Period",
      "Atmosphere",
    ],
    misc: [
      "Serial",
      "Object Name",
      "Object Location",
      "Object Category",
      "Object Distance",
    ],
  }

  // Called whenever the keyword is changed
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setKeyword(value)
    if (value.trim()) {
      fetchData(value.trim(), filter)
    } else {
      setResults([])
    }
  }

  // Called whenever the filter dropdown changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value
    setFilter(newFilter)
    if (keyword.trim()) {
      fetchData(keyword.trim(), newFilter)
    }
  }

  // Fetch data from the API based on current keyword and filter.
  async function fetchData(keyword: string, filter: string) {
    try {
      const endpoint = filter === "general" ? "http://127.0.0.1:8000/api/generalSearch" : "http://127.0.0.1:8000/api/specifiedSearch"
      const body =
        filter === "general"
          ? { keyword }
          : { keyword, filter }
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        console.error("Error in request:", response.statusText)
        return
      }

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  // Render a table row based on filter type and data item
  function renderRow(item: any, index: number) {
    const serialCell = <td key="serial" className="border p-2">{index + 1}</td>
    let cells: JSX.Element[] = []

    if (filter === "general") {
      cells = [
        <td key="obj_name" className="border p-2">{item.obj_name}</td>,
        <td key="obj_type" className="border p-2">{item.obj_type}</td>,
        <td key="obj_loc" className="border p-2">{item.obj_loc}</td>,
        <td key="telescope" className="border p-2">{item.telescope}</td>,
        <td key="discovery" className="border p-2">{item.discovery}</td>,
      ]
    } else if (filter === "star") {
      cells = [
        <td key="star_name" className="border p-2">{item.star_name}</td>,
        <td key="stellar_class" className="border p-2">{item.stellar_class}</td>,
        <td key="solar_radii" className="border p-2">{item.solar_radii}</td>,
        <td key="solar_mass" className="border p-2">{item.solar_mass}</td>,
        <td key="star_type" className="border p-2">{item.star_type}</td>,
        <td key="distance" className="border p-2">{item.distance}</td>,
      ]
    } else if (filter === "planet") {
      cells = [
        <td key="planet_name" className="border p-2">{item.planet_name}</td>,
        <td key="parent_system" className="border p-2">{item.parent_system}</td>,
        <td key="planet_radius" className="border p-2">{item.planet_radius}</td>,
        <td key="planet_mass" className="border p-2">{item.planet_mass}</td>,
        <td key="orbit" className="border p-2">{item.orbit}</td>,
        <td key="atmosphere" className="border p-2">{item.atmosphere}</td>,
      ]
    } else if (filter === "misc") {
      cells = [
        <td key="misc_name" className="border p-2">{item.misc_name}</td>,
        <td key="parent_system" className="border p-2">{item.parent_system}</td>,
        <td key="misc_category" className="border p-2">{item.misc_category}</td>,
        <td key="distance" className="border p-2">{item.distance}</td>,
      ]
    } else {
      // Fallback to general
      cells = [
        <td key="obj_name" className="border p-2">{item.obj_name}</td>,
        <td key="obj_type" className="border p-2">{item.obj_type}</td>,
        <td key="obj_loc" className="border p-2">{item.obj_loc}</td>,
        <td key="telescope" className="border p-2">{item.telescope}</td>,
        <td key="discovery" className="border p-2">{item.discovery}</td>,
      ]
    }

    return (
      <tr key={index}>
        {serialCell}
        {cells}
      </tr>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="search-container mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <input
          type="text"
          id="search-bar"
          placeholder="Search..."
          value={keyword}
          onChange={handleKeywordChange}
          className="border border-gray-400 rounded p-2 flex-1"
        />
        <select
          id="filter-dropdown"
          value={filter}
          onChange={handleFilterChange}
          className="border border-gray-400 rounded p-2"
        >
          <option value="general">General Search</option>
          <option value="planet">Planet Search</option>
          <option value="star">Star Search</option>
          <option value="misc">Misc Search</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table id="results-table" className="min-w-full bg-white border">
          <thead id="table-head" className="bg-teal-100">
            <tr>
              {headerMapping[filter].map((head, index) => (
                <th key={index} className="border p-2 text-left">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((item, index) => renderRow(item, index))
            ) : (
              <tr>
                <td
                  className="p-4 text-center"
                  colSpan={headerMapping[filter].length}
                >
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}