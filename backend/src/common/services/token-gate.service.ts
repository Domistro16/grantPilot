import { Injectable, Logger } from '@nestjs/common';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_GATE_CONFIG } from '../../config/token-gate.config';

@Injectable()
export class TokenGateService {
  private readonly logger = new Logger(TokenGateService.name);
  private connection: Connection;

  constructor() {
    this.connection = new Connection(TOKEN_GATE_CONFIG.RPC_ENDPOINT, 'confirmed');
    this.logger.log(`Token gate service initialized with RPC: ${TOKEN_GATE_CONFIG.RPC_ENDPOINT}`);
  }

  /**
   * Verify if a wallet address has sufficient token balance
   * @param walletAddress - Solana wallet address to check
   * @returns Promise<{ hasAccess: boolean; balance: number; error?: string }>
   */
  async verifyTokenBalance(walletAddress: string): Promise<{
    hasAccess: boolean;
    balance: number;
    error?: string;
  }> {
    try {
      // Validate wallet address format
      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(walletAddress);
      } catch (err) {
        this.logger.warn(`Invalid wallet address format: ${walletAddress}`);
        return {
          hasAccess: false,
          balance: 0,
          error: 'Invalid wallet address format',
        };
      }

      let balance = 0;

      // Check LVL token account balance
      try {
        const tokenMint = new PublicKey(TOKEN_GATE_CONFIG.TOKEN_MINT_ADDRESS);
        const tokenAccounts =
          await this.connection.getParsedTokenAccountsByOwner(publicKey, {
            mint: tokenMint,
          });

        if (tokenAccounts.value.length > 0) {
          const tokenAccount = tokenAccounts.value[0];
          const tokenAmount =
            tokenAccount.account.data.parsed.info.tokenAmount;
          balance = parseInt(tokenAmount.amount);

          // Verify token decimals match configuration
          if (tokenAmount.decimals !== TOKEN_GATE_CONFIG.DECIMALS) {
            this.logger.warn(
              `Decimals mismatch! Blockchain: ${tokenAmount.decimals}, Config: ${TOKEN_GATE_CONFIG.DECIMALS}`,
            );
          }

          this.logger.debug(
            `Checked ${TOKEN_GATE_CONFIG.TOKEN_NAME} balance for ${walletAddress}: ${balance} tokens (decimals: ${tokenAmount.decimals})`,
          );
        } else {
          this.logger.debug(
            `No token account found for ${walletAddress}, balance is 0`,
          );
        }
      } catch (err) {
        this.logger.warn(
          `Error checking token account for ${walletAddress}: ${err.message}`,
        );
        // If token account doesn't exist, balance is 0
        balance = 0;
      }

      const hasAccess = balance >= TOKEN_GATE_CONFIG.REQUIRED_AMOUNT;

      this.logger.log(
        `Token gate check for ${walletAddress}: ${hasAccess ? 'GRANTED' : 'DENIED'} (balance: ${balance}, required: ${TOKEN_GATE_CONFIG.REQUIRED_AMOUNT})`,
      );

      return {
        hasAccess,
        balance,
      };
    } catch (error) {
      this.logger.error(
        `Error verifying token balance for ${walletAddress}:`,
        error,
      );
      return {
        hasAccess: false,
        balance: 0,
        error: 'Failed to verify token balance',
      };
    }
  }

  /**
   * Get token gate configuration info
   */
  getTokenGateInfo() {
    return {
      tokenMintAddress: TOKEN_GATE_CONFIG.TOKEN_MINT_ADDRESS,
      requiredAmount: TOKEN_GATE_CONFIG.REQUIRED_AMOUNT,
      tokenName: TOKEN_GATE_CONFIG.TOKEN_NAME,
    };
  }
}
