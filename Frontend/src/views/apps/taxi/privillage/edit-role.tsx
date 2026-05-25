/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom'; // Import useNavigate

import type { SubmitHandler } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { Title, CheckboxGroup, ActionIcon } from 'rizzui';

import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import { PiXBold } from 'react-icons/pi';

import { fetchPermission } from '@/app/api/apps/taxi/permission';
import { giveprivillege } from '@/app/api/apps/taxi/privillege';

type FormData = {
  [key: string]: string[];
};

interface Permission {
  groupName: string;
  permissions: { id: string; permissionName: string }[];
}

export default function EditRole({ privilegeData, roleId, dictionary }: { privilegeData: FormData; roleId: string; dictionary: any }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setLoading] = useState(false);
  const [permission, setPermission] = useState<Permission[]>([]);
  const navigate = useNavigate(); // Initialize useNavigate

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
          {dictionary['navigation'].EditRole}
        </Title>
        <ActionIcon size="sm" variant="text" onClick={() => window.history.back()}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 divide-y divide-y-reverse divide-gray-200">
        <Title as="h5" className="mb-2 text-base font-semibold">
          {dictionary['navigation'].RoleAccess}
        </Title>
        {permission.map((group) => {
          const parent = group.groupName;

          return (
            <div key={parent} className="flex flex-col gap-3 pb-4 md:flex-row md:items-center md:justify-between">
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
                      <FormControlLabel
                        key={id}
                        control={<Checkbox />}
                        label={permissionName}
                        value={id.toString()} // Ensure value is a string
                      />
                    ))}
                  </CheckboxGroup>
                )}
              />
            </div>
          );
        })}
      </form>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          {dictionary['navigation'].Back}
        </button>
      </div>
    </div>
  );
}
