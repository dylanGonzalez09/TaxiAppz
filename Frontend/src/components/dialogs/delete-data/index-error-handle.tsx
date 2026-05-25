/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import classnames from 'classnames';

type ConfirmationType = 'delete-data' | 'status-data' | 'suspend-account' | 'delete-order' | 'delete-customer' | 'approved-denied' | 'denied-approved';

type ConfirmationDialogProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    confirmationType: ConfirmationType;
    onConfirm: (confirmed: boolean) => void;
    dictionary: any;
    status: any;
    lang?: 'ar' | 'en' | 'fr';
};

const ConfirmationDialogErrorHandle = ({ 
    open, 
    setOpen, 
    confirmationType, 
    onConfirm, 
    dictionary, 
    status,
    lang = 'en'
}: ConfirmationDialogProps) => {
    const [secondDialog, setSecondDialog] = useState(false);
    const [userInput, setUserInput] = useState(false);
   
    const handleSecondDialogClose = () => {
        setSecondDialog(false);
        setOpen(false);
    };

    const handleConfirmation = (value: boolean) => {


    if (confirmationType === 'delete-data' || confirmationType === 'status-data') {
        setUserInput(false);
        setSecondDialog(false);
     setOpen(false);

        setTimeout(() => onConfirm(value), 200);
    } else {
        setUserInput(value);
        setSecondDialog(true);
        setOpen(false);

        setTimeout(() => onConfirm(value), 200);
    }
    };


    const getDirection = () => {
        return lang === 'ar' ? 'rtl' : 'ltr';
    };

    const renderDialogContent = () => {
        let title = '';
        let content = '';

        if (confirmationType === 'approved-denied' || confirmationType === 'denied-approved') {
            const actionType = confirmationType === 'approved-denied' 
                ? dictionary['navigation'].toggleApprovedStatus 
                : dictionary['navigation'].toggleDeniedStatus;

            title = actionType;
            content = dictionary.messages[confirmationType === 'approved-denied' 
                ? 'approvalStatusUpdated' 
                : 'deniedStatusUpdated'];
        } else {
            switch (confirmationType) {
                case 'delete-data':
                    title = dictionary['navigation'].areYouSure;
                    content = dictionary['navigation'].dataWillBeDeleted;
                    break;
                case 'status-data':
                    title = dictionary['navigation'].areYouSure;
                    content = dictionary['navigation'].statusWillChange;
                    break;
                case 'suspend-account':
                    title = dictionary['navigation'].suspendUser;
                    content = dictionary['navigation'].actionCannotBeReverted;
                    break;
                case 'delete-order':
                    title = dictionary['navigation'].deleteOrder;
                    content = dictionary['navigation'].actionCannotBeReverted;
                    break;
                case 'delete-customer':
                    title = dictionary['navigation'].deleteCustomer;
                    content = dictionary['navigation'].actionCannotBeReverted;
                    break;
                default:
                    break;
            }
        }

        return (
            <>
                <DialogContent className="flex items-center flex-col text-center" dir={getDirection()}>
                    <i className={classnames('tabler-alert-circle text-[88px] mbe-6', {
                        'text-warning': confirmationType === 'suspend-account',
                        'text-error': ['delete-order', 'delete-customer'].includes(confirmationType),
                    })} />
                    <Typography variant="h4">{title}</Typography>
                    <Typography color="text.primary">{content}</Typography>
                </DialogContent>
                <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
                    <Button variant="contained" onClick={() => handleConfirmation(true)}>
                        {confirmationType === 'suspend-account' ? dictionary['navigation'].suspendUser :
                            confirmationType === 'delete-order' ? dictionary['navigation'].deleteOrder :
                                confirmationType === 'delete-customer' ? dictionary['navigation'].deleteCustomer : 
                                dictionary['navigation'].Yes}
                    </Button>
                    <Button variant="tonal" color="primary" onClick={() => handleConfirmation(false)}>
                        {dictionary['navigation'].cancel}
                    </Button>
                </DialogActions>
            </>
        );
    };

    const renderSecondDialog = () => {
        // if (status != 200) {
        //     return null;
        // }
        
        let title = '';
        let successMessage = '';
        const cancelButtonText = dictionary['navigation'].ok;

        switch (confirmationType) {
                case 'delete-data':
                title = userInput ? 'delete' : dictionary['navigation'].dataDeleteCancelled ;
                successMessage = userInput ? dictionary['navigation'].dataDeletedSuccess : dictionary['navigation'].dataDeleteCancelled;
                break;
            case 'status-data':
                title = userInput ? dictionary['navigation'].statusChange : dictionary['navigation'].statusChange + ' ' + dictionary['navigation'].cancelled;
                successMessage = userInput ? dictionary['navigation'].statusUpdatedSuccess : dictionary['navigation'].statusChangeCancelled;
                break;
            case 'suspend-account':
                title = userInput ? dictionary['navigation'].suspended : dictionary['navigation'].cancelledSuspension;
                successMessage = userInput ? dictionary['navigation'].userSuspended : dictionary['navigation'].suspensionCancelled;
                break;
            case 'delete-order':
                title = userInput ? dictionary['navigation'].deleted : dictionary['navigation'].orderDeletionCancelled;
                successMessage = userInput ? dictionary['navigation'].orderDeletedSuccess : dictionary['navigation'].orderDeleteCancelled;
                break;
            case 'delete-customer':
                title = userInput ? dictionary['navigation'].deleted : dictionary['navigation'].customerDeletionCancelled;
                successMessage = userInput ? dictionary['navigation'].customerRemovedSuccess : dictionary['navigation'].customerDeleteCancelled;
                break;
            case 'approved-denied':
                title = userInput ? dictionary['navigation'].approvalStatusUpdated : dictionary['navigation'].approvalStatusCancelled;
                successMessage = userInput ? dictionary['navigation'].approvalStatusUpdated : dictionary['navigation'].approvalStatusCancelled;
                break;
            case 'denied-approved':
                title = userInput ? dictionary['navigation'].deniedStatusUpdated : dictionary['navigation'].deniedStatusCancelled;
                successMessage = userInput ? dictionary['navigation'].deniedStatusUpdated : dictionary['navigation'].deniedStatusCancelled;
                break;
            default:
                break;
        }

        return (
            <Dialog open={secondDialog} onClose={handleSecondDialogClose} dir={getDirection()}>
                <DialogContent className="flex items-center flex-col text-center">
                    <i className={classnames('text-[88px] mbe-6', {
                        'tabler-circle-check text-success': userInput,
                        'tabler-circle-x text-error': !userInput,
                    })} />
                    <Typography variant="h4" className="mbe-2">{title}</Typography>
                    <Typography color="text.primary">{successMessage}</Typography>
                </DialogContent>
                <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
                    <Button variant="contained" color="success" onClick={handleSecondDialogClose}>
                        {cancelButtonText}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <>
            <Dialog fullWidth maxWidth="xs" open={open} onClose={() => setOpen(false)} dir={getDirection()}>
                {renderDialogContent()}
            </Dialog>
            {renderSecondDialog()}
        </>
    );
};

export default ConfirmationDialogErrorHandle;
