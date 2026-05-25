// Page component for viewing corporate company details
// Last updated: 2025-06-25 06:07:25 by vikramNplus
/* eslint-disable @typescript-eslint/no-unused-vars */


import { notFound } from 'next/navigation'

import { getByCompanyId } from '@apis/company'
import { fetchActiveCountry } from '@apis/country'
import { fetchActiveLanguage } from '@apis/language'
import { fetchZone } from '@apis/zone'
import { fetchCompanySubScription } from '@apis/companySubscription'
import CompanyDetailsView from '@views/apps/taxi/corporatecompany/view/CompanyDetailsView'
import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'

// Define interfaces for API data
interface Country {
  id: string;
  name: string;
  [key: string]: any;
}

interface Language {
  id: string;
  name: string;
  [key: string]: any;
}

interface Zone {
  _id: string;
  zoneName: string;
  [key: string]: any;
}

interface Subscription {
  id: string;
  name: string;
  amount: string;
  validityPeriod: string;
  unit: string;
  noOfDrivers: string;
  noOfUsers: string;
  [key: string]: any;
}

// Metadata for the page
export async function generateMetadata({ params }: { params: { id: string; lang: Locale } }) {
  
  return {
    title: 'View Corporate Company'
  }
}

// Main page component
export default async function CorporateCompanyDetailsPage({ 
  params 
}: { 
  params: { id: string; lang: Locale } 
}) {
  const dictionary = await getDictionary(params.lang)
  const companyId = params.id
  
  try {
    // Fetch company details and related data in parallel
    const [companyData, countries, languages, zones, subscriptions] = await Promise.all([
      getByCompanyId(companyId),
      fetchActiveCountry(),
      fetchActiveLanguage(),
      fetchZone(),
      fetchCompanySubScription()
    ])
    
    // Debugging - remove this after fixing
    
    // Check if company data exists
    if (!companyData) {
      
      console.error('Company data not found', { companyId });
      
      return notFound();
    }
    
    // Create lookup maps for related data
    
    const countryMap = (countries as Country[]).reduce<Record<string, string>>((acc, country) => {
      acc[country.id] = country.name;
    
      return acc;
    }, {});
    
    const languageMap = (languages as Language[]).reduce<Record<string, string>>((acc, language) => {
      
      acc[language.id] = language.name;
      
      return acc;
    }, {});
    
    const zoneMap = (zones as Zone[]).reduce<Record<string, string>>((acc, zone) => {
      acc[zone._id] = zone.zoneName;
     
      return acc;
    }, {});
    
    const subscriptionMap = (subscriptions as Subscription[]).reduce<Record<string, Subscription>>((acc, sub) => {
      acc[sub.id] = sub;
     
      return acc;
    }, {});
    
    // Return the client component with all necessary props
    return (
      <CompanyDetailsView 
        companyData={companyData} 
        dictionary={dictionary}
        lookupData={{
          countries: countryMap,
          languages: languageMap,
          zones: zoneMap,
          subscriptions: subscriptionMap
        }}
      />
    )
  } catch (error) {
    
    console.error('Error fetching company details:', error);
   
    return notFound();
  }
}