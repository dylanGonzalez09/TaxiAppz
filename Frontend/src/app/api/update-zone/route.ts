// app/api/update-zone/route.ts (App Router format)

import {  NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/app/api/login/auth'

export async function POST(request: NextRequest) {
  try {
    
    const { zoneId } = await request.json()
    
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }


    // Here you would typically update the user's zone preference in your database
    // Example:
    // await updateUserZone(session.user.id, zoneId)

    return NextResponse.json({ 
      success: true, 
      message: 'Zone updated successfully',
      zoneId: zoneId
    })
  } catch (error) {
    
    return NextResponse.json(
      { message: 'Failed to update zone' }, 
      { status: 500 }
    )
  }
}

