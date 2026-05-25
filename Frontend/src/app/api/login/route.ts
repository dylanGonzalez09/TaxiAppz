// Next Imports
import { NextResponse } from 'next/server'

import axios from 'axios'

import { ENDPOINTS } from '../apps/taxi/endpoint'


export async function POST(req: Request) {
  // Vars
  const { email, password } = await req.json()

  try {
    const response = await axios.post(ENDPOINTS.auth.login, {
      email: email,
      password: password
    })

    const user = response.data.user
    const accessToken = response.data.tokens.access.token
    
    if (user) {
      return NextResponse.json({
        id: user.id,
        name: accessToken,
        email: user.email,
        image: {
          clientId: user.clientId,
          companyId: user.companyId ? user.companyId : null,
          firstName: user.firstName,
          phoneNumber: user.phoneNumber,
          role: user.roleIds[0].role
        },
        token: accessToken,
        
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        // We create an object here to separate each error message for each field in case of multiple errors
        message: ['Email or Password is invalid' + error]
      },
      {
        status: 401,
        statusText: 'Unauthorized Access'
      }
    )
  }
}
