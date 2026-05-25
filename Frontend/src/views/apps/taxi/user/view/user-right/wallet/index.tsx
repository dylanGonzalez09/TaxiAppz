/* eslint-disable @typescript-eslint/no-unused-vars */
// MUI Imports
import Grid from '@mui/material/Grid';

// Component Imports
import Wallet from './Wallet';

type WalletTransactionType = {
  id: string;
  amount: number;
  purpose: string;
  type: string;
  status: string;
  createdAt: string;
};

type WalletDetailsType = {
  earnedAmount: number;
  amountSpent: number;
  balance: number;
};

interface WalletTabProps {
  userId: string;
  walletTransactionsData: WalletTransactionType[];
  walletDetails: WalletDetailsType;
  addWalletButton: any
  dictionary: any;
}

const WalletTab = ({
  userId,
  walletTransactionsData,
  walletDetails,
  addWalletButton,
  dictionary,
}: WalletTabProps) => {

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        {/* Wallet Component */}
        <Wallet
          userId={userId}
          TransactionsData={walletTransactionsData}
          walletDetails={walletDetails}
          addWalletButton={addWalletButton}
          dictionary={dictionary}
        />
      </Grid>
    </Grid>
  );
};

export default WalletTab;
