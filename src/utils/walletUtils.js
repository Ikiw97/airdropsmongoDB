/**
 * Safe wallet utilities to prevent conflicts when accessing window.ethereum
 */

/**
 * Get the Ethereum provider safely without triggering redefinition errors
 * Handles cases where multiple wallet libraries try to inject at once
 */
export const getEthereumProvider = () => {
  try {
    // Check if window.ethereum exists and is valid
    if (typeof window !== 'undefined' && window.ethereum) {
      return window.ethereum;
    }
    return null;
  } catch (error) {
    console.warn('Error accessing window.ethereum:', error.message);
    return null;
  }
};

/**
 * Check if wallet is installed
 */
export const isWalletInstalled = () => {
  return getEthereumProvider() !== null;
};

/**
 * Request wallet connection with error handling
 */
export const requestWalletConnection = async () => {
  try {
    const provider = getEthereumProvider();
    if (!provider) {
      throw new Error('Wallet not installed. Please install MetaMask or another EVM wallet.');
    }

    // Check if provider has the required methods
    if (typeof provider.request !== 'function') {
      throw new Error('Invalid wallet provider detected.');
    }

    // Request accounts
    const accounts = await provider.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts available');
    }

    return accounts;
  } catch (error) {
    throw new Error(error.message || 'Failed to connect wallet');
  }
};

/**
 * Get current network chain ID
 */
export const getChainId = async (provider) => {
  try {
    const chainIdHex = await provider.request({
      method: 'eth_chainId'
    });
    return parseInt(chainIdHex, 16);
  } catch (error) {
    console.error('Error getting chain ID:', error);
    throw error;
  }
};

/**
 * Safe event listener management
 */
export const safeAddWalletListener = (provider, event, callback) => {
  try {
    if (provider && typeof provider.on === 'function') {
      provider.on(event, callback);
      return true;
    }
    return false;
  } catch (error) {
    console.warn(`Could not add wallet listener for ${event}:`, error.message);
    return false;
  }
};

export const safeRemoveWalletListener = (provider, event, callback) => {
  try {
    if (provider && typeof provider.removeListener === 'function') {
      provider.removeListener(event, callback);
      return true;
    }
    return false;
  } catch (error) {
    console.warn(`Could not remove wallet listener for ${event}:`, error.message);
    return false;
  }
};

/**
 * Wait for wallet to be available (if it's being injected async)
 * @param {number} timeout - Maximum time to wait in milliseconds
 */
export const waitForWallet = (timeout = 3000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkWallet = () => {
      const provider = getEthereumProvider();
      if (provider) {
        resolve(provider);
      } else if (Date.now() - startTime < timeout) {
        setTimeout(checkWallet, 100);
      } else {
        resolve(null);
      }
    };

    checkWallet();
  });
};
