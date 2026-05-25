// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import { signOut } from 'next-auth/react'

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
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const { isBreakpointReached } = useVerticalNav()
  const clientId = session?.user?.image?.clientId;

  // Vars
  const { transitionDuration } = verticalNavOptions
  const { lang: locale } = params
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar


  if (!privillageData || !Array.isArray(privillageData)) {
    localStorage.removeItem('isDemoUser')
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
     {normalizedPrivillageData.includes(SCREEN_NAMES.Dashboard) && (
        <MenuItem
          href={`/${locale}/dashboards/client`}
          icon={<i className='tabler-layout-dashboard' />}
          exactMatch={false}
          activeUrl='/dashboards/client'
        >
          {dictionary['navigation'].dashboard}
        </MenuItem>
        )} 

        {(normalizedPrivillageData.includes(SCREEN_NAMES.Admin) || normalizedPrivillageData.includes(SCREEN_NAMES.User) || normalizedPrivillageData.includes(SCREEN_NAMES.Driver)) && (
          <MenuSection label={dictionary['navigation'].User}>

            {normalizedPrivillageData.includes(SCREEN_NAMES.Admin) && (
              <MenuItem
                href={`/${locale}/apps/taxi/admin/list`}
                icon={<i className='tabler-tower' />}
                exactMatch={false}
                activeUrl='/apps/taxi/admin/list'
              >
                {dictionary['navigation'].adminManagement}
              </MenuItem>
            )}

            {normalizedPrivillageData.includes(SCREEN_NAMES.User) && (
              <MenuItem
                href={`/${locale}/apps/taxi/user/list`}
                icon={<i className='tabler-user' />}
                exactMatch={false}
                activeUrl={[
                  `/apps/taxi/user/list`,
                  `/apps/taxi/user/view`,
                ]}
              >
                {dictionary['navigation'].userManagement}
              </MenuItem>
            )}

            {normalizedPrivillageData.includes(SCREEN_NAMES.Driver) && (
              <MenuItem
                href={`/${locale}/apps/taxi/driver/list`}
                icon={<i className='tabler-steering-wheel' />}
                exactMatch={false}
                activeUrl={[`/apps/taxi/driver/list`, `/apps/taxi/driver/view`, `/apps/taxi/driver/document`]}
              >
                {dictionary['navigation'].driverManagement}
              </MenuItem>

            )}

          </MenuSection>
        )}
         {(normalizedPrivillageData.includes(SCREEN_NAMES.FleetManagement)) && (
          <MenuSection label={dictionary['navigation'].FleetManagement}>
            {/* Dispatcher */}
            {(normalizedPrivillageData.includes(SCREEN_NAMES.CorporateCompany)) && (
            <MenuItem
              href={`/${locale}/apps/taxi/corporatecompany`}
              icon={<i className='tabler-creative-commons' />}
              exactMatch={false}
              activeUrl='/apps/taxi/corporatecompany'
            >
              {dictionary['navigation'].CorporateCompany}
            </MenuItem>
            )}
          {normalizedPrivillageData.includes(SCREEN_NAMES.Company) && (
            <MenuItem
              href={`/${locale}/apps/taxi/company/list`}
              icon={<i className='tabler-creative-commons' />}
              exactMatch={false}
              activeUrl='/apps/taxi/company/list'
            >
              {dictionary['navigation'].companyMaster}
            </MenuItem>
          )}
          </MenuSection>
        )}
       {(normalizedPrivillageData.includes(SCREEN_NAMES.CompanyVehicle)) && (

           <MenuItem
              href={`/${locale}/apps/taxi/company/vehicle`}
              icon={<i className='tabler-creative-commons' />}
              exactMatch={false}
              activeUrl='/apps/taxi/company/vehicle'
            >
              {dictionary['navigation'].companyVehicle}
            </MenuItem>
         )}

        {(normalizedPrivillageData.includes(SCREEN_NAMES.Dispatcher)) && (
          <MenuSection label={dictionary['navigation'].createUser}>
            {/* Dispatcher */}
            {(normalizedPrivillageData.includes(SCREEN_NAMES.Dispatcher)) && (
              <MenuItem href={`/${locale}/apps/taxi/dispatcher/createTrip`}
                icon={<i className='tabler-folder-share' />}>
                {dictionary['navigation'].Dispatch}
              </MenuItem>
            )}
          </MenuSection>
        )}

        {/* {(normalizedPrivillageData.includes(SCREEN_NAMES.Dispatcher) && session.user.image.role != ROLE.Dispatcher) && (
          <MenuItem href={`/${locale}/apps/taxi/dispatcher/userCreate`}
            icon={<i className='tabler-user' />}>
            {dictionary['navigation'].createUser}
          </MenuItem>
        )} */}

  


  

{/*        
        {(normalizedPrivillageData.includes(SCREEN_NAMES.CompanySubsciption) && session.user.image.role == ROLE.SuperAdmin) && (
          <MenuItem
            href={`/${locale}/apps/taxi/package/list`}
            icon={<i className='tabler-creative-commons' />}
            exactMatch={false}
            activeUrl='/apps/taxi/package/list'
          >
            {dictionary['navigation'].package}
          </MenuItem>
        )} */}


        {(normalizedPrivillageData.includes(SCREEN_NAMES.Client) && session.user.image.role == ROLE.SuperAdmin) && (
          <MenuItem href={`/${locale}/apps/taxi/client/list`}
            icon={<i className='tabler-user' />}
            exactMatch={false}
            activeUrl='/apps/taxi/client/list'
          >
            {dictionary['navigation'].client}
          </MenuItem>
        )}

        {(normalizedPrivillageData.includes(SCREEN_NAMES.RentalList) || normalizedPrivillageData.includes(SCREEN_NAMES.Wallet) || normalizedPrivillageData.includes(SCREEN_NAMES.RideNow) || normalizedPrivillageData.includes(SCREEN_NAMES.RideLater)) && (
          <MenuSection label={dictionary['navigation'].requestList}>

            {/* {normalizedPrivillageData.includes(SCREEN_NAMES.RentalList) && (
              <>
                <MenuItem
                  href={`/${locale}/apps/taxi/rental/rentallist`}
                  icon={<i className='tabler-file-time' />}
                  exactMatch={false}
                  activeUrl='/apps/taxi/rental/rentallist'
                >
                  {dictionary['navigation'].rentalList}
                </MenuItem>

              </>
            )} */}

            {(normalizedPrivillageData.includes(SCREEN_NAMES.RideNow) || normalizedPrivillageData.includes(SCREEN_NAMES.RideLater)) && (
              <SubMenu label={dictionary['navigation'].tripList} icon={<i className='tabler-device-ipad-horizontal-question' />}>
                {normalizedPrivillageData.includes(SCREEN_NAMES.RideNow) && (
                  <MenuItem href={`/${locale}/apps/taxi/request/ridenow`}>
                    {dictionary['navigation'].rideNow}
                  </MenuItem>
                )}
                {normalizedPrivillageData.includes(SCREEN_NAMES.RideLater) && (
                  <MenuItem href={`/${locale}/apps/taxi/request/ridelater`}>
                    {dictionary['navigation'].rideLater}
                  </MenuItem>
                )}
              </SubMenu>
            )}

            {normalizedPrivillageData.includes(SCREEN_NAMES.Wallet) && (
              <SubMenu label={dictionary['navigation'].transaction} icon={<i className='tabler-credit-card-pay' />}>
                <MenuItem href={`/${locale}/apps/taxi/wallet/user/list`}>
                  {dictionary['navigation'].user}
                </MenuItem>
                <MenuItem href={`/${locale}/apps/taxi/wallet/driver/list`}>
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
                <MenuItem href={`/${locale}/apps/taxi/zone/list`}
                  exactMatch={false}
                  activeUrl={[
                    `/apps/taxi/zone/edit`,
                    `/apps/taxi/zone/list`,
                    `/apps/taxi/zone/view`,
                    `/apps/taxi/zone/add`,

                  ]}>
                  {dictionary['navigation'].zone}
                </MenuItem>
                <MenuItem href={`/${locale}/apps/taxi/zone/outofzone`}>
                  {dictionary['navigation'].outOfZonePricing}
                </MenuItem>
              </SubMenu>
            )}
            {normalizedPrivillageData.includes(SCREEN_NAMES.RentalList) && (
              <MenuItem
                href={`/${locale}/apps/taxi/rentalmaster/rentalzonelist`}
                icon={<i className='tabler-clock-hour-3' />}
                exactMatch={false}
                activeUrl='/apps/taxi/rentalmaster/rentalzonelist'
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
                    <MenuItem href={`/${locale}/apps/taxi/master/category`}>
                      {dictionary['navigation'].category}
                    </MenuItem>
                  )} */}
                  {normalizedPrivillageData.includes(SCREEN_NAMES.Vehicle) && (
                    <MenuItem href={`/${locale}/apps/taxi/master/vehicle`}>
                      {dictionary['navigation'].vehicle}
                    </MenuItem>
                  )}
                  {/*{normalizedPrivillageData.includes(SCREEN_NAMES.VehicleModel) && (
                    <MenuItem href={`/${locale}/apps/taxi/master/vehicle-model`}>
                      {dictionary['navigation'].vehicleModel}
                    </MenuItem>
                  )}*/}
                </SubMenu>
              )}
              {/* document and groupDocument */}
              {(normalizedPrivillageData.includes(SCREEN_NAMES.GroupDocument) || normalizedPrivillageData.includes(SCREEN_NAMES.Document)) && (

                <SubMenu label={dictionary['navigation'].documentMaster} icon={<i className='tabler-clipboard-text' />}>
                  {normalizedPrivillageData.includes(SCREEN_NAMES.GroupDocument) && (
                    <MenuItem href={`/${locale}/apps/taxi/master/group-document`}>
                      {dictionary['navigation'].groupDocument}
                    </MenuItem>
                  )}
                  {normalizedPrivillageData.includes(SCREEN_NAMES.Document) && (
                    <MenuItem href={`/${locale}/apps/taxi/master/document`}>
                      {dictionary['navigation'].document}
                    </MenuItem>
                  )}
                  <MenuItem
                    href={`/${locale}/apps/taxi/driver/documentExpiry/zone`}
                    exactMatch={false}
                    activeUrl='/apps/taxi/driver/documentExpiry/zone'
                  >
                    {dictionary['navigation'].documentExpiry}
                  </MenuItem>
                </SubMenu>
              )}
            </MenuSection>
          )}
        {(normalizedPrivillageData.includes(SCREEN_NAMES.SupScription) ||
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
                <MenuItem href={`/${locale}/apps/taxi/subscription/list`}>
                  {dictionary['navigation'].subscription}
                </MenuItem>
              )} */}
              {/* Language-related Menu Items */}

              {normalizedPrivillageData.includes(SCREEN_NAMES.IntroScreen) && (
                <MenuItem href={`/${locale}/apps/taxi/introscreen`}
                  icon={<i className='tabler-clipboard-text' />}
                >
                  {dictionary['navigation'].introscreen}
                </MenuItem>
              )}
              {normalizedPrivillageData.includes(SCREEN_NAMES.Language) && (
                <>

                  <MenuItem
                    href={`/${locale}/apps/taxi/country/list/${clientId}`}
                    icon={<i className='tabler-world' />}
                    exactMatch={false}
                    activeUrl='/apps/taxi/country/list'
                  >
                    {dictionary['navigation'].countryMaster}
                  </MenuItem>

                  <MenuItem
                    href={`/${locale}/apps/taxi/language/list/${clientId}`}
                    icon={<i className='tabler-language' />}
                    exactMatch={false}
                    activeUrl='/apps/taxi/language/list'
                  >
                    {dictionary['navigation'].languageMaster}
                  </MenuItem>

                  {/* <MenuItem
                    href={`/${locale}/apps/taxi/translation/list`}
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
                  href={`/${locale}/apps/taxi/version/list`}
                  icon={<i className='tabler-versions' />}
                  exactMatch={false}
                  activeUrl='/apps/taxi/version/list'
                >
                  {dictionary['navigation'].projectVersion}
                </MenuItem>
              )}


              {normalizedPrivillageData.includes(SCREEN_NAMES.Cancellation) && (
                <MenuItem
                  href={`/${locale}/apps/taxi/cancellation/list`}
                  icon={<i className='tabler-circle-letter-x' />}
                  exactMatch={false}
                  activeUrl='/apps/taxi/cancellation/list'
                >
                  {dictionary['navigation'].cancellation}
                </MenuItem>
              )}

              {normalizedPrivillageData.includes(SCREEN_NAMES.Faq) && (
                <MenuItem
                  href={`/${locale}/apps/taxi/translationMaster/faq`}
                  icon={<i className='tabler-help-hexagon' />}
                  exactMatch={false}
                  activeUrl='/apps/taxi/translationMaster/faq'
                >
                  {dictionary['navigation'].faq}
                </MenuItem>
              )}

              {normalizedPrivillageData.includes(SCREEN_NAMES.Invoice) && (

                <MenuItem
                  href={`/${locale}/apps/taxi/translationMaster/invoice/list`}
                  icon={<i className='tabler-file-invoice' />}
                  exactMatch={false}
                  activeUrl='/apps/taxi/translationMaster/invoice/list'
                >
                  {dictionary['navigation'].FeedBack}
                </MenuItem>
              )}

              <MenuItem
                href={`/${locale}/apps/taxi/translationMaster/translation/list`}
                icon={<i className='tabler-transaction-yen' />}
                exactMatch={false}
                activeUrl='/apps/taxi/translationMaster/translation/list'
              >
                {dictionary['navigation'].trabslation}

              </MenuItem>


            </MenuSection>
          )}
        {(normalizedPrivillageData.includes(SCREEN_NAMES.Ticket)) && (
          <MenuSection label={dictionary['navigation'].ticket}>

            <MenuItem href={`/${locale}/apps/taxi/translationMaster/complaints`}
              icon={<i className='tabler-message-circle' />}
            >
              {dictionary['navigation'].complaints}
            </MenuItem>

            {normalizedPrivillageData.includes(SCREEN_NAMES.Ticket) && (
              <MenuItem
                href={`/${locale}/apps/taxi/ticket`}
                icon={<i className='tabler-ticket' />}
                exactMatch={false}
                activeUrl='/apps/taxi/ticket'
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
                href={`/${locale}/apps/taxi/promo`}
                icon={<i className='tabler-rosette-discount' />}
                exactMatch={false}
                activeUrl='/apps/taxi/promo'
              >
                {dictionary['navigation'].PromoCode}
              </MenuItem>
            )}
            <SubMenu label={dictionary['navigation'].push} icon={<i className='tabler-cloud-up' />}>
              <MenuItem href={`/${locale}/apps/taxi/notification/${clientId}`}>
                {dictionary['navigation'].notification}
              </MenuItem>
              <MenuItem href={`/${locale}/apps/taxi/mail`}>
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
                        <MenuItem href={`/${locale}/apps/taxi/role/list`}>
                          {dictionary['navigation'].roles}
                        </MenuItem>
                      )}
                      {/* {normalizedPrivillageData.includes(SCREEN_NAMES.Permission) && (
                        <MenuItem href={`/${locale}/apps/taxi/permission/list`}>
                          {dictionary['navigation'].permissions}
                        </MenuItem>
                      )} */}
                      {normalizedPrivillageData.includes(SCREEN_NAMES.Privillage) && (
                        <MenuItem href={`/${locale}/apps/taxi/privillage`}>
                          {dictionary['navigation'].privillege}
                        </MenuItem>
                      )}
                    </SubMenu>
                  )}

                {/* {normalizedPrivillageData.includes(SCREEN_NAMES.Invoice) && (

                  <MenuItem
                    href={`/${locale}/apps/taxi/invoice/list`}
                    icon={<i className='tabler-file-invoice' />}
                    exactMatch={false}
                    activeUrl='/apps/taxi/invoice/list'
                  >
                    {dictionary['navigation'].invoice}
                  </MenuItem>
                )}  */}

                {/* {normalizedPrivillageData.includes(SCREEN_NAMES.Faq) && (
                  <MenuItem
                    href={`/${locale}/apps/taxi/faq`}
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
                    <SubMenu label={dictionary['navigation'].reports} icon={<i className='tabler-report' />}>

                      {normalizedPrivillageData.includes(SCREEN_NAMES.DriverSummary) && (
                        <MenuItem href={`/${locale}/apps/taxi/reports/driversummary`}>
                          {dictionary['navigation'].driverSummary}
                        </MenuItem>)}

                      {normalizedPrivillageData.includes(SCREEN_NAMES.CompletedLocalTrip) && (
                        <MenuItem href={`/${locale}/apps/taxi/reports/completedlocaltrip`}>
                          {dictionary['navigation'].completedLocalTrip}
                        </MenuItem>)}

                      {normalizedPrivillageData.includes(SCREEN_NAMES.CompletedRentalTrip) && (
                        <MenuItem href={`/${locale}/apps/taxi/reports/completedrentaltrip`}>
                          {dictionary['navigation'].completedRentalTrip}
                        </MenuItem>)}

                      {normalizedPrivillageData.includes(SCREEN_NAMES.DriverReports) && (
                        <MenuItem href={`/${locale}/apps/taxi/reports/driverreports`}>
                          {dictionary['navigation'].deriverReports}
                        </MenuItem>)}

                      {normalizedPrivillageData.includes(SCREEN_NAMES.TripReports) && (
                        <MenuItem href={`/${locale}/apps/taxi/reports/tripreports`}>
                          {dictionary['navigation'].tripReports}
                        </MenuItem>)}

                      {normalizedPrivillageData.includes(SCREEN_NAMES.TripWiseReports) && (
                        <MenuItem href={`/${locale}/apps/taxi/reports/tripwisereports`}>
                          {dictionary['navigation'].tripWiseReports}
                        </MenuItem>)}

                      {normalizedPrivillageData.includes(SCREEN_NAMES.DriverWallet) && (
                        <MenuItem href={`/${locale}/apps/taxi/reports/driverwallet`}>
                          {dictionary['navigation'].driverWallet}
                        </MenuItem>)}
{/* 
                      {normalizedPrivillageData.includes(SCREEN_NAMES.InvoiceQuestion) && (
                        <MenuItem href={`/${locale}/apps/taxi/reports/invoicequestion`}>
                          {dictionary['navigation'].invoiceQuestion}
                        </MenuItem>)} */}

                      {normalizedPrivillageData.includes(SCREEN_NAMES.PromoUseReports) && (
                        <MenuItem href={`/${locale}/apps/taxi/reports/promoreports`}>
                          {dictionary['navigation'].promoUseReports}
                        </MenuItem>)}

                    </SubMenu>
                  )}
              </MenuSection>
            )
          )}







       {normalizedPrivillageData.includes(SCREEN_NAMES.Settings) && (


        <MenuItem href={`/${locale}/apps/taxi/settings/${clientId}`} icon={<i className='tabler-settings' />}>
          {dictionary['navigation'].setting}
        </MenuItem>
        )} 


      {normalizedPrivillageData.includes(SCREEN_NAMES.SupScription) || session.user.image.role != ROLE.Client || session.user.image.role != ROLE.Dispatcher && (
         
        <MenuItem href={`/${locale}/apps/taxi/subscription/list`}
          icon={<i className='tabler-creative-commons' />}
          exactMatch={false}
          activeUrl='/apps/taxi/subscription/list'
        >
          {dictionary['navigation'].subscription}
        </MenuItem>
        )} 


        {/* <MenuItem href={`/${locale}/apps/taxi/subscription/list`}
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
