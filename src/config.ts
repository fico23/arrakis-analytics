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
  }
}

// Example Configuration

export const CurrentConfig: ExampleConfig = {
  env: Environment.MAINNET,
  rpc: {
    mainnet: 'https://mainnet.infura.io/v3/0ac57a06f2994538829c14745750d721',
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
    RPC: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    VAULT: {
      ADDRESS: '0xd42dd60fbE8331413383075ac91EDE56784e93D3',
      DEPLOY_BLOCK: 16543528n,
    },
  },
}
