import { WETH9, Token } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { WBTC_TOKEN } from './libs/constants'
import { Address, Chain } from 'viem'
import { mainnet } from 'viem/chains'

// Sets if the example should run locally or on chain
export enum Environment {
  MAINNET,
}

// Inputs that configure this example to run
export interface ExampleConfig {
  env: Environment
  rpc: {
    mainnet: string
  }
  pool: {
    tokenA: Token
    tokenB: Token
    fee: FeeAmount
  }
  chart: {
    numSurroundingTicks: number
  }
  myConfig: {
    CHAIN: Chain
    RPC: string
    VAULT: {
      ADDRESS: Address
      DEPLOY_BLOCK: bigint
    }
    ARRAKIS_HELPER: Address
  }
}

// Example Configuration

export const CurrentConfig: ExampleConfig = {
  env: Environment.MAINNET,
  rpc: {
    mainnet: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`,
  },
  pool: {
    tokenA: WBTC_TOKEN,
    tokenB: WETH9[1],
    fee: FeeAmount.MEDIUM,
  },
  chart: {
    numSurroundingTicks: 100,
  },
  myConfig: {
    CHAIN: mainnet,
    RPC: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`,
    VAULT: {
      ADDRESS: '0xB041f628e961598af9874BCf30CC865f67fad3EE',
      DEPLOY_BLOCK: 16535305n,
    },
    ARRAKIS_HELPER: '0x89E4bE1F999E3a58D16096FBe405Fc2a1d7F07D6',
  },
}
