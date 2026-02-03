'use client'

import { Globe, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// Comprehensive country to ISO code mapping for flags
const countryToISOCode: { [key: string]: string } = {
  // Asia
  'Indonesia': 'id', 'India': 'in', 'Thailand': 'th', 'UAE': 'ae', 'United Arab Emirates': 'ae',
  'Malaysia': 'my', 'Saudi Arabia': 'sa', 'Qatar': 'qa', 'Bahrain': 'bh', 'Oman': 'om',
  'China': 'cn', 'Japan': 'jp', 'South Korea': 'kr', 'Philippines': 'ph', 'Vietnam': 'vn',
  'Singapore': 'sg', 'HK': 'hk', 'Taiwan': 'tw', 'Bangladesh': 'bd', 'Pakistan': 'pk',
  'Sri Lanka': 'lk', 'Nepal': 'np', 'Myanmar': 'mm', 'Cambodia': 'kh', 'Laos': 'la',
  'Kuwait': 'kw', 'Jordan': 'jo', 'Lebanon': 'lb', 'Israel': 'il', 'Iraq': 'iq',
  'Iran': 'ir', 'Afghanistan': 'af', 'Kazakhstan': 'kz', 'Uzbekistan': 'uz', 'Mongolia': 'mn','SG':'sg','IN':'id',
  'KSA':'sa','SN':'sg',
  // Africa
  'Ghana': 'gh', 'South Africa': 'za', 'Uganda': 'ug', 'Zimbabwe': 'zw', 'Rwanda': 'rw',
  'Morocco': 'ma', 'Kenya': 'ke', 'Mauritius': 'mu', 'Egypt': 'eg', 'Seychelles': 'sc',
  'Tanzania': 'tz', 'Ethiopia': 'et', 'Nigeria': 'ng', 'Algeria': 'dz', 'Tunisia': 'tn',
  'Libya': 'ly', 'Sudan': 'sd', 'Senegal': 'sn', 'Ivory Coast': 'ci',
  'Cameroon': 'cm', 'Angola': 'ao', 'Mozambique': 'mz', 'Madagascar': 'mg', 'Botswana': 'bw',
  'Namibia': 'na', 'Zambia': 'zm', 'Malawi': 'mw', 'SA':'za','TZ':'tz','SE':'se','MA':'ma','RW':'rw',
  'KE':'ke','EG':'eg',
  // Europe
  'Netherlands': 'nl', 'Spain': 'es', 'UK': 'gb', 'United Kingdom': 'gb', 'Germany': 'de',
  'Switzerland': 'ch', 'Turkey': 'tr', 'Italy': 'it', 'France': 'fr', 'Czech Republic': 'cz',
  'Austria': 'at', 'Greece': 'gr', 'Azerbaijan': 'az', 'Portugal': 'pt', 'Belgium': 'be',
  'Poland': 'pl', 'Sweden': 'se', 'Norway': 'no', 'Denmark': 'dk', 'Finland': 'fi',
  'Ireland': 'ie', 'Romania': 'ro', 'Hungary': 'hu', 'Slovakia': 'sk',
  'Croatia': 'hr', 'Serbia': 'rs', 'Bulgaria': 'bg', 'Ukraine': 'ua', 'Russia': 'ru',
  'SP':'es','CH':'ch','TR':'tr','PT':'pt','IT':'it',
  // North America
  'USA': 'us', 'US': 'us', 'United States of America': 'us', 'Canada': 'ca',
  'Mexico': 'mx', 'Costa Rica': 'cr', 'Panama': 'pa', 'Jamaica': 'jm', 'Cuba': 'cu',
  // South America
  'Brazil': 'br', 'Argentina': 'ar', 'Chile': 'cl', 'Colombia': 'co', 'Peru': 'pe',
  'Ecuador': 'ec', 'Venezuela': 've', 'Uruguay': 'uy', 'Paraguay': 'py', 'Bolivia': 'bo',
  // Oceania
  'Australia': 'au', 'New Zealand': 'nz', 'Fiji': 'fj', 'Papua New Guinea': 'pg',
}

// Map country codes to full country names
const countryCodeToName: { [key: string]: string } = {
  'NL': 'Netherlands',
  'SP': 'Spain',
  'DE': 'Germany',
  'FR': 'France',
  'CA': 'Canada',
  'US': 'United States',
  'IT': 'Italy',
  'CH': 'Switzerland',
  'PT': 'Portugal',
  'TR': 'Turkey',
  'GB': 'United Kingdom',
  'UK': 'United Kingdom',
  'AU': 'Australia',
  'NZ': 'New Zealand',
  'SG': 'Singapore',
  'MY': 'Malaysia',
  'TH': 'Thailand',
  'ID': 'Indonesia',
  'IN': 'India',
  'CN': 'China',
  'JP': 'Japan',
  'KR': 'South Korea',
  'AE': 'UAE',
  'SA': 'Saudi Arabia',
  'ZA': 'South Africa',
  'EG': 'Egypt',
  'KE': 'Kenya',
  'MA': 'Morocco',
  'TZ': 'Tanzania',
}

// Function to extract country code from venue name (e.g., "Amsterdam-NL" -> "NL")
const extractCountryFromVenueName = (venueName: string): string | null => {
  if (!venueName) return null
  
  // Match patterns like "City-Code" or "City - Code"
  const match = venueName.match(/[- ]([A-Z]{2})$/i)
  if (match && match[1]) {
    return match[1].toUpperCase()
  }
  
  return null
}

// Function to get country name from venue name or country field
const getCountryFromVenue = (venue: { name: string; country: string }): string => {
  // First, try to extract country code from venue name
  const countryCode = extractCountryFromVenueName(venue.name)
  if (countryCode && countryCodeToName[countryCode]) {
    return countryCodeToName[countryCode]
  }
  
  // Fallback to country field
  return venue.country || ''
}

// Function to get country ISO code from country name
const getCountryCode = (country: string, venueName?: string): string => {
  // First, try to extract country code from venue name if provided
  if (venueName) {
    const extractedCode = extractCountryFromVenueName(venueName)
    if (extractedCode) {
      // Map common country codes to ISO codes
      const codeMap: { [key: string]: string } = {
        'NL': 'nl', 'SP': 'es', 'DE': 'de', 'FR': 'fr', 'CA': 'ca',
        'US': 'us', 'IT': 'it', 'CH': 'ch', 'PT': 'pt', 'TR': 'tr',
        'GB': 'gb', 'UK': 'gb', 'AU': 'au', 'NZ': 'nz', 'SG': 'sg',
        'MY': 'my', 'TH': 'th', 'ID': 'id', 'IN': 'id', 'CN': 'cn',
        'JP': 'jp', 'KR': 'kr', 'AE': 'ae', 'SA': 'sa', 'ZA': 'za',
        'EG': 'eg', 'KE': 'ke', 'MA': 'ma', 'TZ': 'tz',
      }
      if (codeMap[extractedCode]) {
        return codeMap[extractedCode]
      }
    }
  }
  
  if (!country) return 'xx'
  
  const normalizedCountry = country.trim()
  
  // Direct lookup
  if (countryToISOCode[normalizedCountry]) {
    return countryToISOCode[normalizedCountry]
  }
  
  // Case-insensitive lookup
  const lowerCountry = normalizedCountry.toLowerCase()
  for (const [key, code] of Object.entries(countryToISOCode)) {
    if (key.toLowerCase() === lowerCountry) {
      return code
    }
  }
  
  // Partial match for common variations
  if (lowerCountry.includes('united states') || lowerCountry.includes('usa') || lowerCountry.includes('u.s.')) {
    return 'us'
  }
  if (lowerCountry.includes('united kingdom') || lowerCountry.includes('uk') || lowerCountry.includes('britain')) {
    return 'gb'
  }
  if (lowerCountry.includes('uae') || lowerCountry.includes('emirates')) {
    return 'ae'
  }
  
  return 'xx' // Unknown country
}

// Function to get flag image URL
const getFlagImageUrl = (countryCode: string): string => {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`
}

// Comprehensive country to continent mapping
const countryToContinent: { [key: string]: string } = {
  // Asia
  'indonesia': 'Asia', 'id': 'Asia',
  'india': 'Asia', 'in': 'Asia',
  'thailand': 'Asia', 'th': 'Asia',
  'uae': 'Asia', 'united arab emirates': 'Asia', 'ae': 'Asia',
  'malaysia': 'Asia', 'my': 'Asia',
  'saudi arabia': 'Asia', 'ksa': 'Asia', 'sa': 'Asia',
  'qatar': 'Asia', 'qa': 'Asia',
  'bahrain': 'Asia', 'bh': 'Asia',
  'oman': 'Asia', 'om': 'Asia',
  'china': 'Asia', 'cn': 'Asia',
  'japan': 'Asia', 'jp': 'Asia',
  'south korea': 'Asia', 'korea': 'Asia', 'kr': 'Asia',
  'philippines': 'Asia', 'ph': 'Asia',
  'vietnam': 'Asia', 'vn': 'Asia',
  'singapore': 'Asia', 'sg': 'Asia',
  'hong kong': 'Asia', 'hongkong': 'Asia', 'hk': 'Asia',
  'taiwan': 'Asia', 'tw': 'Asia',
  'bangladesh': 'Asia', 'bd': 'Asia',
  'pakistan': 'Asia', 'pk': 'Asia',
  'sri lanka': 'Asia', 'lk': 'Asia',
  'nepal': 'Asia', 'np': 'Asia',
  'myanmar': 'Asia', 'mm': 'Asia',
  'cambodia': 'Asia', 'kh': 'Asia',
  'laos': 'Asia', 'la': 'Asia',
  'kuwait': 'Asia', 'kw': 'Asia',
  'jordan': 'Asia', 'jo': 'Asia',
  'lebanon': 'Asia', 'lb': 'Asia',
  'israel': 'Asia', 'il': 'Asia',
  'iraq': 'Asia', 'iq': 'Asia',
  'iran': 'Asia', 'ir': 'Asia',
  'afghanistan': 'Asia', 'af': 'Asia',
  'kazakhstan': 'Asia', 'kz': 'Asia',
  'uzbekistan': 'Asia', 'uz': 'Asia',
  'mongolia': 'Asia', 'mn': 'Asia',
  'yemen': 'Asia', 'ye': 'Asia',
  'syria': 'Asia', 'sy': 'Asia',
  
  // Africa
  'ghana': 'Africa', 'gh': 'Africa',
  'south africa': 'Africa', 'za': 'Africa',
  'uganda': 'Africa', 'ug': 'Africa',
  'zimbabwe': 'Africa', 'zw': 'Africa',
  'rwanda': 'Africa', 'rw': 'Africa',
  'morocco': 'Africa', 'ma': 'Africa',
  'kenya': 'Africa', 'ke': 'Africa',
  'mauritius': 'Africa', 'mu': 'Africa',
  'egypt': 'Africa', 'eg': 'Africa',
  'seychelles': 'Africa', 'sc': 'Africa',
  'tanzania': 'Africa', 'tz': 'Africa',
  'ethiopia': 'Africa', 'et': 'Africa',
  'nigeria': 'Africa', 'ng': 'Africa',
  'algeria': 'Africa', 'dz': 'Africa',
  'tunisia': 'Africa', 'tn': 'Africa',
  'libya': 'Africa', 'ly': 'Africa',
  'sudan': 'Africa', 'sd': 'Africa',
  'senegal': 'Africa', 'sn': 'Africa',
  'ivory coast': 'Africa', 'cote d\'ivoire': 'Africa', 'ci': 'Africa',
  'cameroon': 'Africa', 'cm': 'Africa',
  'angola': 'Africa', 'ao': 'Africa',
  'mozambique': 'Africa', 'mz': 'Africa',
  'madagascar': 'Africa', 'mg': 'Africa',
  'botswana': 'Africa', 'bw': 'Africa',
  'namibia': 'Africa', 'na': 'Africa',
  'zambia': 'Africa', 'zm': 'Africa',
  'malawi': 'Africa', 'mw': 'Africa',
  
  // Europe
  'netherlands': 'Europe', 'nl': 'Europe',
  'spain': 'Europe', 'sp': 'Europe', 'es': 'Europe',
  'uk': 'Europe', 'united kingdom': 'Europe', 'gb': 'Europe', 'great britain': 'Europe',
  'germany': 'Europe', 'de': 'Europe',
  'switzerland': 'Europe', 'ch': 'Europe',
  'turkey': 'Europe', 'tr': 'Europe',
  'italy': 'Europe', 'it': 'Europe',
  'france': 'Europe', 'fr': 'Europe',
  'czech republic': 'Europe', 'czechia': 'Europe', 'cz': 'Europe',
  'austria': 'Europe', 'at': 'Europe',
  'greece': 'Europe', 'gr': 'Europe',
  'azerbaijan': 'Europe', 'az': 'Europe',
  'portugal': 'Europe', 'pt': 'Europe',
  'belgium': 'Europe', 'be': 'Europe',
  'poland': 'Europe', 'pl': 'Europe',
  'sweden': 'Europe', 'se': 'Europe',
  'norway': 'Europe', 'no': 'Europe',
  'denmark': 'Europe', 'dk': 'Europe',
  'finland': 'Europe', 'fi': 'Europe',
  'ireland': 'Europe', 'ie': 'Europe',
  'romania': 'Europe', 'ro': 'Europe',
  'hungary': 'Europe', 'hu': 'Europe',
  'slovakia': 'Europe', 'sk': 'Europe',
  'croatia': 'Europe', 'hr': 'Europe',
  'serbia': 'Europe', 'rs': 'Europe',
  'bulgaria': 'Europe', 'bg': 'Europe',
  'ukraine': 'Europe', 'ua': 'Europe',
  'russia': 'Europe', 'ru': 'Europe',
  
  // North America
  'usa': 'North America', 'united states': 'North America', 'united states of america': 'North America', 'us': 'North America',
  'canada': 'North America', 'ca': 'North America',
  'mexico': 'North America', 'mx': 'North America',
  'costa rica': 'North America', 'cr': 'North America',
  'panama': 'North America', 'pa': 'North America',
  'jamaica': 'North America', 'jm': 'North America',
  'cuba': 'North America', 'cu': 'North America',
  
  // South America
  'brazil': 'South America', 'br': 'South America',
  'argentina': 'South America', 'ar': 'South America',
  'chile': 'South America', 'cl': 'South America',
  'colombia': 'South America', 'co': 'South America',
  'peru': 'South America', 'pe': 'South America',
  'ecuador': 'South America', 'ec': 'South America',
  'venezuela': 'South America', 've': 'South America',
  'uruguay': 'South America', 'uy': 'South America',
  'paraguay': 'South America', 'py': 'South America',
  'bolivia': 'South America', 'bo': 'South America',
  
  // Oceania
  'australia': 'Oceania', 'au': 'Oceania',
  'new zealand': 'Oceania', 'nz': 'Oceania',
  'fiji': 'Oceania', 'fj': 'Oceania',
  'papua new guinea': 'Oceania', 'pg': 'Oceania',
}

// Function to determine continent from country name or venue
const getContinent = (country: string, venueName?: string): string => {
  // First, try to extract country code from venue name if provided
  if (venueName) {
    const extractedCode = extractCountryFromVenueName(venueName)
    if (extractedCode && countryCodeToName[extractedCode]) {
      const countryName = countryCodeToName[extractedCode]
      const normalizedCountry = countryName.toLowerCase()
      if (countryToContinent[normalizedCountry]) {
        return countryToContinent[normalizedCountry]
      }
    }
  }
  
  if (!country) return 'Other'
  
  const normalizedCountry = country.trim().toLowerCase()
  
  // Direct lookup first (exact match)
  if (countryToContinent[normalizedCountry]) {
    return countryToContinent[normalizedCountry]
  }
  
  // Try with common variations
  const variations: { [key: string]: string } = {
    'united states': 'usa',
    'united states of america': 'usa',
    'u.s.': 'usa',
    'u.s.a.': 'usa',
    'united kingdom': 'uk',
    'great britain': 'uk',
    'britain': 'uk',
    'hong kong': 'hong kong',
    'hongkong': 'hong kong',
    'south korea': 'south korea',
    'korea': 'south korea',
    'czech republic': 'czech republic',
    'czechia': 'czech republic',
    'ivory coast': 'ivory coast',
    'cote d\'ivoire': 'ivory coast',
  }
  
  // Check variations
  for (const [variation, standard] of Object.entries(variations)) {
    if (normalizedCountry.includes(variation) || variation.includes(normalizedCountry)) {
      const standardKey = standard.toLowerCase()
      if (countryToContinent[standardKey]) {
        return countryToContinent[standardKey]
      }
    }
  }
  
  // Try partial match (but be careful with abbreviations)
  for (const [key, continent] of Object.entries(countryToContinent)) {
    // Only match if it's a full word match or exact abbreviation
    if (key.length <= 3) {
      // For abbreviations, require exact match
      if (normalizedCountry === key) {
        return continent
      }
    } else {
      // For full country names, check if country contains the key or vice versa
      if (normalizedCountry === key || normalizedCountry.includes(key) || key.includes(normalizedCountry)) {
        return continent
      }
    }
  }
  
  return 'Other'
}

interface Venue {
  id: string
  name: string
  city: string
  country: string
  status: string
}

export default function VenuesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch venues from database
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/venues?limit=1000')
        const result = await response.json()
        
        if (result.success) {
          // Filter only active venues
          const activeVenues = result.data
            .filter((v: any) => v.status === 'Active')
            .map((v: any) => ({
              id: String(v.id),
              name: v.name || `${v.city}, ${v.country}`,
              city: v.city,
              country: v.country,
              status: v.status,
            }))
          setVenues(activeVenues)
        }
      } catch (err) {
        console.error('Error fetching venues:', err)
        setVenues([])
      } finally {
        setLoading(false)
      }
    }

    fetchVenues()
  }, [])

  // Group venues by continent
  const venuesByRegion = useMemo(() => {
    const grouped: { [key: string]: Venue[] } = {}
    
    venues.forEach(venue => {
      // Get country from venue name or country field
      const country = getCountryFromVenue(venue)
      // Get continent using both country and venue name
      const continent = getContinent(country, venue.name)
      if (!grouped[continent]) {
        grouped[continent] = []
      }
      grouped[continent].push(venue)
    })
    
    // Sort venues within each region by city name
    Object.keys(grouped).forEach(region => {
      grouped[region].sort((a, b) => a.city.localeCompare(b.city))
    })
    
    // Define region order
    const regionOrder = ['Asia', 'Africa', 'Europe', 'North America', 'South America', 'Oceania', 'Other']
    
    return regionOrder
      .filter(region => grouped[region] && grouped[region].length > 0)
      .map(region => ({
        region,
        cities: grouped[region]
      }))
  }, [venues])

  // Filter venues based on search
  const filteredVenues = useMemo(() => {
    if (!searchTerm.trim()) {
      return venuesByRegion
    }
    
    const searchLower = searchTerm.toLowerCase()
    return venuesByRegion.map(region => ({
      ...region,
      cities: region.cities.filter(venue => {
        const venueString = `${venue.city}, ${venue.country}`.toLowerCase()
        return venueString.includes(searchLower) || 
               venue.city.toLowerCase().includes(searchLower) ||
               venue.country.toLowerCase().includes(searchLower)
      })
    })).filter(region => region.cities.length > 0)
  }, [venuesByRegion, searchTerm])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0A3049] via-[#0A3049] to-[#0A3049] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <Badge className="bg-blue-500/20 text-white border-blue-400/30 mb-6">
              Global Training Locations
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Training Venues Worldwide
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Access world-class training facilities in locations across Asia, Africa, Europe, and North America.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search for a city, country, or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg border-2 border-slate-200 focus:border-[#0A3049] rounded-xl"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading venues...</p>
          </div>
        )}

        {/* Venues by Region */}
        {!loading && (
          <div className="space-y-8">
            {filteredVenues.map((region, index) => (
            <Card key={index} className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{region.region}</h2>
                  <Badge variant="secondary">{region.cities.length} location{region.cities.length !== 1 ? 's' : ''}</Badge>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {region.cities.map((venue) => {
                    // Get country from venue name or country field
                    const country = getCountryFromVenue(venue)
                    // Get country code using both country and venue name
                    const countryCode = getCountryCode(country, venue.name)
                    const flagUrl = getFlagImageUrl(countryCode)
                    const venueDisplay = venue.name || `${venue.city}, ${country || venue.country}`
                    return (
                      <div
                        key={venue.id}
                        onClick={() => router.push(`/courses/venue/${encodeURIComponent(venueDisplay)}`)}
                        className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm border-2 border-slate-200 flex items-center justify-center shrink-0 group-hover:border-blue-400 transition-colors overflow-hidden">
                          <Image
                            src={flagUrl}
                            alt={`${country || venue.country} flag`}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              // Fallback to a default image if flag fails to load
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Ccircle fill="%23e5e7eb" cx="20" cy="20" r="20"/%3E%3Ctext x="20" y="26" font-size="20" text-anchor="middle"%3E🌍%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        </div>
                        <span className="text-slate-700 font-medium group-hover:text-blue-600 transition-colors">{venueDisplay}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {!loading && filteredVenues.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-4xl mx-auto mb-4">
                🌍
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No venues found</h3>
              <p className="text-slate-600">Try adjusting your search terms.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

