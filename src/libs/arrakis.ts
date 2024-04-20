import { mainnet } from 'viem/chains'
import { ArrakisVaultV2ABI } from './abis/ArrakisVaultV2ABI'
import { PalmTermsABI } from './abis/PalmTermsABI'
import { getAbiItem, Address, createPublicClient, http } from 'viem'
import { CurrentConfig } from '../config'

export async function getTermOpened() {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(CurrentConfig.myConfig.RPC),
  })
  const termOpenedLogsRaw = await client.getLogs({
    address: CurrentConfig.myConfig.VAULT.ADDRESS,
    fromBlock: CurrentConfig.myConfig.VAULT.DEPLOY_BLOCK,
    event: getAbiItem({ abi: PalmTermsABI, name: 'SetupVault' }),
  })

  const tokens = await client.multicall({
    contracts: termOpenedLogsRaw
      .map((x) => [
        {
          address: x.args.vault!,
          abi: ArrakisVaultV2ABI,
          functionName: 'token0',
        },
        {
          address: x.args.vault!,
          abi: ArrakisVaultV2ABI,
          functionName: 'token1',
        },
      ])
      .flat(),
  })

  return termOpenedLogsRaw.map((v, i) => {
    return {
      vault: v.args.vault!,
      token0: tokens[i * 2].result as Address,
      token1: tokens[i * 2 + 1].result as Address,
    }
  })
}

// export async function getVaultAnalytics(vault: Address) {}
