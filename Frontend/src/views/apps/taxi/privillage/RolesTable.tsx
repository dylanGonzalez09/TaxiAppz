/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

// EditRole.tsx
import { useEffect, useState } from 'react';

import { PiCheckBold, PiXBold } from 'react-icons/pi';
import type { SubmitHandler } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { ActionIcon, Title, CheckboxGroup } from 'rizzui';

import { fetchPermission } from '@/app/api/apps/taxi/permission';
import { giveprivillege } from '@/app/api/apps/taxi/privillege';



type FormData = {
  [key: string]: string[];
};

export default function EditRole({ privilegeData, roleId }: { privilegeData: any, roleId: any }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setLoading] = useState(false);
  const [permission, setPermission] = useState<any[]>([]);


  // Initialize react-hook-form
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: privilegeData,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const permissionsData = await fetchPermission();

        const groupedPermissions = permissionsData.reduce((acc: { groupName: any; permissions: { permissionName: any; id: any; }[]; }[], { groupName, permissionName, id }: any) => {
          const group = acc.find(group => group.groupName === groupName);

          if (group) {
            group.permissions.push({ permissionName, id });
          } else {
            acc.push({ groupName, permissions: [{ permissionName, id }] });
          }


          return acc;
        }, []);

        setPermission(groupedPermissions);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCheckboxChange = async (values: any, groupName: string) => {
    try {
      setLoading(true);

      const seenIds = new Set();

      const uniqueIds = values.filter((id: string) => {
        if (seenIds.has(id)) {
          return false;
        } else {
          seenIds.add(id);

          return true;
        }
      });

      const body = {
        roleId: roleId,
        permissionIds: uniqueIds,
        groupName: groupName,
      };

      await giveprivillege(roleId, body);
    } catch (error) {
      console.error('Error updating permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);

    try {


      // Optionally handle form submission data here
      // e.g., send data to a server or update state
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900">
      <div className="col-span-full flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          Edit Role
        </Title>
        <ActionIcon size="sm" variant="text" onClick={() => window.history.back()}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 divide-y divide-y-reverse divide-gray-200">
        <Title as="h5" className="mb-2 text-base font-semibold">
          Role Access
        </Title>
        {permission.map((group) => {
          const parent = group.groupName;

          return (
            <div
              key={parent}
              className="flex flex-col gap-3 pb-4 md:flex-row md:items-center md:justify-between"
            >
              <Title as="h6" className="font-medium text-gray-700 2xl:text-sm">
                {parent}
              </Title>
              <Controller
                name={parent}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <CheckboxGroup
                    values={value as string[]}
                    setValues={(newValues) => {
                      onChange(newValues);
                      handleCheckboxChange(newValues, parent);
                    }}
                    className="grid grid-cols-3 gap-4 md:flex"
                  >

                    {group.permissions.map(({ id, permissionName }: any) => (
                      // eslint-disable-next-line react/jsx-key
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={id}
                          name={`${parent}.${value}`}
                          value={id}
                          className="sr-only" // Hide the default checkbox
                        />
                        <label
                          htmlFor={id}
                          className="cursor-pointer flex items-center justify-center"
                        >
                          <PiCheckBold className="icon me-1 hidden h-[14px] w-[14px] md:h-4 md:w-4" />
                          <span className="font-medium">{permissionName}</span>
                        </label>
                      </div>
                    ))}
                  </CheckboxGroup>
                )}
              />
            </div>
          );
        })}
      </form>
    </div>
  );
}
