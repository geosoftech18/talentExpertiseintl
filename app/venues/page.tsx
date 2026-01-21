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

// Function to get country ISO code from country name
const getCountryCode = (country: string): string => {
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

// Function to determine continent from country name
const getContinent = (country: string): string => {
  if (!country) return 'Other'
  
  const normalizedCountry = country.trim().toLowerCase()
  
  // Asia
  const asiaCountries = [
    'indonesia', 'india', 'thailand', 'uae', 'united arab emirates', 'malaysia', 'saudi arabia',
    'qatar', 'bahrain', 'oman', 'china', 'japan', 'south korea', 'philippines', 'vietnam',
    'singapore', 'hongkong', 'taiwan', 'bangladesh', 'pakistan', 'sri lanka', 'nepal', 'myanmar',
    'cambodia', 'laos', 'kuwait', 'jordan', 'lebanon', 'israel', 'iraq', 'iran', 'afghanistan',
    'kazakhstan', 'uzbekistan', 'mongolia','hk','sg','KSA','SN'
  ]
  
  // Africa
  const africaCountries = [
    'ghana', 'south africa', 'uganda', 'zimbabwe', 'rwanda', 'morocco', 'kenya', 'mauritius',
    'egypt', 'seychelles', 'tanzania', 'ethiopia', 'nigeria', 'algeria', 'tunisia', 'libya',
    'sudan', 'senegal', 'ivory coast', 'cameroon', 'angola', 'mozambique', 'madagascar',
    'botswana', 'namibia', 'zambia', 'malawi','SA','TZ','SE','MA','RW','KE','EG'
  ]
  
  // Europe
  const europeCountries = [
    'netherlands', 'spain', 'uk', 'united kingdom', 'germany', 'switzerland', 'turkey', 'italy',
    'france', 'czech republic', 'austria', 'greece', 'azerbaijan', 'portugal', 'belgium', 'poland',
    'sweden', 'norway', 'denmark', 'finland', 'ireland', 'romania', 'hungary', 'slovakia',
    'croatia', 'serbia', 'bulgaria', 'ukraine', 'russia','SP','CH','TR','PT','IT'
  ]
  
  // North America
  const northAmericaCountries = [
    'usa', 'united states', 'united states of america', 'canada', 'mexico', 'costa rica',
    'panama', 'jamaica', 'cuba','US'
  ]
  
  // South America
  const southAmericaCountries = [
    'brazil', 'argentina', 'chile', 'colombia', 'peru', 'ecuador', 'venezuela', 'uruguay',
    'paraguay', 'bolivia',
  ]
  
  // Oceania
  const oceaniaCountries = [
    'australia', 'new zealand', 'fiji', 'papua new guinea'
  ]
  
  if (asiaCountries.some(c => normalizedCountry.includes(c) || c.includes(normalizedCountry))) {
    return 'Asia'
  }
  if (africaCountries.some(c => normalizedCountry.includes(c) || c.includes(normalizedCountry))) {
    return 'Africa'
  }
  if (europeCountries.some(c => normalizedCountry.includes(c) || c.includes(normalizedCountry))) {
    return 'Europe'
  }
  if (northAmericaCountries.some(c => normalizedCountry.includes(c) || c.includes(normalizedCountry))) {
    return 'North America'
  }
  if (southAmericaCountries.some(c => normalizedCountry.includes(c) || c.includes(normalizedCountry))) {
    return 'South America'
  }
  if (oceaniaCountries.some(c => normalizedCountry.includes(c) || c.includes(normalizedCountry))) {
    return 'Oceania'
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
      const continent = getContinent(venue.country)
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
                    const countryCode = getCountryCode(venue.country)
                    const flagUrl = getFlagImageUrl(countryCode)
                    const venueDisplay = venue.name || `${venue.city}, ${venue.country}`
                    return (
                      <div
                        key={venue.id}
                        onClick={() => router.push(`/courses/venue/${encodeURIComponent(venueDisplay)}`)}
                        className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm border-2 border-slate-200 flex items-center justify-center shrink-0 group-hover:border-blue-400 transition-colors overflow-hidden">
                          <Image
                            src={flagUrl}
                            alt={`${venue.country} flag`}
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

