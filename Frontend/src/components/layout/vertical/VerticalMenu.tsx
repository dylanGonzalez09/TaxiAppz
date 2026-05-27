// Next Imports
import { useEffect, useState } from 'react'


import { useParams } from 'next/navigation'



// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { signOut } from 'next-auth/react'

import Skeleton from '@mui/material/Skeleton'

import { usePrivilegeStore } from '@/store/privilegeStore';

// Type Imports

import type { getDictionary } from '@/utils/getDictionary'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

import { SCREEN_NAMES, ROLE } from '@/utils/screenNames'


type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
  privillageData: any,
  session: any
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu, privillageData, session }: Props) => {

  // Hooks

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isClient, setIsClient] = useState(false)

  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const { isBreakpointReached } = useVerticalNav()
  const clientId = session?.user?.image?.clientId;
  const { loading } = usePrivilegeStore()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Vars
  const { transitionDuration } = verticalNavOptions
  const { lang: locale } = params as any
  const zoneIdFromRoute = (params as any)?.zoneId as string | undefined

  const zoneIdFromStorage =
    typeof window !== 'undefined' ? (localStorage.getItem('defaultZoneId') || undefined) : undefined

  const effectiveZoneId = zoneIdFromRoute || zoneIdFromStorage

  const hasZone = Boolean(effectiveZoneId)

  // For pages that can work even when no zone exists (common masters/config)
  const noZoneOkHref = (pathWithoutZone: string, pathAfterZone?: string) => {
    if (!hasZone) return `/${locale}${pathWithoutZone}`

return `/${locale}/${effectiveZoneId}${pathAfterZone ?? pathWithoutZone}`
  }

  // For pages that truly require a zone. When no zone, we will disable the menu item by omitting href + setting disabled.
  const zoneOnlyHref = (pathAfterZone: string) => {
    if (!hasZone) return undefined

return `/${locale}/${effectiveZoneId}${pathAfterZone}`
  }

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton width="80%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="60%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="90%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="80%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="60%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="90%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="80%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="60%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="90%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="80%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="60%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="90%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="80%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="60%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="90%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="80%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="60%" height={32} animation="wave" style={{ marginTop: 12 }} />
        <Skeleton width="90%" height={32} animation="wave" style={{ marginTop: 12 }} />

        {/* Add more Skeletons as needed for menu look */}
      </div>
    )
  }

  if (!privillageData || !Array.isArray(privillageData)) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isDemoUser')
    }

    signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL })

    return null
  }

  const normalizedPrivillageData = privillageData.map((privillage: string) => privillage.toLowerCase())

  return (
       <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => (
          <RenderExpandIcon open={open} transitionDuration={transitionDuration} />
        )}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {(normalizedPrivillageData.includes(SCREEN_NAMES.Dashboard)) && (
          <MenuItem
            href={zoneOnlyHref('/dashboards/client')}
            disabled={!hasZone}
            icon={<i className='tabler-layout-dashboard' />}
          >
            {dictionary['navigation'].dashboard || "dashboard"}
          </MenuItem>
        )}

        {(normalizedPrivillageData.includes(SCREEN_NAMES.Admin) || normalizedPrivillageData.includes(SCREEN_NAMES.User) || normalizedPrivillageData.includes(SCREEN_NAMES.Driver)) && (
          <MenuSection label={dictionary['navigation'].User}>

            {normalizedPrivillageData.includes(SCREEN_NAMES.Admin) && (
              <MenuItem
                href={zoneOnlyHref('/apps/taxi/admin/list')}
                disabled={!hasZone}
                icon={<i className='tabler-tower' />}

              >
                {dictionary['navigation'].adminManagement}
              </MenuItem>
            )}

            {normalizedPrivillageData.includes(SCREEN_NAMES.User) && (
              <MenuItem
                href={zoneOnlyHref('/apps/taxi/user/list')}
                disabled={!hasZone}
                icon={<i className='tabler-user' />}

              >
                {dictionary['navigation'].userManagement}
              </MenuItem>
            )}

            {normalizedPrivillageData.includes(SCREEN_NAMES.Driver) && (
              <MenuItem
                href={zoneOnlyHref('/apps/taxi/driver/list')}
                disabled={!hasZone}
                icon={<i className='tabler-steering-wheel' />}
              >
                {dictionary['navigation'].driverManagement}
              </MenuItem>

            )}

            {/* {normalizedPrivillageData.includes(SCREEN_NAMES.DemoClient) && ( */}
              {/* <MenuItem
                href={`/${locale}/${zoneId}/apps/taxi/demoClient/list`}
                icon={<i className='tabler-user' />}
                exactMatch={false}
                activeUrl={`/${locale}/${zoneId}/apps/taxi/demoClient/list`}
              >
                {dictionary['navigation'].DemoClient || "Demo Client"}
              </MenuItem> */}

            {/* )} */}

          </MenuSection>
        )}


        {(normalizedPrivillageData.includes(SCREEN_NAMES.Dispatcher)) && (
          <MenuSection label={dictionary['navigation'].createUser}>
            {(normalizedPrivillageData.includes(SCREEN_NAMES.Dispatcher)) && (
              <MenuItem
                href={zoneOnlyHref('/apps/taxi/dispatcher/createTrip')}
                disabled={!hasZone}
                icon={<i className='tabler-folder-share' />}>
                {dictionary['navigation'].Dispatch}
              </MenuItem>
            )}
          </MenuSection>
        )}

        {/* {(normalizedPrivillageData.includes(SCREEN_NAMES.Dispatcher) && session.user.image.role != ROLE.Dispatcher) && (
          <MenuItem href={`/${locale}/${zoneId}/apps/taxi/dispatcher/userCreate`}
            icon={<i className='tabler-user' />}>
            {dictionary['navigation'].createUser}
          </MenuItem>
        )} */}





        {(normalizedPrivillageData.includes(SCREEN_NAMES.Client) && session.user.image.role == ROLE.SuperAdmin) && (
          <MenuItem href={zoneOnlyHref('/apps/taxi/client/list')}
            disabled={!hasZone}
            icon={<i className='tabler-user' />}

          >
            {dictionary['navigation'].client}
          </MenuItem>
        )}

        {(normalizedPrivillageData.includes(SCREEN_NAMES.RentalList) || normalizedPrivillageData.includes(SCREEN_NAMES.Wallet) || normalizedPrivillageData.includes(SCREEN_NAMES.RideNow) || normalizedPrivillageData.includes(SCREEN_NAMES.RideLater)) && (
          <MenuSection label={dictionary['navigation'].requestList}>

            {normalizedPrivillageData.includes(SCREEN_NAMES.RentalList) && (
              <>
                <MenuItem
                  href={zoneOnlyHref('/apps/taxi/rental/rentallist')}
                  disabled={!hasZone}
                  icon={<i className='tabler-file-time' />}

                >
                  {dictionary['navigation'].rentalList}
                </MenuItem>

              </>
            )}

            {(normalizedPrivillageData.includes(SCREEN_NAMES.RideNow) || normalizedPrivillageData.includes(SCREEN_NAMES.RideLater)) && (
              <SubMenu
                label={dictionary['navigation'].tripList}
                icon={<i className='tabler-device-ipad-horizontal-question' />}
                disabled={!hasZone}
              >
                {normalizedPrivillageData.includes(SCREEN_NAMES.RideNow) && (
                  <MenuItem href={zoneOnlyHref('/apps/taxi/request/ridenow')} disabled={!hasZone}>
                    {dictionary['navigation'].rideNow}
                  </MenuItem>
                )}
                {normalizedPrivillageData.includes(SCREEN_NAMES.RideLater) && (
                  <MenuItem href={zoneOnlyHref('/apps/taxi/request/ridelater')} disabled={!hasZone}>
                    {dictionary['navigation'].rideLater}
                  </MenuItem>
                )}
              </SubMenu>
            )}

            {normalizedPrivillageData.includes(SCREEN_NAMES.Wallet) && (
              <SubMenu label={dictionary['navigation'].transaction} icon={<i className='tabler-credit-card-pay' />} disabled={!hasZone}>
                <MenuItem href={zoneOnlyHref('/apps/taxi/wallet/user/list')} disabled={!hasZone}>
                  {dictionary['navigation'].user}
                </MenuItem>
                <MenuItem href={zoneOnlyHref('/apps/taxi/wallet/driver/list')} disabled={!hasZone}>
                  {dictionary['navigation'].driver}
                </MenuItem>
              </SubMenu>
            )}

          </MenuSection>
        )}
        {(normalizedPrivillageData.includes(SCREEN_NAMES.RentalList) || normalizedPrivillageData.includes(SCREEN_NAMES.Admin)) && (
          <MenuSection label={dictionary['navigation'].pricing}>
            {/* zone */}

            {normalizedPrivillageData.includes(SCREEN_NAMES.Admin) && (
              <SubMenu label={dictionary['navigation'].zoneManagement} icon={<i className='tabler-timezone' />}>
                <MenuItem
                  href={hasZone ? zoneOnlyHref('/apps/taxi/zone/list') : `/${locale}/apps/taxi/zone/add`}
                >
                  {dictionary['navigation'].zone}
                </MenuItem>
                <MenuItem href={zoneOnlyHref('/apps/taxi/zone/outofzone')} disabled={!hasZone}>
                  {dictionary['navigation'].outOfZonePricing}
                </MenuItem>
              </SubMenu>
            )}
            {normalizedPrivillageData.includes(SCREEN_NAMES.RentalList) && (
              <MenuItem
                href={zoneOnlyHref('/apps/taxi/rentalmaster/rentalzonelist')}
                disabled={!hasZone}
                icon={<i className='tabler-clock-hour-3' />}

              >
                {dictionary['navigation'].rentalManagement}
              </MenuItem>
            )}
          </MenuSection>
        )}
        {(normalizedPrivillageData.includes(SCREEN_NAMES.GroupDocument) ||
          normalizedPrivillageData.includes(SCREEN_NAMES.Document) ||
          normalizedPrivillageData.includes(SCREEN_NAMES.Vehicle) ||
          normalizedPrivillageData.includes(SCREEN_NAMES.VehicleModel) ||
          (normalizedPrivillageData.includes(SCREEN_NAMES.Category) && session.user.image.role == ROLE.Dispatcher)
        ) && (
            <MenuSection label={dictionary['navigation'].Vehicle}>

              {/* category and vehicle and vehicle model */}
              {(normalizedPrivillageData.includes(SCREEN_NAMES.Category) || normalizedPrivillageData.includes(SCREEN_NAMES.Vehicle) || normalizedPrivillageData.includes(SCREEN_NAMES.VehicleModel)) && (
                <SubMenu label={dictionary['navigation'].vehicleMaster} icon={<i className='tabler-car-suv' />}>
                  {/* {normalizedPrivillageData.includes(SCREEN_NAMES.Category) && (
                    <MenuItem href={`/${locale}/${zoneId}/apps/taxi/master/category`}>
                      {dictionary['navigation'].category}
                    </MenuItem>
                  )} */}
                  {normalizedPrivillageData.includes(SCREEN_NAMES.Vehicle) && (
                    <MenuItem href={noZoneOkHref('/apps/taxi/master/vehicle', '/apps/taxi/master/vehicle')}>
                      {dictionary['navigation'].vehicle}
                    </MenuItem>
                  )}
                  {/*{normalizedPrivillageData.includes(SCREEN_NAMES.VehicleModel) && (
                    <MenuItem href={`/${locale}/${zoneId}/apps/taxi/master/vehicle-model`}>
                      {dictionary['navigation'].vehicleModel}
                    </MenuItem>
                  )}*/}
                </SubMenu>
              )}
              {/* document and groupDocument */}
              {(normalizedPrivillageData.includes(SCREEN_NAMES.GroupDocument) || normalizedPrivillageData.includes(SCREEN_NAMES.Document)) && (

                <SubMenu
                  label={dictionary['navigation'].documentMaster}
                  icon={<i className='tabler-clipboard-text' />}
                  disabled={!hasZone}
                >
                  {normalizedPrivillageData.includes(SCREEN_NAMES.GroupDocument) && (
                    <MenuItem href={zoneOnlyHref('/apps/taxi/master/group-document')} disabled={!hasZone}>
                      {dictionary['navigation'].groupDocument}
                    </MenuItem>
                  )}
                  {/* {normalizedPrivillageData.includes(SCREEN_NAMES.Document) && (
                    <MenuItem href={zoneOnlyHref('/apps/taxi/master/document')} disabled={!hasZone}>
                      {dictionary['navigation'].document}
                    </MenuItem>
                  )} */}
                  <MenuItem
                    href={zoneOnlyHref('/apps/taxi/driver/documentExpiry/zone')}
                    disabled={!hasZone}

                  >
                    {dictionary['navigation'].documentExpiry}
                  </MenuItem>
                </SubMenu>
              )}
            </MenuSection>
          )}
        {(normalizedPrivillageData.includes(SCREEN_NAMES.Subscription) ||
          normalizedPrivillageData.includes(SCREEN_NAMES.IntroScreen) ||
          normalizedPrivillageData.includes(SCREEN_NAMES.Language) ||
          normalizedPrivillageData.includes(SCREEN_NAMES.ProjectVersion) ||
          normalizedPrivillageData.includes(SCREEN_NAMES.Cancellation) ||
          normalizedPrivillageData.includes(SCREEN_NAMES.Faq) ||
          normalizedPrivillageData.includes(SCREEN_NAMES.Complaints)
        ) && (
            <MenuSection label={dictionary['navigation'].configuration}>
              {/* <SubMenu label={dictionary['navigation'].configuration} icon={<i className='tabler-basket-cog' />}> */}
              {/* {normalizedPrivillageData.includes(SCREEN_NAMES.SupScription) && (
                <MenuItem href={`/${locale}/${zoneId}/apps/taxi/subscription/list`}>
                  {dictionary['navigation'].subscription}
                </MenuItem>
              )} */}
              {/* Language-related Menu Items */}

              {normalizedPrivillageData.includes(SCREEN_NAMES.IntroScreen) && (
                <MenuItem href={zoneOnlyHref('/apps/taxi/introscreen')} disabled={!hasZone}
                  icon={<i className='tabler-clipboard-text' />}
                >
                  {dictionary['navigation'].introscreen}
                </MenuItem>
              )}
              {normalizedPrivillageData.includes(SCREEN_NAMES.Language) && session.user.image.role === ROLE.Client && (
                <>

                  <MenuItem
                    href={noZoneOkHref(`/apps/taxi/country/list/${clientId}`, `/apps/taxi/country/list/${clientId}`)}
                    icon={<i className='tabler-world' />}

                  >
                    {dictionary['navigation'].countryMaster}
                  </MenuItem>

                  <MenuItem
                    href={noZoneOkHref(`/apps/taxi/language/list/${clientId}`, `/apps/taxi/language/list/${clientId}`)}
                    icon={<i className='tabler-language' />}

                  >
                    {dictionary['navigation'].languageMaster}
                  </MenuItem>

                  {/* <MenuItem
                    href={`/${locale}/${zoneId}/apps/taxi/translation/list`}
                    icon={<i className='tabler-transaction-yen' />}
                    exactMatch={false}
                    activeUrl='/apps/taxi/translation/list'
                  >
                    {dictionary['navigation'].trabslation}
                  </MenuItem> */}

                </>
              )}
              {/* Other Menu Items */}
              {normalizedPrivillageData.includes(SCREEN_NAMES.ProjectVersion) && (
                <MenuItem
                  href={noZoneOkHref('/apps/taxi/version/list', '/apps/taxi/version/list')}
                  icon={<i className='tabler-versions' />}

                >
                  {dictionary['navigation'].projectVersion}
                </MenuItem>
              )}


              {normalizedPrivillageData.includes(SCREEN_NAMES.Cancellation) && (
                <MenuItem
                  href={zoneOnlyHref('/apps/taxi/cancellation/list')}
                  disabled={!hasZone}
                  icon={<i className='tabler-circle-letter-x' />}

                >
                  {dictionary['navigation'].cancellation}
                </MenuItem>
              )}

              {normalizedPrivillageData.includes(SCREEN_NAMES.Faq) && (
                <MenuItem
                  href={zoneOnlyHref('/apps/taxi/translationMaster/faq')}
                  disabled={!hasZone}
                  icon={<i className='tabler-help-hexagon' />}

                >
                  {dictionary['navigation'].faq}
                </MenuItem>
              )}

              {normalizedPrivillageData.includes(SCREEN_NAMES.Invoice) && (

                <MenuItem
                  href={zoneOnlyHref('/apps/taxi/translationMaster/invoice/list')}
                  disabled={!hasZone}
                  icon={<i className='tabler-file-invoice' />}

                >
                  {dictionary['navigation'].FeedBack}
                </MenuItem>
              )}

              <MenuItem
                href={noZoneOkHref('/apps/taxi/translationMaster/translation/list', '/apps/taxi/translationMaster/translation/list')}
                icon={<i className='tabler-transaction-yen' />}

              >
                {dictionary['navigation'].trabslation}

              </MenuItem>


            </MenuSection>
          )}
        {(normalizedPrivillageData.includes(SCREEN_NAMES.Ticket)) && (
          <MenuSection label={dictionary['navigation'].ticket}>

            <MenuItem
              href={zoneOnlyHref('/apps/taxi/translationMaster/complaints')}
              disabled={!hasZone}
              icon={<i className='tabler-message-circle' />}
            >
              {dictionary['navigation'].complaints}
            </MenuItem>

            {normalizedPrivillageData.includes(SCREEN_NAMES.Ticket) && (
              <MenuItem
                href={zoneOnlyHref('/apps/taxi/ticket')}
                disabled={!hasZone}
                icon={<i className='tabler-ticket' />}

              >
                {dictionary['navigation'].ticket}
              </MenuItem>
            )
            }


          </MenuSection>
        )}
        {(normalizedPrivillageData.includes(SCREEN_NAMES.Promo)) && (
          <MenuSection label={dictionary['navigation'].marketing}>

            {normalizedPrivillageData.includes(SCREEN_NAMES.Promo) && (
              <MenuItem
                href={zoneOnlyHref('/apps/taxi/promo')}
                disabled={!hasZone}
                icon={<i className='tabler-rosette-discount' />}

              >
                {dictionary['navigation'].PromoCode}
              </MenuItem>
            )}
            <MenuItem
              href={zoneOnlyHref('/apps/taxi/advertisement')}
              disabled={!hasZone}
              icon={<i className='tabler-rosette-discount' />}

            >
              {dictionary['navigation'].advertisement}
            </MenuItem>
            <SubMenu label={dictionary['navigation'].push} icon={<i className='tabler-cloud-up' />} disabled={!hasZone}>
              <MenuItem href={zoneOnlyHref(`/apps/taxi/notification/${clientId}`)} disabled={!hasZone}>
                {dictionary['navigation'].notification}
              </MenuItem>
              <MenuItem href={zoneOnlyHref('/apps/taxi/mail')} disabled={!hasZone}>
                {dictionary['navigation'].email}
              </MenuItem>
            </SubMenu>

          </MenuSection>
        )}


        {(
          normalizedPrivillageData.includes(SCREEN_NAMES.Roles) ||
          normalizedPrivillageData.includes(SCREEN_NAMES.Permission) ||
          normalizedPrivillageData.includes(SCREEN_NAMES.Privillage) ||
          normalizedPrivillageData.includes(SCREEN_NAMES.Language) ||
          normalizedPrivillageData.includes(SCREEN_NAMES.Country) ||
          normalizedPrivillageData.includes(SCREEN_NAMES.Translation) ||
          normalizedPrivillageData.includes(SCREEN_NAMES.ProjectVersion) ||
          normalizedPrivillageData.includes(SCREEN_NAMES.Invoice)


        ) && (
            (session.user.image.role === ROLE.Client || session.user.image.role === ROLE.Demo) && (
              <MenuSection label={dictionary['navigation'].others}>
                {(normalizedPrivillageData.includes(SCREEN_NAMES.Roles) ||
                  normalizedPrivillageData.includes(SCREEN_NAMES.Permission) ||
                  normalizedPrivillageData.includes(SCREEN_NAMES.Privillage)) && (
                    <SubMenu label={dictionary['navigation'].privilegeManagement} icon={<i className='tabler-stack-forward' />}>
                      {normalizedPrivillageData.includes(SCREEN_NAMES.Roles) && (
                        <MenuItem href={noZoneOkHref('/apps/taxi/role/list', '/apps/taxi/role/list')}>
                          {dictionary['navigation'].roles}
                        </MenuItem>
                      )}
                      {/* {normalizedPrivillageData.includes(SCREEN_NAMES.Permission) && (
                        <MenuItem href={`/${locale}/${zoneId}/apps/taxi/permission/list`}>
                          {dictionary['navigation'].permissions}
                        </MenuItem>
                      )} */}
                      {normalizedPrivillageData.includes(SCREEN_NAMES.Privillage) && (
                        <MenuItem href={noZoneOkHref('/apps/taxi/privillage', '/apps/taxi/privillage')}>
                          {dictionary['navigation'].privillege}
                        </MenuItem>
                      )}
                    </SubMenu>
                  )}

                {/* {normalizedPrivillageData.includes(SCREEN_NAMES.Invoice) && (

                  <MenuItem
                    href={`/${locale}/${zoneId}/apps/taxi/invoice/list`}
                    icon={<i className='tabler-file-invoice' />}
                    exactMatch={false}
                    activeUrl='/apps/taxi/invoice/list'
                  >
                    {dictionary['navigation'].invoice}
                  </MenuItem>
                )}  */}

                {/* {normalizedPrivillageData.includes(SCREEN_NAMES.Faq) && (
                  <MenuItem
                    href={`/${locale}/${zoneId}/apps/taxi/faq`}
                    icon={<i className='tabler-help-hexagon' />}
                    exactMatch={false}
                    activeUrl='/apps/taxi/faq'
                  >
                    {dictionary['navigation'].faq}
                  </MenuItem>
                )} */}


                {(normalizedPrivillageData.includes(SCREEN_NAMES.DriverSummary) ||
                  normalizedPrivillageData.includes(SCREEN_NAMES.CompletedLocalTrip) ||
                  normalizedPrivillageData.includes(SCREEN_NAMES.CompletedRentalTrip) ||
                  normalizedPrivillageData.includes(SCREEN_NAMES.DriverReports) ||
                  normalizedPrivillageData.includes(SCREEN_NAMES.TripReports) ||
                  normalizedPrivillageData.includes(SCREEN_NAMES.TripWiseReports) ||
                  normalizedPrivillageData.includes(SCREEN_NAMES.DriverWallet) ||
                  normalizedPrivillageData.includes(SCREEN_NAMES.InvoiceQuestion) ||
                  normalizedPrivillageData.includes(SCREEN_NAMES.PromoUseReports)
                ) && (
                    <SubMenu label={dictionary['navigation'].reports} icon={<i className='tabler-report' />} disabled={!hasZone}>

                      {normalizedPrivillageData.includes(SCREEN_NAMES.DriverSummary) && (
                        <MenuItem href={zoneOnlyHref('/apps/taxi/reports/driversummary')} disabled={!hasZone}>
                          {dictionary['navigation'].driverSummary}
                        </MenuItem>)}

                      {normalizedPrivillageData.includes(SCREEN_NAMES.CompletedLocalTrip) && (
                        <MenuItem href={zoneOnlyHref('/apps/taxi/reports/completedlocaltrip')} disabled={!hasZone}>
                          {dictionary['navigation'].completedLocalTrip}
                        </MenuItem>)}

                      {normalizedPrivillageData.includes(SCREEN_NAMES.CompletedRentalTrip) && (
                        <MenuItem href={zoneOnlyHref('/apps/taxi/reports/completedrentaltrip')} disabled={!hasZone}>
                          {dictionary['navigation'].completedRentalTrip}
                        </MenuItem>)}

                      {normalizedPrivillageData.includes(SCREEN_NAMES.DriverReports) && (
                        <MenuItem href={zoneOnlyHref('/apps/taxi/reports/driverreports')} disabled={!hasZone}>
                          {dictionary['navigation'].deriverReports}
                        </MenuItem>)}

                      {normalizedPrivillageData.includes(SCREEN_NAMES.TripReports) && (
                        <MenuItem href={zoneOnlyHref('/apps/taxi/reports/tripreports')} disabled={!hasZone}>
                          {dictionary['navigation'].tripReports}
                        </MenuItem>)}

                      {normalizedPrivillageData.includes(SCREEN_NAMES.TripWiseReports) && (
                        <MenuItem href={zoneOnlyHref('/apps/taxi/reports/tripwisereports')} disabled={!hasZone}>
                          {dictionary['navigation'].tripWiseReports}
                        </MenuItem>)}

                      {normalizedPrivillageData.includes(SCREEN_NAMES.DriverWallet) && (
                        <MenuItem href={zoneOnlyHref('/apps/taxi/reports/driverwallet')} disabled={!hasZone}>
                          {dictionary['navigation'].driverWallet}
                        </MenuItem>)}

                      {normalizedPrivillageData.includes(SCREEN_NAMES.InvoiceQuestion) && (
                        <MenuItem href={zoneOnlyHref('/apps/taxi/reports/invoicequestion')} disabled={!hasZone}>
                          {dictionary['navigation'].invoiceQuestion}
                        </MenuItem>)}

                      {normalizedPrivillageData.includes(SCREEN_NAMES.PromoUseReports) && (
                        <MenuItem href={zoneOnlyHref('/apps/taxi/reports/promoreports')} disabled={!hasZone}>
                          {dictionary['navigation'].promoUseReports}
                        </MenuItem>)}

                    </SubMenu>
                  )}
              </MenuSection>
            )
          )}








        {(normalizedPrivillageData.includes(SCREEN_NAMES.Settings)) && (

          <MenuItem
            href={noZoneOkHref(`/apps/taxi/settings/${clientId}`, `/apps/taxi/settings/${clientId}`)}
            icon={<i className='tabler-settings' />}
          >
            {dictionary['navigation'].setting}
          </MenuItem>
        )}

{/* 
        {(normalizedPrivillageData.includes(SCREEN_NAMES.Subscription)) && (

          <MenuItem href={zoneOnlyHref('/apps/taxi/subscription/list')}
            disabled={!hasZone}
            icon={<i className='tabler-creative-commons' />}

          >
            {dictionary['navigation'].subscription}
          </MenuItem>
        )} */}


        {/* <MenuItem href={`/${locale}/${zoneId}/apps/taxi/subscription/list`}
          icon={<i className='tabler-creative-commons' />}
          exactMatch={false}
          activeUrl='/apps/taxi/subscription/list'
        >
          {dictionary['navigation'].subscription}
        </MenuItem> */}
      </Menu>
    </ScrollWrapper>

  )
}

export default VerticalMenu
