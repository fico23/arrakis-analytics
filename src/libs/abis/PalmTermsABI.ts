export const PalmTermsABI = [
  {
    inputs: [
      {
        internalType: 'contract IArrakisV2Factory',
        name: 'v2factory_',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'AddVault',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'emolument0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'emolument1',
        type: 'uint256',
      },
    ],
    name: 'CloseTerm',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'delegate',
        type: 'address',
      },
    ],
    name: 'DelegateVault',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'IncreaseLiquidity',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint24[]',
        name: 'feeTiers',
        type: 'uint24[]',
      },
    ],
    name: 'LogAddPools',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address[]',
        name: 'routers',
        type: 'address[]',
      },
    ],
    name: 'LogBlacklistRouters',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address[]',
        name: 'pools',
        type: 'address[]',
      },
    ],
    name: 'LogRemovePools',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'delegate',
        type: 'address',
      },
    ],
    name: 'LogSetDelegate',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'creatorOrDelegate',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'LogSetVaultData',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'creatorOrDelegate',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'strat',
        type: 'string',
      },
    ],
    name: 'LogSetVaultStratByName',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address[]',
        name: 'routers',
        type: 'address[]',
      },
    ],
    name: 'LogWhitelistRouters',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'sentBack',
        type: 'uint256',
      },
    ],
    name: 'LogWithdrawVaultBalance',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'emolument0',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'emolument1',
        type: 'uint256',
      },
    ],
    name: 'RenewTerm',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint16',
        name: 'oldEmolument',
        type: 'uint16',
      },
      {
        indexed: false,
        internalType: 'uint16',
        name: 'newEmolment',
        type: 'uint16',
      },
    ],
    name: 'SetEmolument',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'oldManager',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newManager',
        type: 'address',
      },
    ],
    name: 'SetManager',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'contract IArrakisV2Resolver',
        name: 'oldResolver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'contract IArrakisV2Resolver',
        name: 'newResolver',
        type: 'address',
      },
    ],
    name: 'SetResolver',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'oldTermTreasury',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newTermTreasury',
        type: 'address',
      },
    ],
    name: 'SetTermTreasury',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'SetupVault',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'contract IArrakisV2',
        name: 'vault_',
        type: 'address',
      },
      {
        internalType: 'uint24[]',
        name: 'feeTiers_',
        type: 'uint24[]',
      },
    ],
    name: 'addPools',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IArrakisV2',
        name: 'vault_',
        type: 'address',
      },
      {
        internalType: 'address[]',
        name: 'routers_',
        type: 'address[]',
      },
    ],
    name: 'blacklistRouters',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IArrakisV2',
        name: 'vault_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'newOwner_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'newManager_',
        type: 'address',
      },
    ],
    name: 'closeTerm',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'delegateByVaults',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'emolument',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'contract IArrakisV2',
            name: 'vault',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount0',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amount1',
            type: 'uint256',
          },
        ],
        internalType: 'struct IncreaseBalance',
        name: 'increaseBalance_',
        type: 'tuple',
      },
    ],
    name: 'increaseLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'termTreasury_',
        type: 'address',
      },
      {
        internalType: 'uint16',
        name: 'emolument_',
        type: 'uint16',
      },
      {
        internalType: 'contract IArrakisV2Resolver',
        name: 'resolver_',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'manager',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint24[]',
            name: 'feeTiers',
            type: 'uint24[]',
          },
          {
            internalType: 'contract IERC20',
            name: 'token0',
            type: 'address',
          },
          {
            internalType: 'contract IERC20',
            name: 'token1',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount0',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amount1',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'datas',
            type: 'bytes',
          },
          {
            internalType: 'string',
            name: 'strat',
            type: 'string',
          },
          {
            internalType: 'bool',
            name: 'isBeacon',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'delegate',
            type: 'address',
          },
          {
            internalType: 'address[]',
            name: 'routers',
            type: 'address[]',
          },
        ],
        internalType: 'struct SetupPayload',
        name: 'setup_',
        type: 'tuple',
      },
    ],
    name: 'openTerm',
    outputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IArrakisV2',
        name: 'vault_',
        type: 'address',
      },
      {
        internalType: 'address[]',
        name: 'pools_',
        type: 'address[]',
      },
    ],
    name: 'removePools',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IArrakisV2',
        name: 'vault_',
        type: 'address',
      },
    ],
    name: 'renewTerm',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'resolver',
    outputs: [
      {
        internalType: 'contract IArrakisV2Resolver',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'delegate_',
        type: 'address',
      },
    ],
    name: 'setDelegate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: 'emolument_',
        type: 'uint16',
      },
    ],
    name: 'setEmolument',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'manager_',
        type: 'address',
      },
    ],
    name: 'setManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IArrakisV2Resolver',
        name: 'resolver_',
        type: 'address',
      },
    ],
    name: 'setResolver',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'termTreasury_',
        type: 'address',
      },
    ],
    name: 'setTermTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault_',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data_',
        type: 'bytes',
      },
    ],
    name: 'setVaultData',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault_',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'strat_',
        type: 'string',
      },
    ],
    name: 'setVaultStratByName',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'termTreasury',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'v2factory',
    outputs: [
      {
        internalType: 'contract IArrakisV2Factory',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'creator_',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'vaults',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IArrakisV2',
        name: 'vault_',
        type: 'address',
      },
      {
        internalType: 'address[]',
        name: 'routers_',
        type: 'address[]',
      },
    ],
    name: 'whitelistRouters',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault_',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount_',
        type: 'uint256',
      },
      {
        internalType: 'address payable',
        name: 'to_',
        type: 'address',
      },
    ],
    name: 'withdrawVaultBalance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
