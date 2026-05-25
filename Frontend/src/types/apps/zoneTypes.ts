export type UserRole = 'admin' | 'author' | 'editor' | 'maintainer' | 'subscriber'
export type UserStatus = 'true' | 'false' | 'inactive'

export type countryType = {
  id: string
  name: string
  dial_code: string
  currency_code: string
  currency_symbol: string
  status: boolean
};


export type ZoneType = {
  _id: number
  zoneName: string
  primaryZoneId: string
  country: string
  adminCommissionType: string
  adminCommission: string
  mapZone: [string]
  paymentTypes: [string]
  nonServiceZone?: string
  typesId: string
  zoneLevel: string
  status: boolean
  countrydetails: countryType
}



