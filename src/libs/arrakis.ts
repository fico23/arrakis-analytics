import { mainnet } from 'viem/chains'
import { ArrakisVaultV2ABI } from './abis/ArrakisVaultV2ABI'
import { PalmTermsABI } from './abis/PalmTermsABI'
import { getAbiItem, Address, createPublicClient, http, erc20Abi } from 'viem'
import { CurrentConfig } from '../config'
import { VaultData } from '../example/Example'

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

  const tokenNames = await client.multicall({
    contracts: [...new Set(tokens)].map((x) => ({
      address: x.result as Address,
      abi: erc20Abi,
      functionName: 'symbol',
    })),
  })

  const vaults = termOpenedLogsRaw.map((v, i) => {
    return {
      vault: v.args.vault!,
      deployBlock: v.blockNumber,
      token0: tokens[i * 2].result as Address,
      token1: tokens[i * 2 + 1].result as Address,
      symbol0: tokenNames[i * 2].result as string,
      symbol1: tokenNames[i * 2 + 1].result as string,
    }
  })

  console.log(vaults)

  return vaults
}

export async function getVaultRebalances(vault: VaultData) {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(CurrentConfig.myConfig.RPC),
  })

  const rebalances = await client.getLogs({
    address: vault.vault,
    fromBlock: vault.deployBlock,
    event: getAbiItem({ abi: ArrakisVaultV2ABI, name: 'LogRebalance' }),
  })
  // const uniqueBlocks = [...new Set(rebalances.map((x) => x.blockNumber))]
  // const blocks = await Promise.all(
  //   uniqueBlocks.map((x) => client.getBlock({ blockNumber: x }))
  // )

  // return rebalances.map((rebalance, index) => ({
  //   ...rebalance,
  //   blockTimestamp: blocks[index].timestamp,
  // }))

  return rebalances
}

export async function getBlockTimestamp(blockNumber: bigint) {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(CurrentConfig.myConfig.RPC),
  })
  const block = await client.getBlock({ blockNumber })

  return block.timestamp
}
