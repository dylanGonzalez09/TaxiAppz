/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';

import { toast } from 'react-toastify';

import { useForm, Controller } from 'react-hook-form';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, IconButton, InputAdornment } from '@mui/material';

import { signOut } from 'next-auth/react'

import CustomTextField from '@core/components/mui/TextField';

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'; // Adjust path based on actual component location

import {
  validatePassword,

} from '@/utils/validation';
import { updatePassword } from '@/app/api/apps/taxi/user';

type Props = {
  open: boolean;
  handleClose: () => void;
  userId: string;
  dictionary: any;
};

type FormValues = {
  password: string;
  confirmPassword: string;
};

const EditPasswordDialog = ({ open, handleClose,userId, dictionary}: Props) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { control, handleSubmit, reset, setError, watch } = useForm<FormValues>({
    mode: 'all',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const handleFormSubmit = async (data: FormValues, userId: string) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { type: 'manual', message: dictionary?.navigation?.Confirmpasswordwasnotmatched || 'Confirm password was not matched' });

      return;
    }

    setLoading(true);

    const updatedData = {
      password: data.password,
    };

    // Simulate an API call to update the password
    try {
      await updatePassword(userId, updatedData);
      setLoading(false);
      toast.success(dictionary['navigation'].passwordChangedSuccessfully);
      handleReset();
    } catch (error) {
      console.error('Error updating password:', error);
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset({ password: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
    handleClose();  // Close dialog
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleReset}  // Close dialog and reset form on close
      maxWidth="sm"  // Adjust the dialog width size for better UX
      scroll="body"
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={handleReset} disableRipple>
        <i className="tabler-x" />
      </DialogCloseButton>
      <DialogTitle variant="h4" className="flex gap-2 flex-col text-center">
      {dictionary['navigation'].changePassword}

      </DialogTitle>

      <form onSubmit={handleSubmit((data) => handleFormSubmit(data, userId))}>
        <DialogContent>
          {/* Password Field with fieldState */}
          <Controller
            name="password"
            control={control}
            rules={{
              required: dictionary['navigation'].Passwordisrequired,
              validate: value => validatePassword(value, dictionary)

            }}
            render={({ field, fieldState }) => (
              <CustomTextField
                {...field}
                type={showPassword ? "text" : "password"}
                fullWidth
                className="mb-5"
                label={dictionary?.navigation?.Password ?? "Password"}
                placeholder={dictionary?.navigation?.EnterNewPassword ?? "Enter new password"}
                error={!!fieldState?.error}
                helperText={fieldState?.error?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        <i className={showPassword ? "tabler-eye-off" : "tabler-eye"} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />

          {/* Confirm Password Field with fieldState */}
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: dictionary['navigation'].ConfirmPasswordisrequired,
              validate: value =>
                value === password || dictionary?.navigation?.Confirmpasswordwasnotmatched || 'Confirm password was not matched'
            }}
            render={({ field, fieldState }) => (
              <CustomTextField
                {...field}
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                className="mb-2 mt-2"
                label={dictionary?.navigation?.confirmPassword ?? "Confirm Password"}
                placeholder={dictionary?.navigation?.confirmPassword ?? "Enter Confirm Password"}
                error={!!fieldState?.error}
                helperText={fieldState?.error?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={toggleConfirmPasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        <i className={showConfirmPassword ? "tabler-eye-off" : "tabler-eye"} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          {/* Cancel Button */}
          <Button variant="outlined" onClick={handleReset}>
            {dictionary?.navigation?.Cancel?? "Cancel"}
          </Button>

          {/* Submit Button */}
          <Button variant="contained" type="submit">
            {loading ? <CircularProgress size={24} /> : dictionary?.navigation?.Update ?? "Update"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditPasswordDialog;
