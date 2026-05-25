/* eslint-disable @typescript-eslint/no-unused-vars */
// Third-party Imports
import classnames from 'classnames'

// Type Imports

// Component Imports
import NavToggle from './NavToggle'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import SupademoButton from '@components/layout/shared/SupademoButton'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument'
import { fetchPromoExpiry } from '@/app/api/apps/taxi/promoCode'

// Vars
// const shortcuts: ShortcutsType[] = [
//   {
//     url: '/apps/calendar',
//     icon: 'tabler-calendar',
//     title: 'Calendar',
//     subtitle: 'Appointments'
//   },
//   {
//     url: '/apps/invoice/list',
//     icon: 'tabler-file-dollar',
//     title: 'Invoice App',
//     subtitle: 'Manage Accounts'
//   },
//   {
//     url: '/apps/user/list',
//     icon: 'tabler-user',
//     title: 'Users',
//     subtitle: 'Manage Users'
//   },
//   {
//     url: '/apps/roles',
//     icon: 'tabler-users-group',
//     title: 'Role Management',
//     subtitle: 'Permissions'
//   },
//   {
//     url: '/',
//     icon: 'tabler-device-desktop-analytics',
//     title: 'Dashboard',
//     subtitle: 'User Dashboard'
//   },
//   {
//     url: '/pages/account-settings',
//     icon: 'tabler-settings',
//     title: 'Settings',
//     subtitle: 'Account Settings'
//   }
// ]

// const notifications: NotificationsType[] = [
//   {
//     avatarImage: '/images/avatars/8.png',
//     title: 'Congratulations Flora 🎉',
//     subtitle: 'Won the monthly bestseller gold badge',
//     time: 'May 18, 8:26 AM',
//     read: false
//   },
//   {
//     title: 'Cecilia Becker',
//     avatarColor: 'secondary',
//     subtitle: 'Accepted your connection',
//     time: 'May 18, 8:26 AM',
//     read: false
//   },
//   {
//     avatarImage: '/images/avatars/3.png',
//     title: 'Bernard Woods',
//     subtitle: 'You have new message from Bernard Woods',
//     time: 'May 18, 8:26 AM',
//     read: true
//   },
//   {
//     avatarIcon: 'tabler-chart-bar',
//     title: 'Monthly report generated',
//     subtitle: 'July month financial report is generated',
//     avatarColor: 'info',
//     time: 'Apr 24, 10:30 AM',
//     read: true
//   },
//   {
//     avatarText: 'MG',
//     title: 'Application has been approved 🚀',
//     subtitle: 'Your Meta Gadgets project application has been approved.',
//     avatarColor: 'success',
//     time: 'Feb 17, 12:17 PM',
//     read: true
//   },
//   {
//     avatarIcon: 'tabler-mail',
//     title: 'New message from Harry',
//     subtitle: 'You have new message from Harry',
//     avatarColor: 'error',
//     time: 'Jan 6, 1:48 PM',
//     read: true
//   }
// ]

const NavbarContent = async () => {
const notificationPromo = await fetchPromoExpiry();
 

const notifications = notificationPromo.results.map((doc: {
  promoCode: string;
  id: string;
  toDate: string; 
}) => {
  const toDate = new Date(doc.toDate);
  const now = new Date();
  const isExpired = toDate < now;

  
return {
    title: `Promo Code ${isExpired ? 'Expired' : 'Active'}`,
    subtitle: `Promo Code: ${doc.promoCode}`,
    time: toDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ' ' + toDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    read: !isExpired
  };
});

  // const notificationData = await fetchExpiryDocument("", 1, 10);


  // const notifications = notificationData.results.map((doc: { expiryDate: string | number | Date; documentId: any }) => {

  //   const isExpired = new Date(doc.expiryDate) < new Date();

  //   return {
  //     title: `Document ${isExpired ? 'Expired' : 'Active'}`,
  //     subtitle: `Document ID: ${doc.documentId}`,
  //     time: new Date(doc.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' +
  //       new Date(doc.expiryDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  //     read: !isExpired
  //   };
  // });

  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-4'>
        <NavToggle />
        <SupademoButton />
      </div>
      <div className='flex items-center'>
        <LanguageDropdown />
        <ModeDropdown />
                <NotificationsDropdown notifications={notifications} />

        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
