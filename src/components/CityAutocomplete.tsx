"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Search } from 'lucide-react';

interface City {
  display_name: string;
  lat: string;
  lon: string;
}

interface CityAutocompleteProps {
  onCitySelect: (city: { name: string; lat: number; lng: number } | null) => void;
  defaultValue?: string;
  name?: string;
}

export default function CityAutocomplete({ onCitySelect, defaultValue = "", name }: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchCities = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&featuretype=city&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue && inputValue !== defaultValue && inputValue.length >= 3) {
        searchCities(inputValue);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative group">
        <input
          name={name}
          type="text"
          autoComplete="off"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (e.target.value === "") onCitySelect(null);
          }}
          onFocus={() => inputValue.length >= 3 && setShowDropdown(true)}
          className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 pl-12 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-950/20 transition-all font-medium placeholder:text-zinc-400"
          placeholder="Pesquisar cidade no mundo..."
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-950 transition-colors">
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </div>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-zinc-100 rounded-2xl shadow-2xl shadow-zinc-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 space-y-1">
            {suggestions.map((city, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setInputValue(city.display_name);
                  onCitySelect({
                    name: city.display_name,
                    lat: parseFloat(city.lat),
                    lng: parseFloat(city.lon)
                  });
                  setShowDropdown(false);
                }}
                className="w-full text-left p-3 hover:bg-zinc-50 rounded-xl transition-colors flex items-start gap-3 group"
              >
                <div className="mt-0.5 p-2 bg-zinc-50 rounded-lg text-zinc-400 group-hover:bg-white group-hover:text-zinc-950 transition-colors">
                  <MapPin size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900 line-clamp-1">{city.display_name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
