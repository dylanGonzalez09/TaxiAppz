
/* eslint-disable @typescript-eslint/no-unused-vars */

// const BASE_URL = process.env.NODE_ENV === 'production'
//   ? 'https://backend.taxiappz.com/v1'
//   : 'https://backend.taxiappz.com/v1';

// const BASE_IMAGE_URL = process.env.NODE_ENV === 'production'
//   ? 'https://backend.taxiappz.com'
//   : 'https://backend.taxiappz.com';




const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'http://localhost:7001/v1'
  : 'http://localhost:7001/v1';

const BASE_IMAGE_URL = process.env.NODE_ENV === 'production'
  ? 'http://localhost:7001'
  : 'http://localhost:7001';




const ENDPOINTS = {
  roles: {
    list: `${BASE_URL}/roles/getRole/list`,
    create: `${BASE_URL}/roles/create`,
    update: (id: string) => `${BASE_URL}/roles/updateRoles/${id}`,
    getById: (id: string) => `${BASE_URL}/roles/getRoles/${id}`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/roles/getRolesWithPagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    getBySearch: (searchTerm: string) => `${BASE_URL}/roles/getRoles?sortBy=${searchTerm}`,
    deleteById: (id: string) => `${BASE_URL}/roles/deleteRoles/${id}`
  },
  permission: {
    list: `${BASE_URL}/permission/getPermission/list`,
    create: `${BASE_URL}/permission/create`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/permission/getPermissionsWithPagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/permission/updatePermissions/${id}`,
    getById: (id: string) => `${BASE_URL}/permission/getPermissions/${id}`,
    deleteById: (id: string) => `${BASE_URL}/permission/deletePermissions/${id}`
  },
  privillege: {
    listName: (id: string) => `${BASE_URL}/privillege/getPrivillegeWithRoleName/${id}`,
    list: (id: string) => `${BASE_URL}/privillege/getPrivillegeWithRole/${id}`,
    update: (id: string) => `${BASE_URL}/privillege/giveprivillege/${id}`
  },
  version: {
    list: `${BASE_URL}/version/getVersion/list`,
    create: `${BASE_URL}/version/create`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/version/getVersionsWithPagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/version/updateVersion/${id}`,
    getById: (id: string) => `${BASE_URL}/version/getVersions/${id}`,
    getBycode: (code: string) => `${BASE_URL}/version/getVersionCode/${code}`,
    deleteById: (id: string) => `${BASE_URL}/version/deleteVersions/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/version/updateVersionStatus/${id}`
  },
  wallet: {
    list: `${BASE_URL}/wallet/getWallet/list`,
    create: `${BASE_URL}/wallet/create`,
    getWalletUserByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/wallet/getWalletUsers?search=${searchTerm}&page=${page}&limit=${limit}`,
    getTransactionById: (id: string) => `${BASE_URL}/wallet/getWalletTransaction/${id}`,
  },

  language: {
    list: `${BASE_URL}/language/getLanguage/list`,
    activeListAll: `${BASE_URL}/language/getLanguage/active/list`,
    introListAll: `${BASE_URL}/language/getLanguage/intro/list`,
    create: `${BASE_URL}/language/create`,
    getByPagination: (searchTerm: string, page: number, limit: number, id: string) => `${BASE_URL}/language/getLanguageWithPagination/${id}?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/language/updateLanguages/${id}`,
    getById: (id: string) => `${BASE_URL}/language/getLanguages/${id}`,
    getBycode: (code: string) => `${BASE_URL}/language/get/${code}`,
    deleteById: (id: string) => `${BASE_URL}/language/deleteLanguages/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/language/updatelanguageStatus/${id}`
  },
  country: {
    list: `${BASE_URL}/country/getCountry/list`,
    activeList: `${BASE_URL}/country/getCountry/active/list`,
    create: `${BASE_URL}/country/create`,
    getByPagination: (searchTerm: string, page: number, limit: number, id: string,) => `${BASE_URL}/country/getCountryWithPagination/${id}?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/country/updateCountry/${id}`,
    getById: (id: string) => `${BASE_URL}/country/getLanguages/${id}`,
    deleteById: (id: string) => `${BASE_URL}/country/deleteCountry/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/country/updateCountryStatus/${id}`,
    getCountries: `${BASE_URL}/country/getCountries`,
  },
  user: {
    list: `${BASE_URL}/user/getAllUser`,
    userList: `${BASE_URL}/user/web/getAllUser`,
    create: `${BASE_URL}/user/manageUsers`,
    getByEmail: `${BASE_URL}/user/getUserByEmailDetails`,
    getAllAdmin: `${BASE_URL}/users/allAdmin`,
    getByUserDetails: (id: string) => `${BASE_URL}/users/getUserProfileDetails/${id}`,
    getDashboardCount: `${BASE_URL}/users/getDashboardCount`,
    getUserByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/user/getAllUsers?search=${searchTerm}&page=${page}&limit=${limit}`,
    getAdminByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/user/getAllAdmin?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/user/manageUsers/${id}`,
    updateProfile: (id: string) => `${BASE_URL}/user/updateProfile/${id}`,
    updatePassword: (id: string) => `${BASE_URL}/user/updatePassword/${id}`,
    getById: (id: string) => `${BASE_URL}/user/getUsers/${id}`,
    deleteById: (id: string) => `${BASE_URL}/user/manageUsers/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/user/active-status/${id}`,
    dropDownList: (id: string) => `${BASE_URL}/admin/getDropDown/list/${id}`,
    getLogisticalCounts: `${BASE_URL}/users/getLogisticalCounts`,
  },
  auth: {
    register: `${BASE_URL}/auth/register`,
    login: `${BASE_URL}/auth/login`,
    forgetpassword: `${BASE_URL}/auth/forgot-password`,
    resetpassword: `${BASE_URL}/auth/reset-password`
  },
  translation: {
    create: `${BASE_URL}/translation/create`,
    list: `${BASE_URL}/translation/get`,
    mobilelist: `${BASE_URL}/translation/mobile/get`,
    activeList: `${BASE_URL}/translation/`,
    getlanguage: `${BASE_URL}/translation/getlanguage`,
    deleteByKey: (key: string) => `${BASE_URL}/translation/delete/${key}`
  },
  profile: {
    list: `${BASE_URL}/users/getUserByEmail`
  },
  company: {
    list: `${BASE_URL}/company/getCompany/details`,
    create: `${BASE_URL}/company/create`,
    update: (id: string) => `${BASE_URL}/company/updateCompanys/${id}`,
    getById: (id: string) => `${BASE_URL}/company/getCompanys/${id}`,
    getCompanyByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/company/getAllCompany/corporate?search=${searchTerm}&page=${page}&limit=${limit}`,
    getFleetByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/company/getAllCompany/fleet?search=${searchTerm}&page=${page}&limit=${limit}`,
    deleteById: (id: string) => `${BASE_URL}/company/deleteCompanys/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/company/updateActiveStatus/${id}`,
    dropDownList: (id: string) => `${BASE_URL}/company/getDropDown/list/${id}`,
  },
  category: {
    list: `${BASE_URL}/category/getCategory/list`,
    create: `${BASE_URL}/category/create`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/category/getCategorieswithPagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/category/updateCategories/${id}`,
    getById: (id: string) => `${BASE_URL}/category/getCategories/${id}`,
    deleteById: (id: string) => `${BASE_URL}/category/deleteCategories/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/category/updateStatus/${id}`
  },
  groupDocument: {
    list: `${BASE_URL}/groupDocument/getGroupDocument/list`,
    create: `${BASE_URL}/groupDocument/create`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/groupDocument/getGroupDocumentsWithPagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/groupDocument/updateGroupDocuments/${id}`,
    getById: (id: string) => `${BASE_URL}/groupDocument/getGroupDocuments/${id}`,
    deleteById: (id: string) => `${BASE_URL}/groupDocument/deleteGroupDocuments/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/groupDocument/updateGroupDocumentStatus/${id}`,

  },
  document: {
    list: `${BASE_URL}/document/getDocument/list`,
    create: `${BASE_URL}/document/creates`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/document/getDocumentsWithPagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/document/updateDocuments/${id}`,
    getById: (id: string) => `${BASE_URL}/document/getDocuments/${id}`,
    deleteById: (id: string) => `${BASE_URL}/document/deleteDocuments/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/document/updateDocumentStatus/${id}`
  },
  vehicle: {
    list: `${BASE_URL}/vehicle/getVehicle/list`,
    create: `${BASE_URL}/vehicle/create`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/vehicle/getVehiclesWithPagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/vehicle/updateVehicles/${id}`,
    getById: (id: string) => `${BASE_URL}/vehicle/getVehicles/${id}`,
    deleteById: (id: string) => `${BASE_URL}/vehicle/deleteVehicles/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/vehicle/updateVehicleStatus/${id}`,
    dropDownList: (id: string) => `${BASE_URL}/vehicle/getDropDown/list/${id}`
  },
  companyVehicle: {
    list: `${BASE_URL}/companyVehicle/getVehicle/list`,
    create: `${BASE_URL}/companyVehicle/create`,
    getByPagination: (searchTerm: string, page: number, limit: number) => 
      `${BASE_URL}/companyVehicle/getVehiclesWithPagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/companyVehicle/updateVehicles/${id}`,
    getById: (id: string) => `${BASE_URL}/companyVehicle/getVehicles/${id}`,
    deleteById: (id: string) => `${BASE_URL}/companyVehicle/deleteVehicles/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/companyVehicle/updateVehicleStatus/${id}`,
    dropDownList: (id: string) => `${BASE_URL}/companyVehicle/getDropDown/list/${id}`,
    getVehicleByZone: `${BASE_URL}/companyVehicle/getVehicleByZone`,
  },
  
  vehicleModel: {
    list: `${BASE_URL}/vehicleModel/getAllVehicleModel/list`,
    create: `${BASE_URL}/vehicleModel/create`,
    getByPagination: (id: string,searchTerm: string, page: number, limit: number) => `${BASE_URL}/vehicleModel/getVehicleModelsWithPagination/${id}?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/vehicleModel/updateVehicleModels/${id}`,
    getById: (id: string) => `${BASE_URL}/vehicleModel/getVehicleModels/${id}`,
    getByVehicleId: (id: string) => `${BASE_URL}/vehicleModel/getVehicleModel/${id}`,
    deleteById: (id: string) => `${BASE_URL}/vehicleModel/deleteVehicleModels/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/vehicleModel/updateVehicleModelStatus/${id}`,
    dropDownList: (id: string) => `${BASE_URL}/vehicleModel/getDropDown/list/${id}`

  },
  driver: {
    list: `${BASE_URL}/driver/getDriver/aggregation`,
    create: `${BASE_URL}/driver/create`,
    update: (id: string) => `${BASE_URL}/driver/updateDrivers/${id}`,
    getVehicleByZone: (id: string) => `${BASE_URL}/driver/getVehicle/${id}`,
    getByDriverDetails: (id: string) => `${BASE_URL}/driver/getDriverProfileDetails/${id}`,
    getDriverByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/driver/getDriver/aggregation?search=${searchTerm}&page=${page}&limit=${limit}`,
    getById: (id: string) => `${BASE_URL}/driver/getDrivers/${id}`,
    deleteById: (id: string) => `${BASE_URL}/driver/deleteDrivers/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/driver/updateActiveStatus/${id}`,
    dropDownList: (id: string) => `${BASE_URL}/driver/getDropDown/list/${id}`,
    getDriverWallet: `${BASE_URL}/driver/getDriverWalletReport`,
    getDriverReport: `${BASE_URL}/driver/getDriverReport`,
    getZones: `${BASE_URL}/driver/getZones`,
    getDriversByZone: (id:string,searchTerm: string, page: number, limit: number) => `${BASE_URL}/driver/getDriverByZone/${id}?search=${searchTerm}&page=${page}&limit=${limit}`,
  },
  dispatcher: {
    list: `${BASE_URL}/dispatcher/getDispatcher/list`,
    create: `${BASE_URL}/dispatcher/create`,
    update: (id: string) => `${BASE_URL}/dispatcher/update/${id}`,
    getDispatcherByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/dispatcher/getDispatcher/list?search=${searchTerm}&page=${page}&limit=${limit}`,
    getById: (id: string) => `${BASE_URL}/dispatcher/getDispatcher/${id}`,
    deleteById: (id: string) => `${BASE_URL}/dispatcher/delete/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/dispatcher/updateActiveStatus/${id}`,
    dropDownList: (id: string) => `${BASE_URL}/dispatcher/getDropDown/list/${id}`,
  },
  json: {
    create: `${BASE_URL}/json/create`
  },
  subScription: {
    list: `${BASE_URL}/subscription/listAll`,
    create: `${BASE_URL}/subscription/create`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/subscription/getSubScriptionsWithPagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/subscription/updateSubScription/${id}`,
    getById: (id: string) => `${BASE_URL}/subscription/getSubScription/${id}`,
    deleteById: (id: string) => `${BASE_URL}/subscription/deleteSubScription/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/subscription/updateSubScriptionStatus/${id}`
  },
  package: {
    list: `${BASE_URL}/package/listAll`,
    create: `${BASE_URL}/package/create`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/package/getSubScriptionsWithPagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/package/updateSubScription/${id}`,
    getById: (id: string) => `${BASE_URL}/package/getSubScription/${id}`,
    deleteById: (id: string) => `${BASE_URL}/package/deleteSubScription/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/package/updateSubScriptionStatus/${id}`
  },
  intro: {
    list: `${BASE_URL}/intro/getIntro/list`,
    create: `${BASE_URL}/intro/create`,
    update: (id: string) => `${BASE_URL}/intro/updateIntros/${id}`,
    getById: (id: string) => `${BASE_URL}/intro/getIntros/${id}`,
    deleteById: (id: string) => `${BASE_URL}/intro/deleteIntros/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/intro/updateIntroStatus/${id}`
  },
  client: {
    list: `${BASE_URL}/client/listAll`,
    create: `${BASE_URL}/client/create`,
    clientToken: `${BASE_URL}/clientToken/create`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/client/getClientsWithPagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/client/updateClient/${id}`,
    getById: (id: string) => `${BASE_URL}/client/getClient/${id}`,
    deleteById: (id: string) => `${BASE_URL}/client/deleteClient/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/client/updateClientStatus/${id}`,
    dropDownList: `${BASE_URL}/client/getDropDown/list`,
  },
  democlient: {
    list: `${BASE_URL}/democlient/listAll`,
    create: `${BASE_URL}/democlient/create`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/democlient/getClientsWithPagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/democlient/updateClient/${id}`,
    getById: (id: string) => `${BASE_URL}/democlient/getClient/${id}`,
    deleteById: (id: string) => `${BASE_URL}/democlient/deleteClient/${id}`,
    updateStatus: (id: any) => `${BASE_URL}/democlient/updateClientStatus/${id}`,
    dropDownList: `${BASE_URL}/democlient/getDropDown/list`,
  },
  cancellationReason: {
    list: `${BASE_URL}/cancellationReason/getCancellation/list`,
    create: `${BASE_URL}/cancellationReason/create`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/cancellationReason/getCancellationsWithPagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/cancellationReason/updateCancellations/${id}`,
    deleteById: (id: string) => `${BASE_URL}/cancellationReason/deleteCancellations/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/cancellationReason/updateCancellationStatus/${id}`,
    getCancellationByLanguage:(id:string,searchTerm: string, page: number, limit: number) => `${BASE_URL}/cancellationReason/getCancellationByLanguage/${id}?search=${searchTerm}&page=${page}&limit=${limit}`
  },
  outOfZone: {
    list: `${BASE_URL}/outOfZone/getOutOfZone/list`,
    create: `${BASE_URL}/outOfZone/create`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/outOfZone/outofzonewithpagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/outOfZone/updateOutOfZone/${id}`,
    deleteById: (id: string) => `${BASE_URL}/outOfZone/deleteOutOfZone/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/outOfZone/updateOutOfZoneStatus/${id}`
  },
  invoice: {
    list: `${BASE_URL}/invoiceQuestion/getInvoiceQuestions/list`,
    create: `${BASE_URL}/invoiceQuestion/create`,
    getQuestionsReport: `${BASE_URL}/invoiceQuestion/getQuestionsReport`,
    update: (id: string) => `${BASE_URL}/invoiceQuestion/updateInvoiceQuestions/${id}`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/invoiceQuestion/invoicewithpagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    getBySearch: (searchTerm: string) => `${BASE_URL}/invoiceQuestion/invoicewithpagination?search=${searchTerm}`,
    deleteById: (id: string) => `${BASE_URL}/invoiceQuestion/deleteInvoiceQuestions/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/invoiceQuestion/updateInvoiceQuestionsStatus/${id}`,
    getQuestionsDetails:(id: string) => `${BASE_URL}/invoiceQuestion/questionReportDetails/${id}`,
    getInvoiceByLanguage:(id:string,searchTerm: string, page: number, limit: number) => `${BASE_URL}/invoiceQuestion/getInvoiceByLanguage/${id}?search=${searchTerm}&page=${page}&limit=${limit}`
  },
  driverDocument: {
    list: (id: string,searchTerm: string, page: number, limit: number) => `${BASE_URL}/driverDocument/expired-documents/${id}?search=${searchTerm}&page=${page}&limit=${limit}`,
    getById: (id: string) => `${BASE_URL}/driverDocument/getDriverDocuments/${id}`,
    create: `${BASE_URL}/driverDocument/DriverDocument/create`,
    update: (id: string) => `${BASE_URL}/driverDocument/DriverDocument/update/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/driverDocument/updateDocumentStatus/${id}`
  },
  zone: {
    list: `${BASE_URL}/zone/getZone/list`,
    create: `${BASE_URL}/zone/createZone`,
    checkZone: `${BASE_URL}/zone/checkZone`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/zone/getZone?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/zone/updateZones/${id}`,
    getById: (id: string) => `${BASE_URL}/zone/getZones/${id}`,
    deleteById: (id: string) => `${BASE_URL}/zone/deleteZones/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/zone/updateZoneStatus/${id}`,
    dropDownList: (id: string) => `${BASE_URL}/zone/getDropDown/list/${id}`,
    primaryZoneList: `${BASE_URL}/zone/getPrimaryZone/list`,
  },
  zoneSurgePrice: {
    deleteById: (id: string) => `${BASE_URL}/zonesurgeprice/deleteZoneSurgePrice/${id}`,
  },
  setting: {
    list: `${BASE_URL}/setting/getSettings/list`,
    create: `${BASE_URL}/setting/bulkInsert`,
    update: `${BASE_URL}/setting/bulkUpdate`,
    getById: (id: string) => `${BASE_URL}/setting/getSetting/${id}`,
    deleteById: (id: string) => `${BASE_URL}/setting/deleteSetting/${id}`,
    getSettingById: (id: string) => `${BASE_URL}/setting/getSettings/${id}`,
    getDefaultLanguage: `${BASE_URL}/setting/getDefaultLanguage`,
  },
  promocode: {
    list: `${BASE_URL}/promocode/getPromoCode`,
    create: `${BASE_URL}/promocode/create`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/promocode/getPromoCodesWithPagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/promocode/updatePromoCodes/${id}`,
    getById: (id: string) => `${BASE_URL}/promocode/getPromoCodes/${id}`,
    deleteById: (id: string) => `${BASE_URL}/promocode/deletePromoCodes/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/promocode/updateVehicleStatus/${id}`,
    dropDownList: (id: string) => `${BASE_URL}/promocode/getDropDown/list/${id}`,
    promoDropDownList: (id: string) => `${BASE_URL}/promocode/getPromoDropDown/list/${id}`,
    getPromoUseReport:`${BASE_URL}/promocode/getPromoUseReport`,
    getExpiredPromo: `${BASE_URL}/promocode/expired-promo`,
  },

  request: {
    list: `${BASE_URL}/request/getRequest/list`,
    create: `${BASE_URL}/api/request/dispatcher`,
    eta: `${BASE_URL}/request/eta`,
    getByPagination: (searchTerm: string, page: number, limit: number, rideType: string, tripStatus: string) => `${BASE_URL}/request/getRequest/pagination?search=${searchTerm}&page=${page}&limit=${limit}&rideType=${rideType}&tripStatus=${tripStatus}`,
    update: (id: string) => `${BASE_URL}/request/updateRequest/${id}`,
    getById: (id: string) => `${BASE_URL}/request/getRequest/${id}`,
    deleteById: (id: string) => `${BASE_URL}/request/deleteRequest/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/request/updateVehicleStatus/${id}`,
    getByPhone: (phoneNumber: string) => `${BASE_URL}/request/getRequest/history/${phoneNumber}`,
    getByUserRequestTrips: (id: string) => `${BASE_URL}/request/getUserTrips/${id}`,
    getByDriverRequestTrips: (id: string) => `${BASE_URL}/request/getDriverRequestTrips/${id}`,
    getTripCount: `${BASE_URL}/request/getTripCount`,
    getLastTrips: `${BASE_URL}/request/getLastTrips`,
    getLogisticsEarnings: `${BASE_URL}/request/getLogisticsEarnings`,
    getTotalEarnings: `${BASE_URL}/request/getTotalEarnings`,
    getTripReports: `${BASE_URL}/request/getTripReports`,
    getTripsByDriver: `${BASE_URL}/request/getTripsByDriver`,
    getDriverSummary: `${BASE_URL}/request/getDriverSummaries`,
    getTripWiseReports: `${BASE_URL}/request/getTripWiseReports`,
    getCompletedLocalTrip:`${BASE_URL}/request/getCompletedLocalTrip`,
    getCompletedRentalTrip:`${BASE_URL}/request/getCompletedRentalTrip`,
    getInvoiceQuestionsReport: `${BASE_URL}/request/getInvoiceReport`,

    getRentalList:`${BASE_URL}/request/getRentalList`,
    getTodayEarnings: `${BASE_URL}/request/getTodayEarnings`,
    getTodayReport: `${BASE_URL}/request/getTodayReport`,
    getWeeklyReport: `${BASE_URL}/request/getWeeklyReport`,
    getMonthlyReport: `${BASE_URL}/request/getMonthlyReport`,
    getYearlyRevenue:`${BASE_URL}/request/getYearlyRevenue`,
    getTripsByUser: `${BASE_URL}/request/getTripsByUser`,
    getErrorLogs: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/request/getErrorLogs?search=${searchTerm}&page=${page}&limit=${limit}`,
    getOtpTable: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/request/getOtpTable?search=${searchTerm}&page=${page}&limit=${limit}`,

  },
  notification: {
    list: `${BASE_URL}/notification/getpagination/list`,
    create: `${BASE_URL}/notification/send`,
    user: `${BASE_URL}/notification/user`,
    driver: `${BASE_URL}/notification/driver`,
    deleteById: (id: string) => `${BASE_URL}/notification/deleteNotification/${id}`,
    dropDownList: (id: string) => `${BASE_URL}/notification/getDropDown/list/${id}`,

  },
  rental: {
    list: `${BASE_URL}/rental/getRental`,
    create: `${BASE_URL}/rental/create`,
    getByPagination: (id: string, searchTerm: string, page: number, limit: number) => `${BASE_URL}/rental/getRentalWithPagination/${id}?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/rental/updateRental/${id}`,
    getById: (id: string) => `${BASE_URL}/rental/getRental/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/rental/updateRentalStatus/${id}`,
    deleteById: (id: string) => `${BASE_URL}/rental/deleteRental/${id}`,
    dropDownList: (id: string) => `${BASE_URL}/rental/getDropDown/list/${id}`,
    getRentalCount: `${BASE_URL}/rental/getRentalCount`,
    getRentalZones: `${BASE_URL}/rental/getAllZones`,
    getRentalPackagesByZone:(id: string) => `${BASE_URL}/rental/getRentalPackagesByZone/${id}`
  },
  faq: {
    list: `${BASE_URL}/faq/getFaq`,
    create: `${BASE_URL}/faq/create`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/faq/getFaqWithPagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/faq/updateFaq/${id}`,
    getById: (id: string) => `${BASE_URL}/faq/getFaq/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/faq/updateFaqStatus/${id}`,
    deleteById: (id: string) => `${BASE_URL}/faq/deleteFaq/${id}`,
    dropDownList: (id: string) => `${BASE_URL}/faq/getDropDown/list/${id}`,
getFaqByLanguage: (id:string,searchTerm: string, page: number, limit: number) => `${BASE_URL}/faq/getFaqByLanguage/${id}?search=${searchTerm}&page=${page}&limit=${limit}`
  },
  ticket: {
    list: `${BASE_URL}/ticket/getTickets/list`,
    create: `${BASE_URL}/ticket/create`,
    getByPagination: (searchTerm: string, page: number, limit: number) => `${BASE_URL}/ticket/getTicketWithPagination?search=${searchTerm}&page=${page}&limit=${limit}`,
    update: (id: string) => `${BASE_URL}/ticket/updateTicket/${id}`,
    getById: (id: string) => `${BASE_URL}/ticket/getTicket/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/ticket/updateTicketStatus/${id}`,
    deleteById: (id: string) => `${BASE_URL}/ticket/deleteTicket/${id}`,
    groupTicketsByAdmin: `${BASE_URL}/ticket/adminGroupTicket`,
    assignAdminAndUpdateStatus: (id: string) => `${BASE_URL}/ticket/assignAdminAndUpdateStatus/${id}`
  },
  complaints:
  {
     list: `${BASE_URL}/complaints/getComplaints`,
    create: `${BASE_URL}/complaints/create`,
     update: (id: string) => `${BASE_URL}/complaints/updateComplaints/${id}`,
    getById: (id: string) => `${BASE_URL}/complaints/getComplaints/${id}`,
    updateStatus: (id: string) => `${BASE_URL}/complaints/updateComplaintsStatus/${id}`,
    deleteById: (id: string) => `${BASE_URL}/complaints/deleteComplaints/${id}`,
    getComplaintsByUser: (id: string) => `${BASE_URL}/api/complaint/getComplaintsByUser/${id}`,
    getByComplaintsByPagination: `${BASE_URL}/complaints/getComplaintswithpagination`,
    getComplaintsByLanguage: (id:string,searchTerm: string, page: number, limit: number) => `${BASE_URL}/complaints/getComplaintsByLanguage/${id}?search=${searchTerm}&page=${page}&limit=${limit}`


  },
  rating:
  {
    getRatingsByUser: (id: string) => `${BASE_URL}/api/rating/getUserRatings/${id}`
  },
  referral:
  {
    getStatsByUser:(id: string) => `${BASE_URL}/api/referral/getStatsData/${id}`,
        getReferralByUser: (id: string) => `${BASE_URL}/api/referral/getReferralData/${id}`
  },
  Reports: {
    topClient: (selectedPeriod: string) => `${BASE_URL}/dashboard/leaderboard/${selectedPeriod}`,

  },
  AccountDelete:{
    sendOtp: `${BASE_URL}/deleteAccount/sendOtp`,
    remove: `${BASE_URL}/deleteAccount/remove`,
  },
   Fine:{
    createFine: `${BASE_URL}/fine/create`,
    getFineWithPagination: (id: string) => `${BASE_URL}/fine/getFine/${id}`
  },
  Mqtt: {
    create: `${BASE_URL}/mqtt/web/publish`,
  },
}

export { BASE_URL, ENDPOINTS, BASE_IMAGE_URL }
