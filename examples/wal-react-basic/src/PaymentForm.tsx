import React, { Component, FormEvent } from 'react';
import styled from 'react-emotion';
import { Subscribe } from 'unstated';
import { Wallet } from 'wal-eos';
import { SessionStateContainer } from './core/SessionStateContainer';
import { TransactionButtonBlock } from './shared/transactions/TransactionButtonBlock';
import { FormElement, Input, FormActions, FieldLabel } from './shared/forms';
import { transfer } from './core/eosActions';

// Visual components

const PaymentFormRoot = styled('div')({
  marginBottom: 20,
  padding: 30
});

const PaymentFormActions = styled(FormActions)({
  paddingTop: 20
});

const PaymentFormTitle = styled('h1')({
  margin: 0,
  marginBottom: 30,
  fontSize: 20,
  fontWeight: 600,
  textTransform: 'uppercase',
  color: 'white'
});

const PaymentFormResetButton = styled('button')({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 200,
  margin: '30px auto',
  padding: '10px 15px',
  color: 'white',
  fontSize: 12,
  fontWeight: 300,
  backgroundColor: '#2e3542',
  border: 'none',
  outline: 'none',
  // textTransform: 'uppercase',
  borderRadius: 1,
  boxShadow: '0 7px 15px -4px rgba(0, 0, 0, 0.4)',
  transition: 'all 0.2s, transform 0.1s',

  '& strong': {
    fontWeight: 600
  },

  '&:hover': {
    backgroundColor: '#40495a',
    cursor: 'pointer'
  },

  '&:active': {
    backgroundColor: '#485163',
    boxShadow: '0 4px 15px -7px rgba(0, 0, 0, 0.8)',
    transform: 'translateY(1px) scale(1)'
  }
});

// Form component

interface PaymentFormProps {
  sessionStateContainer: SessionStateContainer;
}

interface PaymentFormState {
  receiverName: string;
  amount: number;
  inProgress?: boolean;
  progressMessage?: string;
  hasError?: boolean;
  errorMessage?: string;
  success?: boolean;
  successMessage?: string;
}

const defaultProgressMessage = 'Transaction in progress, please stand by';
const defaultSuccessMessage = 'Transaction completed. See console for details';
const defaultErrorMessage = 'Transaction failed. See console for details';

const DEFAULT_STATE = {
  receiverName: 'mary12345123',
  amount: 1,
  inProgress: false,
  hasError: false,
  success: false
};

export class PaymentForm extends Component<PaymentFormProps, PaymentFormState> {
  state: PaymentFormState = {
    ...DEFAULT_STATE
  };

  handleAmountChange = (event: FormEvent<HTMLInputElement>) => {
    this.setState({ amount: Number(event.currentTarget.value) });
  };

  handleSubmit = (wallet: Wallet) => {
    const { amount, receiverName } = this.state;
    if (!wallet) {
      this.setState({ hasError: true, errorMessage: defaultErrorMessage });
      return;
    }

    this.setState({
      inProgress: true,
      hasError: false,
      success: false,
      progressMessage: defaultProgressMessage
    });

    return transfer(wallet, receiverName, amount)
      .then((result: any) => {
        this.setState({
          inProgress: false,
          hasError: false,
          success: true,
          successMessage: defaultSuccessMessage
        });
      })
      .catch((error: any) => {
        this.setState({
          inProgress: false,
          hasError: true,
          success: false,
          errorMessage: defaultErrorMessage
        });
      });
  };

  resetForm = () => {
    this.setState({ ...DEFAULT_STATE });
  };

  getDefaultWalletSession = () => {
    const { sessionStateContainer } = this.props;
    return sessionStateContainer.getDefaultSession();
  };

  render() {
    const {
      getDefaultWalletSession,
      handleAmountChange,
      handleSubmit,
      resetForm
    } = this;
    const { receiverName, amount, ...buttonProps } = this.state;

    return (
      <PaymentFormRoot>
        <PaymentFormTitle>Transfer</PaymentFormTitle>

        <form noValidate={true}>
          <FormElement>
            <FieldLabel>Receiver</FieldLabel>
            <Input
              type="text"
              value={receiverName}
              disabled={true}
              readOnly={true}
            />
          </FormElement>

          <FormElement>
            <FieldLabel>Amount (EOS)</FieldLabel>
            <Input type="number" value={amount} onChange={handleAmountChange} />
          </FormElement>

          <PaymentFormActions>
            <TransactionButtonBlock
              onTransactionRequested={handleSubmit}
              defaultWalletSession={getDefaultWalletSession()}
              {...buttonProps}
            />

            {buttonProps.success && (
              <PaymentFormResetButton type="button" onClick={resetForm}>
                Start over
              </PaymentFormResetButton>
            )}
          </PaymentFormActions>
        </form>
      </PaymentFormRoot>
    );
  }
}

export function PaymentFormConnected() {
  return (
    <Subscribe to={[SessionStateContainer]}>
      {(sessionStateContainer: SessionStateContainer) => (
        <PaymentForm sessionStateContainer={sessionStateContainer} />
      )}
    </Subscribe>
  );
}

export default PaymentFormConnected;
