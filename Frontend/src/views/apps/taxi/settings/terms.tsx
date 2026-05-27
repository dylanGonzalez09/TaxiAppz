/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Alert, Button, Card, CardContent, CardHeader, Grid, Tabs, Tab } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

import { toast } from 'react-toastify'

import { createSetting, getSettingById, updateSetting } from '@/app/api/apps/taxi/setting'

const normalizeLangId = (id: unknown) => (id == null ? '' : String(id))

const findSettingByName = (list: any[], name: string) => {
  const matches = list.filter(s => s.name === name)

  if (matches.length <= 1) return matches[0]

  return matches.sort(
    (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  )[0]
}

const TermsTable = ({
  translationData,
  currentTab,
  activeLanguage,
  settingsData: initialSettingsData,
  dictionary,
  langId,
  clientId
}: {
  translationData: any[]
  currentTab: any
  activeLanguage: any
  settingsData: any[]
  dictionary: any
  langId: string
  clientId?: string
}) => {
  const router = useRouter()
  const routeParams = useParams()

  const effectiveClientId = useMemo(() => {
    if (typeof clientId === 'string' && /^[a-f\d]{24}$/i.test(clientId)) {
      return clientId
    }

    const rid = routeParams?.id

    if (typeof rid === 'string' && /^[a-f\d]{24}$/i.test(rid)) {
      return rid
    }

    if (Array.isArray(rid) && typeof rid[0] === 'string') {
      return rid[0]
    }

    
return ''
  }, [clientId, routeParams])

  const [termsSettings, setTermsSettings] = useState<any[]>(initialSettingsData || [])

  useEffect(() => {
    setTermsSettings(initialSettingsData || [])
  }, [initialSettingsData])

  const languages = useMemo(
    () =>
      ((activeLanguage as { id: string; code: string; name: string }[]) || []).map(lang => ({
        ...lang,
        id: normalizeLangId(lang.id)
      })),
    [activeLanguage]
  )

  const englishLanguageId = useMemo(() => {
    const english = languages.find(
      lang => lang.code?.toLowerCase() === 'en' || lang.name?.toLowerCase() === 'english'
    )

    return english?.id ?? normalizeLangId(langId)
  }, [languages, langId])

  const [currentLanguage, setCurrentLanguage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEnglishTab = currentLanguage === englishLanguageId

  const currentLangName = languages.find(l => l.id === currentLanguage)?.name ?? 'this language'

  const getContentForLanguage = useCallback(
    (langIdToLoad: string, source: any[] = termsSettings) => {
      const lid = normalizeLangId(langIdToLoad)
      const termsConditionSetting = findSettingByName(source, `termsCondition_${lid}`)
      const privacyPolicySetting = findSettingByName(source, `privacyPolicy_${lid}`)

      return {
        termsCondition: termsConditionSetting?.value ?? '',
        privacyPolicy: privacyPolicySetting?.value ?? ''
      }
    },
    [termsSettings]
  )

  const reloadTermsSettings = useCallback(async () => {
    if (!effectiveClientId) return
    const response = await getSettingById(effectiveClientId)
    const termsGroup = response?.find((item: { _id: string }) => item._id === 'terms')

    if (termsGroup?.settings) {
      setTermsSettings(termsGroup.settings)
    }
  }, [effectiveClientId])

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      termsCondition: '',
      privacyPolicy: ''
    }
  })

  useEffect(() => {
    if (englishLanguageId && !currentLanguage) {
      setCurrentLanguage(englishLanguageId)
    }
  }, [englishLanguageId, currentLanguage])

  useEffect(() => {
    if (!currentLanguage) return
    reset(getContentForLanguage(currentLanguage))
  }, [currentLanguage, termsSettings, getContentForLanguage, reset])

  const handleLanguageTabChange = (_: React.SyntheticEvent, newLanguage: string) => {
    const lid = normalizeLangId(newLanguage)

    setCurrentLanguage(lid)
    reset(getContentForLanguage(lid))
  }

  const onSubmit = async (data: any) => {
    const lid = normalizeLangId(currentLanguage)
    const termsKey = `termsCondition_${lid}`
    const privacyKey = `privacyPolicy_${lid}`

    const existingTerms = findSettingByName(termsSettings, termsKey)
    const existingPrivacy = findSettingByName(termsSettings, privacyKey)

    const formData = new FormData()

    formData.append('type', 'terms')
    formData.append(`termsCondition_${lid}`, data.termsCondition)
    formData.append(`privacyPolicy_${lid}`, data.privacyPolicy)

    const isUpdate = !!existingTerms || !!existingPrivacy

    setIsSubmitting(true)

    try {
      const result = isUpdate ? await updateSetting(formData) : await createSetting(formData)

      if (!result) {
        toast.error(dictionary['navigation']?.FailedToSave || 'Failed to save. Please try again.')

        return
      }

      await reloadTermsSettings()
      router.refresh()
      reset(getContentForLanguage(currentLanguage))

      toast.success(
        isUpdate
          ? dictionary['navigation'].SettingTermsandConditionupdatedsuccessfully
          : dictionary['navigation'].SettingTermsandConditionAddedsuccessfully
      )

      if (!isEnglishTab) {
        toast.info(`${currentLangName} updated — other languages were not changed.`)
      }
    } catch {
      toast.error(dictionary['navigation']?.FailedToSave || 'Failed to save. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const localizedContent = getContentForLanguage(currentLanguage)
  const hasLocalizedContent = !isEnglishTab && Boolean(localizedContent.termsCondition.trim())

  const looksLikeEnglishOnNonEnglishTab =
    !isEnglishTab &&
    hasLocalizedContent &&
    englishLanguageId &&
    localizedContent.termsCondition.trim() === getContentForLanguage(englishLanguageId).termsCondition.trim()

  return (
    <Card>
      <Tabs value={currentLanguage} onChange={handleLanguageTabChange} variant='fullWidth'>
        {languages.map(lang => (
          <Tab key={lang.id} label={lang.name} value={lang.id} />
        ))}
      </Tabs>
      <CardHeader title={dictionary['navigation'].TermsAndCondition} />
      <CardContent>
        {isEnglishTab ? (
          <Alert severity='info' sx={{ mb: 2 }}>
            {dictionary['navigation'].EnglishTermsAndConditionInfo}
          </Alert>
        ) : (
          <Alert severity='info' sx={{ mb: 2 }}>
            {dictionary['navigation'].Edit } {currentLangName} {dictionary['navigation'].EnglishTermsAndConditionEditInfo}
          </Alert>
        )}
        {!isEnglishTab && !hasLocalizedContent && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            {dictionary['navigation'].Notranslationyetfor} {currentLangName}. {dictionary['navigation'].TermsAndConditionEditWarning}
          </Alert>
        )}
        {looksLikeEnglishOnNonEnglishTab && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            {dictionary['navigation'].looksLikeEnglishOnNonEnglishTab}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name='termsCondition'
                control={control}
                rules={{ required: dictionary['navigation'].Termsandconditionisrequired }}
                render={({ field }) => (
                  <>
                    <ReactQuill
                      key={`terms-${currentLanguage}`}
                      value={field.value ?? ''}
                      onChange={value => field.onChange(value)}
                      theme='snow'
                      placeholder={dictionary['navigation'].Addyourtermsandconditionhere}
                    />
                    {errors.termsCondition && <p style={{ color: 'red' }}>{errors.termsCondition.message}</p>}
                  </>
                )}
              />
            </Grid>

            <CardHeader title={dictionary['navigation'].PrivacyPolicy || 'Privacy Policy'} />

            <Grid item xs={12}>
              <Controller
                name='privacyPolicy'
                control={control}
                rules={{ required: 'Privacy Policy is required' }}
                render={({ field }) => (
                  <>
                    <ReactQuill
                      key={`privacy-${currentLanguage}`}
                      value={field.value ?? ''}
                      onChange={value => field.onChange(value)}
                      theme='snow'
                      placeholder='Add your Privacy Policy'
                    />
                    {errors.privacyPolicy && <p style={{ color: 'red' }}>{errors.privacyPolicy.message}</p>}
                  </>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? isEnglishTab
                    ? `${dictionary['navigation'].SavingAndTranslating}`
                    : `${dictionary['navigation'].Saving}`
                  : isEnglishTab
                    ? `${dictionary['navigation'].SubmitSyncAllLanguages}`
                    : `${dictionary['navigation'].Submit} (${currentLangName} ) ${dictionary['navigation'].Only}`}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default TermsTable
