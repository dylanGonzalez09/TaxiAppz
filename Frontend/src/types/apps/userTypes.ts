export type UserRole = 'admin' | 'author' | 'editor' | 'maintainer' | 'subscriber'
export type UserStatus = 'true' | 'false' | 'inactive'

export type UsersType = {
  id: number
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  Wallet: string
  Trip?: any
  role: string
  rating: string
  avatar?: string
  country: string
  language: string
  active: boolean
  employeeId?: string
}
