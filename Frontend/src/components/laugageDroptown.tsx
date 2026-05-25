'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

// Config Imports

// Util Imports
import './laugageDroptown.css'

const LanguageDropdown = ({ lang }: { lang: any }) => {
  const router = useRouter()
  const [selectedLang, setSelectedLang] = useState<string>('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [Langage, setLangage] = useState<any>(lang)

  useEffect(() => {
    if (Langage && Langage.length > 0) {
      setSelectedLang(Langage[0].code); // Set to the first language as default
    }
  }, [Langage]);

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value

    setSelectedLang(newLang)
  }

  const handleSubmit = () => {

    // const redirectUrl = `/${selectedLang}/login?redirectTo=${pathname}`
    const login = `/${selectedLang}/login`

    // const homePage = getLocalizedUrl(themeConfig.homePageUrl, selectedLang)

    // if (pathname === login || pathname === homePage) {
    //     router.push(login)
    // } else {
    //     router.push(login)
    // }

    router.push(login)
  }

  return (
    <div className="container">
      <div className="dropdown-container">
        <select value={selectedLang} onChange={handleLanguageChange}>
          {Langage.map((langag: any) => (
            <option key={langag.code} value={langag.code}>
              {langag.name}
            </option>
          ))}
        </select>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  )
}

export default LanguageDropdown



