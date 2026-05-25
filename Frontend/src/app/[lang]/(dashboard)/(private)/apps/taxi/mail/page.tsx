import React from 'react';

import type { Locale } from '@/configs/i18n';

import EmailTable from '@/views/apps/taxi/promotion/email';
import { getDictionary } from '@/utils/getDictionary';

// import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';

const Email = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const dictionary = await getDictionary(params.lang);

  // Static data to be passed to the DocumentExpiryTable

  const emailData = [
    {
        subject: "Meeting Reminder",
        content: "Don't forget about the meeting scheduled for tomorrow at 10 AM."
    },
    {
        subject: "Weekly Report",
        content: "Please find attached the weekly report for your review."
    },
    {
        subject: "New Assignment",
        content: "You have been assigned a new project. Check the details in the portal."
    },
    {
        subject: "Feedback Request",
        content: "We would love your feedback on our recent service improvements."
    },
    {
        subject: "Invoice Notification",
        content: "Your invoice is ready for download. Please check your account."
    },
    {
        subject: "System Maintenance",
        content: "Scheduled maintenance will occur this weekend. Please prepare accordingly."
    }
];


  // const driverDocument = await fetchExpiryDocument()


  return (
    <EmailTable
      dictionary={dictionary}
      staticGroup={emailData}
    />
  );
};

export default Email;
