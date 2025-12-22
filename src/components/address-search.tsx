"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Search, Loader2, Navigation } from "lucide-react"

interface AddressSearchProps {
    onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
    placeholder?: string
    className?: string
    value?: string
    onChange?: (value: string) => void
}

interface SearchResult {
    display_name: string
    lat: string
    lon: string
    place_id: string
}

export function AddressSearch({
    onLocationSelect,
    placeholder = "Search for an address...",
    className,
    value = "",
    onChange,
}: AddressSearchProps) {
    const [query, setQuery] = useState(value)
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)

    useEffect(() => {
        setQuery(value)
    }, [value])

    useEffect(() => {
        const searchTimeout = setTimeout(() => {
            if (query.length > 2) {
                searchAddress(query)
            } else {
                setResults([])
                setShowResults(false)
            }
        }, 500)

        return () => clearTimeout(searchTimeout)
    }, [query])

    const searchAddress = async (searchQuery: string) => {
        setLoading(true)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=pk,in,us,gb,ca,au,de,fr,jp,cn,br,mx,za,ng,eg,tr,sa,ae,bd,id`,
            )
            const data = await response.json()
            setResults(data)
            setShowResults(true)
        } catch (error) {
            console.error("Error searching address:", error)
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleSelectResult = (result: SearchResult) => {
        const location = {
            lat: Number.parseFloat(result.lat),
            lng: Number.parseFloat(result.lon),
            address: result.display_name,
        }
        onLocationSelect(location)
        setQuery(result.display_name)
        setShowResults(false)
        if (onChange) {
            onChange(result.display_name)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setQuery(newValue)
        if (onChange) {
            onChange(newValue)
        }
    }

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    className="pl-12 pr-12 h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-lg shadow-lg"
                />
                {loading && (
                    <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500 animate-spin" />
                )}
            </div>

            {showResults && results.length > 0 && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-2 shadow-2xl border-2 border-slate-200 bg-white rounded-xl">
                    <CardContent className="p-0 max-h-80 overflow-y-auto">
                        {results.map((result) => (
                            <button
                                key={result.place_id}
                                onClick={() => handleSelectResult(result)}
                                className="w-full text-left p-4 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-semibold text-slate-900 truncate">
                                            {result.display_name.split(",")[0]}
                                        </p>
                                        <p className="text-sm text-slate-500 truncate mt-1">{result.display_name}</p>
                                    </div>
                                    <Navigation className="h-4 w-4 text-slate-400 mt-1" />
                                </div>
                            </button>
                        ))}
                    </CardContent>
                </Card>
            )}

            {showResults && results.length === 0 && !loading && query.length > 2 && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-2 shadow-2xl border-2 border-slate-200 bg-white rounded-xl">
                    <CardContent className="p-6 text-center text-slate-500">
                        <div className="p-3 bg-slate-100 rounded-full w-fit mx-auto mb-3">
                            <MapPin className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-base font-medium">No locations found</p>
                        <p className="text-sm mt-1">Try searching with a different term like &quot;Tariq Road Karachi&quot;</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
