import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const networkMap = {
  'eth-mainnet': 'ethereum-mainnet',
  'ethereum': 'ethereum-mainnet',
  'ethereum-mainnet': 'ethereum-mainnet',
  'polygon': 'polygon-mainnet',
  'polygon-mainnet': 'polygon-mainnet',
  'arbitrum': 'arbitrum-mainnet',
  'arbitrum-mainnet': 'arbitrum-mainnet',
  'base': 'optimism-mainnet',
  'base-mainnet': 'optimism-mainnet',
};

class AlchemyProxyService {
  /**
   * Get token balances for an address
   * @param {string} address - Wallet address
   * @param {string} network - Network name (eth-mainnet, polygon, etc)
   * @returns {Promise} Token balances array
   */
  async getTokenBalances(address, network = 'polygon-mainnet') {
    try {
      const mappedNetwork = networkMap[network] || 'polygon-mainnet';

      const response = await axios.post(`${API_URL}/api/alchemy/token-balances`, {
        address,
        network: mappedNetwork,
      }, {
        timeout: 15000,
      });

      // Extract token balances from JSON-RPC response
      const data = response.data;
      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch token balances');
      }

      // Return the tokenBalances array from the result
      const tokenBalances = data.result?.tokenBalances || [];
      return Array.isArray(tokenBalances) ? tokenBalances : [];
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Rate limited. Please try again in a few moments.');
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch token balances');
    }
  }

  /**
   * Generic RPC request through Alchemy
   * @param {string} method - JSON-RPC method
   * @param {Array} params - Method parameters
   * @param {string} network - Network name
   * @returns {Promise} RPC response
   */
  async request(method, params = [], network = 'polygon-mainnet') {
    try {
      const mappedNetwork = networkMap[network] || 'polygon-mainnet';
      
      const response = await axios.post(`${API_URL}/api/alchemy/request`, {
        method,
        params,
        network: mappedNetwork,
      }, {
        timeout: 15000,
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Rate limited. Please try again in a few moments.');
      }
      throw new Error(error.response?.data?.error || 'Failed to process request');
    }
  }

  /**
   * Get token metadata (name, symbol, logo, decimals)
   * @param {string} contractAddress - Token contract address
   * @param {string} network - Network name
   * @returns {Promise} Token metadata object
   */
  async getTokenMetadata(contractAddress, network = 'polygon-mainnet') {
    try {
      const mappedNetwork = networkMap[network] || 'polygon-mainnet';

      const response = await axios.post(`${API_URL}/api/alchemy/request`, {
        method: 'alchemy_getTokenMetadata',
        params: [contractAddress],
        network: mappedNetwork,
      }, {
        timeout: 15000,
      });

      const data = response.data;
      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch token metadata');
      }

      // Return the metadata object from the result
      return data.result || {};
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Rate limited. Please try again in a few moments.');
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch token metadata');
    }
  }
}

export const alchemyProxyService = new AlchemyProxyService();
