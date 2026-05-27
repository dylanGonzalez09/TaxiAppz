// React Imports

// MUI Imports
import { useState } from 'react';

import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';

// Third-party Imports
import classnames from 'classnames';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { Controller } from 'react-hook-form';
import type { Editor } from '@tiptap/core';

// Component Imports
import { toast } from 'react-toastify';

import CustomIconButton from '@core/components/mui/IconButton';
import CustomAutocomplete from '@core/components/mui/Autocomplete'; // Update with the correct path
import CustomTextField from '@core/components/mui/TextField'; // Update with the correct path

// Hook Imports

// Style Imports
// import '@/libs/styles/tiptapEditor.css';


import { sendBulkemail } from '@/app/api/apps/taxi/notification';

type Props = {
  openCompose: boolean;
  setOpenCompose: (value: boolean) => void;
  control: any;
  getValues: any;
  userOptions: any[];
  driverOptions: any[];
  dictionary: any;
  onSendSuccess?: (subject: string, content: string) => void;
};

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className='flex flex-wrap gap-x-3 gap-y-1 plb-2 pli-4 border-bs'>
      <CustomIconButton
        {...(editor.isActive('bold') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <i className={classnames('tabler-bold', { 'text-textSecondary': !editor.isActive('bold') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('underline') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <i className={classnames('tabler-underline', { 'text-textSecondary': !editor.isActive('underline') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('italic') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i className={classnames('tabler-italic', { 'text-textSecondary': !editor.isActive('italic') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('strike') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <i className={classnames('tabler-strikethrough', { 'text-textSecondary': !editor.isActive('strike') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'left' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <i className={classnames('tabler-align-left', { 'text-textSecondary': !editor.isActive({ textAlign: 'left' }) })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'center' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <i className={classnames('tabler-align-center', { 'text-textSecondary': !editor.isActive({ textAlign: 'center' }) })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'right' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <i className={classnames('tabler-align-right', { 'text-textSecondary': !editor.isActive({ textAlign: 'right' }) })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'justify' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      >
        <i className={classnames('tabler-align-justified', { 'text-textSecondary': !editor.isActive({ textAlign: 'justify' }) })} />
      </CustomIconButton>
    </div>
  );
};

const ComposeMail = (props: Props) => {
  const { openCompose, setOpenCompose, getValues, control, userOptions, driverOptions, dictionary, onSendSuccess } = props;
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: dictionary['navigation'].Message,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
  });

  const handleSendMail = async () => {
    const users = getValues('userTo') || [];
    const drivers = getValues('driverTo') || [];
    const userIds = users.map((u: any) => u.id || u._id);
    const driverIds = drivers.map((d: any) => d.id || d._id);
    const messageContent = editor?.getHTML() ?? editor?.getText() ?? '';

    const payload = {
      userIds,
      driverIds,
      subject,
      message: messageContent,
      onmessage: messageContent,
    };

    setSending(true);

    try {
      const result = await sendBulkemail(payload);

      if (result != null) {
        toast.success(dictionary['navigation']?.mailSentSuccessfully ?? 'Mail sent successfully');
        onSendSuccess?.(subject, messageContent);
        setSubject('');
        editor?.commands.clearContent();
        setOpenCompose(false);
      } else {
        toast.error(dictionary['navigation']?.failedToSendMail ?? 'Failed to send mail');
      }
    } catch (error) {
      toast.error(dictionary['navigation']?.failedToSendMail ?? 'Failed to send mail');
    } finally {
      setSending(false);
    }
  };

  return (
    <Drawer
      anchor='bottom'
      variant='persistent'
      hideBackdrop
      open={openCompose}
      onClose={() => setOpenCompose(false)}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: 600,
          height: 'auto',
          insetInlineEnd: '1.9rem',
          insetBlockEnd: '1.7rem',
          maxHeight: '80vh', // Limit the height to avoid overflow
          overflowY: 'auto', // Allow vertical scrolling
          borderRadius: 'var(--mui-shape-borderRadius)',
          zIndex: 12,
          insetInlineStart: 'auto',

        }
      }}
    >
        
      <div className='flex items-center justify-between plb-3.5 pli-6 bg-actionHover'>
        <Typography variant='h5' color='text.secondary'>
         {dictionary['navigation'].ComposeMail}
        </Typography>
        <div className='flex gap-2'>
          <IconButton size='small' onClick={() => setOpenCompose(false)}>
            <i className='tabler-minus text-textSecondary' />
          </IconButton>
          <IconButton size='small' onClick={() => setOpenCompose(false)}>
            <i className='tabler-x text-textSecondary' />
          </IconButton>
        </div>
      </div>
      <div className='flex items-center gap-2 pli-6 plb-1'>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="userTo"
              control={control}
              rules={{ required: dictionary['navigation'].Atleastoneuserisrequired }}
              render={({ field, fieldState }) => (
                <CustomAutocomplete
                  multiple
                  limitTags={2}
                  options={userOptions}
                  id="autocomplete-user-to"

                  // getOptionLabel={(option) => option.name || ''}
               getOptionLabel={(option) => {
  const name = option.userId?.firstName || option.firstName || ""
  const phone = option.userId?.phoneNumber || option.phoneNumber || ""
  const email = option.userId?.email || option.email || ""

  return `${name} [${phone}] ${email ? "- " + email : ""}`
}}
                  value={field.value || []}
isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      label={dictionary['navigation'].UserTo}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message || ''}
                    />
                  )}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
label={`${option.firstName} - ${option.email || option.phoneNumber}`}
                        {...getTagProps({ index })}
                        key={option.id}
                        size="small"
                      />
                    ))
                  }
               onChange={(event, value) => {


  // const emails = value.map((user: any) =>
  //   user.userId?.email || user.email
  // )


  field.onChange(value)
}}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
  name="driverTo"
  control={control}
  rules={{ required: dictionary['navigation'].Atleastonedriverisrequired }}
  render={({ field, fieldState }) => (
    <CustomAutocomplete
      multiple
      limitTags={2}
      options={driverOptions}
      id="autocomplete-driver-to"
      getOptionLabel={(option) => {
        const name = option.userId?.firstName || option.firstName || ''
        const phone = option.userId?.phoneNumber || option.phoneNumber || ''
        const email = option.userId?.email || option.email || ''

        return phone
          ? `${name} [${phone}]${email ? ` - ${email}` : ''}`
          : name
      }}
      value={field.value || []}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          label={dictionary['navigation'].DriverTo}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message || ''}
        />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const name = option.userId?.firstName || option.firstName || ''

          // const phone = option.userId?.phoneNumber || option.phoneNumber || ''
          const email = option.userId?.email || option.email || ''

          return (
            <Chip
              label={`${name} ${email ? ` - ${email}` : ''}`}
              {...getTagProps({ index })}
              key={option.id}
              size="small"
            />
          )
        })
      }
      onChange={(event, value) => {

        // const emails = value
        //   .map((driver: any) => driver.userId?.email || driver.email)
        //   .filter(Boolean)


        field.onChange(value)

        // if (value.length > 0) {
        //   clearErrors('driverTo')
        // }
      }}
    />
  )}
/>
          </Grid>
        </Grid>
      </div>
   <InputBase
  className='plb-1 pli-6 border-bs'
  value={subject}
  onChange={(e) => setSubject(e.target.value)}
  startAdornment={
    <Typography className='font-medium mie-2' color='text.disabled'>
      {dictionary['navigation'].Subject}:
    </Typography>
  }
/>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className='bs-[105px] overflow-y-auto flex border-bs' />
      <div className='plb-4 pli-5 flex justify-between items-center gap-4'>
        <div className='flex items-center gap-4 max-sm:gap-3'>
    
          <Button
            variant='contained'
            endIcon={<i className='tabler-send' />}
            onClick={handleSendMail}
            disabled={sending}
          >
            {sending ? (dictionary['navigation']?.sending ?? 'Sending...') : dictionary['navigation'].Send}
          </Button>
          <IconButton size='small'>
            <i className='tabler-paperclip text-textSecondary' />
          </IconButton>
        </div>
        <div className='flex gap-2'>
          <IconButton size='small'>
            <i className='tabler-dots-vertical text-textSecondary' />
          </IconButton>
          <IconButton size='small' onClick={() => setOpenCompose(false)}>
            <i className='tabler-trash text-textSecondary' />
          </IconButton>
        </div>
      </div>
    </Drawer>
  );
};

export default ComposeMail;
