'use client';

export type StripeTerminalState = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'AWAITING_TAP' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

export interface StripeTerminalResult {
  success: boolean;
  message: string;
  transactionId?: string;
}

export class StripeTerminalMock {
  private state: StripeTerminalState = 'IDLE';
  private onStateChange: (state: StripeTerminalState) => void;

  constructor(onStateChange: (state: StripeTerminalState) => void) {
    this.onStateChange = onStateChange;
  }

  private updateState(newState: StripeTerminalState) {
    this.state = newState;
    this.onStateChange(newState);
  }

  async connectReader(): Promise<boolean> {
    this.updateState('CONNECTING');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate connection delay
    this.updateState('CONNECTED');
    return true;
  }

  async processPayment(amount: number): Promise<StripeTerminalResult> {
    try {
      if (this.state !== 'CONNECTED') {
        const connected = await this.connectReader();
        if (!connected) {
          return { success: false, message: 'Card reader terminal is offline.' };
        }
      }

      this.updateState('AWAITING_TAP');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate customer tapping card

      this.updateState('PROCESSING');
      await new Promise(resolve => setTimeout(resolve, 1800)); // Simulate card network delay

      // Simulate a small rate of randomized transaction failures for robust testing
      const dice = Math.random();
      if (dice < 0.08) {
        this.updateState('FAILED');
        return { success: false, message: 'Transaction Declined: Insufficient Funds.' };
      }
      if (dice < 0.12) {
        this.updateState('FAILED');
        return { success: false, message: 'Transaction Timed Out. Reader lost signal.' };
      }

      this.updateState('SUCCESS');
      return {
        success: true,
        message: 'Payment Authorized successfully.',
        transactionId: `txn-${Math.random().toString(36).substring(2, 11).toUpperCase()}`
      };
    } catch (err: any) {
      this.updateState('FAILED');
      return { success: false, message: `Terminal Error: ${err.message || err}` };
    } finally {
      // Revert reader back to idle after transaction closes
      setTimeout(() => this.updateState('IDLE'), 2000);
    }
  }
}
