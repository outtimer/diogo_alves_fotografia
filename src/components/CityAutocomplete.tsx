"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, Search, Compass } from 'lucide-react';

interface Suggestion {
  display_name: string;
  original_display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
}

interface CityAutocompleteProps {
  onCitySelect: (city: { name: string; lat: number; lng: number } | null) => void;
  defaultValue?: string;
  name?: string;
}

export default function CityAutocomplete({ onCitySelect, defaultValue = "", name }: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(defaultValue || "");
  const [searchMode, setSearchMode] = useState<'city' | 'place'>('city');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(defaultValue || "");
  }, [defaultValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizeState = (state?: string): string => {
    if (!state) return "";
    const cleaned = state.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    
    const map: Record<string, string> = {
      "acre": "AC", "alagoas": "AL", "amapa": "AP", "amazonas": "AM", "bahia": "BA",
      "ceara": "CE", "distrito federal": "DF", "espirito santo": "ES", "goias": "GO",
      "maranhao": "MA", "mato grosso": "MT", "mato grosso do sul": "MS", "minas gerais": "MG",
      "para": "PA", "paraiba": "PB", "parana": "PR", "pernambuco": "PE", "piaui": "PI",
      "rio de janeiro": "RJ", "rio grande do norte": "RN", "rio grande do sul": "RS",
      "rondonia": "RO", "roraima": "RR", "santa catarina": "SC", "sao paulo": "SP",
      "sergipe": "SE", "tocantins": "TO"
    };
    
    return map[cleaned] || state;
  };

  const isExcludedType = (item: any, mode: 'city' | 'place') => {
    const type = (item.type || '').toLowerCase();
    const cls = (item.class || '').toLowerCase();
    const addresstype = (item.addresstype || '').toLowerCase();
    
    // Always exclude ZIP codes, states, regions, countries, continents, etc.
    const baseExcludes = [
      'postcode', 'state', 'region', 'country', 'county', 'province', 
      'state_district', 'continent', 'sea', 'ocean', 'postcode_district', 'post_code'
    ];
    
    if (baseExcludes.includes(type) || baseExcludes.includes(cls) || baseExcludes.includes(addresstype)) {
      return true;
    }

    if (mode === 'city') {
      // In city mode, we want actual cities, towns, villages, municipalities, hamlets, suburbs, neighbourhoods.
      // These are of class 'place' or 'boundary'
      if (cls !== 'place' && cls !== 'boundary') {
        return true;
      }
      const allowedTypes = ['city', 'town', 'village', 'municipality', 'hamlet', 'suburb', 'neighbourhood', 'administrative', 'settlement'];
      if (!allowedTypes.includes(type) && !allowedTypes.includes(addresstype)) {
        return true;
      }
    } else {
      // If searching for places/locals, we exclude generic city/town/village boundaries/settlements
      const cityTypes = ['city', 'town', 'village', 'hamlet', 'suburb', 'municipality', 'neighbourhood', 'administrative', 'settlement'];
      if (cityTypes.includes(type) || cityTypes.includes(cls) || cityTypes.includes(addresstype)) {
        if (cls === 'boundary' && type === 'administrative') {
          return true;
        }
        if (cls === 'place') {
          return true;
        }
      }
    }

    return false;
  };

  const searchPlaces = useCallback(async (query: string, mode: 'city' | 'place') => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // We do not use &featuretype=city anymore to ensure we can find all municipalities, towns, and villages (e.g., Salesópolis)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=15`
      );
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const seen = new Set<string>();
        const uniqueSuggestions: Suggestion[] = [];

        for (const item of data) {
          if (isExcludedType(item, mode)) continue;

          const firstSegment = item.display_name.split(',')[0].trim();
          const country = item.address?.country;
          const isBrazil = country === 'Brasil' || country === 'Brazil';

          let displayName = '';
          if (mode === 'city') {
            const cityName = item.address?.city || 
                             item.address?.town || 
                             item.address?.village || 
                             item.address?.municipality || 
                             item.address?.suburb || 
                             item.address?.hamlet;
            const name = cityName || firstSegment;
            
            if (isBrazil) {
              const stateAbbr = normalizeState(item.address?.state);
              displayName = stateAbbr ? `${name}, ${stateAbbr}` : `${name}, Brasil`;
            } else {
              displayName = country ? `${name}, ${country}` : item.display_name;
            }
          } else {
            const cityName = item.address?.city || 
                             item.address?.town || 
                             item.address?.village || 
                             item.address?.municipality || 
                             item.address?.suburb || 
                             item.address?.hamlet;
            
            if (isBrazil) {
              const stateAbbr = normalizeState(item.address?.state);
              if (cityName && stateAbbr) {
                displayName = `${firstSegment}, ${cityName} - ${stateAbbr}`;
              } else if (cityName) {
                displayName = `${firstSegment}, ${cityName}, Brasil`;
              } else {
                displayName = `${firstSegment}, Brasil`;
              }
            } else {
              if (cityName && country) {
                displayName = `${firstSegment}, ${cityName}, ${country}`;
              } else if (country) {
                displayName = `${firstSegment}, ${country}`;
              } else {
                displayName = item.display_name;
              }
            }
          }

          if (!seen.has(displayName)) {
            seen.add(displayName);
            uniqueSuggestions.push({
              display_name: displayName,
              original_display_name: item.display_name,
              lat: item.lat,
              lon: item.lon,
              type: item.type,
              class: item.class
            });
          }
        }
        setSuggestions(uniqueSuggestions);
      } else {
        setSuggestions([]);
      }
      setShowDropdown(true);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue && inputValue !== (defaultValue || "") && inputValue.length >= 3) {
        searchPlaces(inputValue, searchMode);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue, defaultValue, searchMode, searchPlaces]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search Mode Toggle (Tabs) */}
      <div className="flex gap-1 mb-3 bg-zinc-100/60 p-1 rounded-xl w-full max-w-[280px]">
        <button
          type="button"
          onClick={() => {
            setSearchMode('city');
            setSuggestions([]);
            setInputValue("");
            onCitySelect(null);
          }}
          className={`flex-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
            searchMode === 'city'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-950'
          }`}
        >
          Cidade, País
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchMode('place');
            setSuggestions([]);
            setInputValue("");
            onCitySelect(null);
          }}
          className={`flex-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
            searchMode === 'place'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-950'
          }`}
        >
          Local, País
        </button>
      </div>

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
          placeholder={
            searchMode === 'city'
              ? "Pesquisar cidade (ex: São Paulo, Paris)..."
              : "Pesquisar local (ex: Parque Ibirapuera, Torre Eiffel)..."
          }
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-950 transition-colors">
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </div>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-zinc-100 rounded-2xl shadow-2xl shadow-zinc-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-64 overflow-y-auto">
          <div className="p-2 space-y-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setInputValue(suggestion.display_name);
                  onCitySelect({
                    name: suggestion.display_name,
                    lat: parseFloat(suggestion.lat),
                    lng: parseFloat(suggestion.lon)
                  });
                  setShowDropdown(false);
                }}
                className="w-full text-left p-3 hover:bg-zinc-50 rounded-xl transition-colors flex items-start gap-3 group"
              >
                <div className="mt-0.5 p-2 bg-zinc-50 rounded-lg text-zinc-400 group-hover:bg-white group-hover:text-zinc-950 transition-colors">
                  {searchMode === 'city' ? <MapPin size={14} /> : <Compass size={14} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900 line-clamp-1">{suggestion.display_name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
