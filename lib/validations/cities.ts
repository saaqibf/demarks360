export const CALGARY_CITY = 'Calgary'

export const SERVICE_CITIES = [
  'Calgary',
  'Airdrie',
  'Cochrane',
  'Chestermere',
  'Okotoks',
  'Rocky View County',
] as const

export type ServiceCity = typeof SERVICE_CITIES[number]

export function isValidServiceCity(city: string): city is ServiceCity {
  return SERVICE_CITIES.includes(city as ServiceCity)
}

