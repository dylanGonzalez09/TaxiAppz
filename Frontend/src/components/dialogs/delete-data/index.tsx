
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
    dictionary : any;

};

const ConfirmationDialog = ({ open, setOpen, confirmationType, onConfirm ,dictionary}: ConfirmationDialogProps) => {
    const [secondDialog, setSecondDialog] = useState(false);
    const [userInput, setUserInput] = useState(false);

    const handleSecondDialogClose = () => {
        setSecondDialog(false);
        setOpen(false);
    };


    const handleConfirmation = (value: boolean) => {


    if (confirmationType === 'status-data') {
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
    
    const renderDialogContent = () => {
        let title = '';
        let content = '';

        if (confirmationType === 'approved-denied' || confirmationType === 'denied-approved') {

            const actionType = confirmationType === 'approved-denied' ? 'Approved' : 'Denied';
            
            title = `Toggle ${actionType} Status`;
            content = `Are you sure you want to change the status to ${actionType}?`;
        } else {
            switch (confirmationType) {
                case 'delete-data':
                    title = dictionary['navigation'].areYouSure;

                    content = dictionary['navigation'].statusChangeMessage;
                    break;
                case 'status-data':
                    title = dictionary['navigation'].areYouSure;
                    content = dictionary['navigation'].statusChangeMessage;
                    break;
                case 'suspend-account':
                    title = 'Are you sure you want to suspend the user?';
                    content = 'This action cannot be reverted.';
                    break;
                case 'delete-order':
                    title = 'Are you sure you want to delete this order?';
                    content = 'This action cannot be reverted.';
                    break;
                case 'delete-customer':
                    title = 'Are you sure you want to delete this customer?';
                    content = 'This action cannot be reverted.';
                    break;
                default:
                    break;
            }
        }

        return (
            <>
                <DialogContent className="flex items-center flex-col text-center">
                    <i className={classnames('tabler-alert-circle text-[88px] mbe-6', {
                        'text-warning': confirmationType === 'suspend-account',
                        'text-error': ['delete-order', 'delete-customer'].includes(confirmationType),
                    })} />
                    <Typography variant="h4">{title}</Typography>
                    <Typography color="text.primary">{content}</Typography>
                </DialogContent>
                <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
                    <Button variant="contained" onClick={() => handleConfirmation(true)}>
                    {confirmationType === 'suspend-account' ? dictionary['navigation'].yesSuspendUser :
                        confirmationType === 'delete-order' ? dictionary['navigation'].yesDeleteOrder :
                        confirmationType === 'delete-customer' ? dictionary['navigation'].yesDeleteCustomer :
                        dictionary['navigation'].Yes}
                    </Button>
                    <Button variant="tonal" color="secondary" onClick={() => handleConfirmation(false)}>
                    {dictionary['navigation'].cancel}                    </Button>
                </DialogActions>
            </>
        );
    };

    const renderSecondDialog = () => {
        let title = '';
        let successMessage = '';
        const cancelButtonText = 'Ok';

    
        
        switch (confirmationType) {
       
          case 'delete-data':
            title = userInput ?dictionary['navigation'].delete :dictionary['navigation'].deleteCancelled;
            successMessage = userInput ?dictionary['navigation'].deleteSuccess :dictionary['navigation'].deleteCancelled;
            break;
          case 'status-data':
            title = userInput ?dictionary['navigation'].statusChanged :dictionary['navigation'].statusChangeCancelled;
            successMessage = userInput ?dictionary['navigation'].statusUpdated :dictionary['navigation'].statusChangeCancelled;
            break;
          case 'suspend-account':
            title = userInput ?dictionary['navigation'].suspended :dictionary['navigation'].suspendedCancelled;
            successMessage = userInput ?dictionary['navigation'].userSuspended :dictionary['navigation'].suspensionCancelled;
            break;
          case 'delete-order':
            title = userInput ?dictionary['navigation'].orderDeleted :dictionary['navigation'].orderDeleteCancelled;
            successMessage = userInput ?dictionary['navigation'].orderDeleteSuccess :dictionary['navigation'].orderDeleteCancelled;
            break;
          case 'delete-customer':
            title = userInput ?dictionary['navigation'].customerDeleted :dictionary['navigation'].customerDeleteCancelled;
            successMessage = userInput ?dictionary['navigation'].customerDeleteSuccess :dictionary['navigation'].customerDeleteCancelled;
            break;
          case 'approved-denied':
            title = userInput ?dictionary['navigation'].approvalStatusUpdated :dictionary['navigation'].approvalStatusChangeCancelled;
            successMessage = userInput ?dictionary['navigation'].approvalStatusUpdatedSuccess :dictionary['navigation'].approvalStatusChangeCancelledSuccess;
            break;
          case 'denied-approved':
            title = userInput ?dictionary['navigation'].deniedStatusUpdated :dictionary['navigation'].deniedStatusChangeCancelled;
            successMessage = userInput ?dictionary['navigation'].deniedStatusUpdatedSuccess :dictionary['navigation'].deniedStatusChangeCancelledSuccess;
            break;
          default:
            break;
        }
        

        return (
            <Dialog open={secondDialog} onClose={handleSecondDialogClose}>
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
            <Dialog fullWidth maxWidth="xs" open={open} onClose={() => setOpen(false)}>
                {renderDialogContent()}
            </Dialog>
            {renderSecondDialog()}
        </>
    );
};

export default ConfirmationDialog;
