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
   * @returns {Promise} Token balances response
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

      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Rate limited. Please try again in a few moments.');
      }
      throw new Error(error.response?.data?.error || 'Failed to fetch token balances');
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
   * @returns {Promise} Token metadata
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

      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Rate limited. Please try again in a few moments.');
      }
      throw new Error(error.response?.data?.error || 'Failed to fetch token metadata');
    }
  }
}

export const alchemyProxyService = new AlchemyProxyService();
