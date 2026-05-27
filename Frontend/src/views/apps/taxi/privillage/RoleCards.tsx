'use client'

// RoleCards.tsx

import { useParams } from 'next/navigation';

import Link from 'next/link'

import { Card, CardContent, Grid, Typography, Avatar, AvatarGroup, Button } from '@mui/material';

import type { Locale } from '@configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'



const cardData: any[] = [
  { avatars: ['1.png', '2.png', '3.png', '4.png'] },
];

const RoleCards = ({ roleData = [], dictionary }: { roleData?: any[], dictionary: any }) => {
  const { lang: locale,zoneId } = useParams();

  const zoneIdString = Array.isArray(zoneId) ? zoneId[0] : zoneId;

  return (
    <Grid container spacing={6}>
      {roleData.map((item, index) => (
        <Grid item xs={12} sm={6} lg={4} key={index}>
          <Card>
            <CardContent className='flex flex-col gap-4'>
              <div className='flex items-center justify-between'>
                <AvatarGroup>
                  {cardData[0].avatars.map((img: any, index: number) => (
                    <Avatar key={index} alt={item.role} src={`/images/avatars/${img}`} />
                  ))}
                </AvatarGroup>
              </div>
              <div className='flex justify-between items-center'>
                <div className='flex flex-col items-start gap-1'>
                  <Typography variant='h5'>{item.role}</Typography>
                  {/* {privillageData.includes('Edit') && ( */}
                    <Button
                      color="primary"
                      component={Link}
                      href={getLocalizedUrl(`${zoneIdString}/apps/taxi/role/edit-role/${item.id}`, locale as Locale)}
                    >
                      {dictionary['navigation'].EditRole}
                    </Button>
                  {/* <Button
                    color="primary"
                    component={Link}
                    href={getLocalizedUrl('/apps/ecommerce/products/add', locale as Locale)}
                    startIcon={<i className='tabler-plus' />}
                  ></Button> */}
                </div>
                {/* <IconButton>
                  <i className='tabler-copy text-secondary' />
                </IconButton> */}
              </div>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default RoleCards;
