import { Tick, computePoolAddress, Pool, TickMath } from '@uniswap/v3-sdk'
import { POOL_FACTORY_CONTRACT_ADDRESS } from './constants'
import axios from 'axios'
import { CurrentConfig } from '../config'
import { BarChartTick, GraphTick } from './interfaces'
import { createBarChartTicks } from './active-liquidity'
import { Address, createPublicClient, encodePacked, erc20Abi, getAddress, http, keccak256 } from 'viem'
import { Token } from '@uniswap/sdk-core'
import { ArrakisVaultV2ABI } from './abis/ArrakisVaultV2ABI'
import { ArrakisHelperABI } from './abis/ArrakisHelperABI'
import { mainnet } from 'viem/chains'
import { Position } from '@uniswap/v3-sdk'
import { UniswapV3PoolABI } from './abis/UniswapV3PoolABI'

interface PoolData {
  fee: number
  poolBefore: Pool
  ticksBefore: BarChartTick[]
  poolAfter: Pool
  ticksAfter: BarChartTick[]
  positionsBefore: Position[]
  positionsAfter: Position[]
}

type Pools = Record<string, PoolData>

export async function getFullPool(
  vault: Address,
  token0Address: Address,
  token0Symbol: string,
  token1Address: Address,
  token1Symbol: string,
  blockNumber: bigint
): Promise<{
  pools: Pools
  token0BalanceBefore: bigint
  token1BalanceBefore: bigint
  token0BalanceAfter: bigint
  token1BalanceAfter: bigint
  decimals0: number
  decimals1: number
  token0: Token
  token1: Token
}> {
  const token0 = new Token(CurrentConfig.myConfig.CHAIN.id, token0Address, 18, token0Symbol, token0Symbol)
  const token1 = new Token(CurrentConfig.myConfig.CHAIN.id, token1Address, 18, token1Symbol, token1Symbol)

  const client = createPublicClient({
    chain: mainnet,
    transport: http(CurrentConfig.myConfig.RPC),
  })

  const blockBefore = blockNumber - 1n
  const blockAfter = blockNumber

  console.log({
    address: CurrentConfig.myConfig.ARRAKIS_HELPER,
    abi: ArrakisHelperABI,
    functionName: 'totalUnderlyingWithFees',
    args: [vault],
  })
  const [rangesBefore, rangesAfter] = await Promise.all([
    client.readContract({
      address: vault,
      abi: ArrakisVaultV2ABI,
      functionName: 'getRanges',
      blockNumber: blockBefore,
    }),
    client.readContract({
      address: vault,
      abi: ArrakisVaultV2ABI,
      functionName: 'getRanges',
      blockNumber: blockAfter,
    }),
  ])

  const pools: Pools = {}

  const fees = [...new Set([...rangesBefore.map((x) => x.feeTier), ...rangesAfter.map((x) => x.feeTier)])]

  for (const fee of fees) {
    const poolAddress = getAddress(
      computePoolAddress({
        factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
        tokenA: token0,
        tokenB: token1,
        fee,
      })
    )

    const [poolStateBefore, graphTicksBefore] = await Promise.all([
      client.multicall({
        contracts: [
          {
            address: poolAddress,
            abi: UniswapV3PoolABI,
            functionName: 'slot0',
          },
          {
            address: poolAddress,
            abi: UniswapV3PoolABI,
            functionName: 'liquidity',
          },
        ],
        blockNumber: blockBefore,
        allowFailure: false,
      }),
      getFullTickData(poolAddress, Number(blockBefore)),
    ])

    const sdkTicksBefore = graphTicksBefore.map((graphTick: GraphTick) => {
      return new Tick({
        index: +graphTick.tickIdx,
        liquidityGross: graphTick.liquidityGross,
        liquidityNet: graphTick.liquidityNet,
      })
    })

    const fullPoolBefore = new Pool(
      token0,
      token1,
      fee,
      poolStateBefore[0][0].toString(),
      poolStateBefore[1].toString(),
      poolStateBefore[0][1],
      sdkTicksBefore
    )

    const tickSpacingBefore = fullPoolBefore.tickSpacing
    const activeTickIdxBefore = (
      await fullPoolBefore.tickDataProvider.nextInitializedTickWithinOneWord(
        fullPoolBefore.tickCurrent,
        fullPoolBefore.tickCurrent === TickMath.MIN_TICK ? false : true,
        tickSpacingBefore
      )
    )[0]

    const barChartTicksBefore = await createBarChartTicks(
      activeTickIdxBefore,
      fullPoolBefore.liquidity,
      tickSpacingBefore,
      fullPoolBefore.token0,
      fullPoolBefore.token1,
      CurrentConfig.chart.numSurroundingTicks,
      fullPoolBefore.fee,
      graphTicksBefore
    )

    const [poolStateAfter, graphTicksAfter] = await Promise.all([
      client.multicall({
        contracts: [
          {
            address: poolAddress,
            abi: UniswapV3PoolABI,
            functionName: 'slot0',
          },
          {
            address: poolAddress,
            abi: UniswapV3PoolABI,
            functionName: 'liquidity',
          },
        ],
        blockNumber: blockAfter,
        allowFailure: false,
      }),
      getFullTickData(poolAddress, Number(blockAfter)),
    ])

    const sdkTicksAfter = graphTicksAfter.map((graphTick: GraphTick) => {
      return new Tick({
        index: +graphTick.tickIdx,
        liquidityGross: graphTick.liquidityGross,
        liquidityNet: graphTick.liquidityNet,
      })
    })

    const fullPoolAfter = new Pool(
      token0,
      token1,
      fee,
      poolStateAfter[0][0].toString(),
      poolStateAfter[1].toString(),
      poolStateAfter[0][1],
      sdkTicksAfter
    )

    const tickSpacingAfter = fullPoolAfter.tickSpacing
    const activeTickIdxAfter = (
      await fullPoolAfter.tickDataProvider.nextInitializedTickWithinOneWord(
        fullPoolAfter.tickCurrent,
        fullPoolAfter.tickCurrent === TickMath.MIN_TICK ? false : true,
        tickSpacingAfter
      )
    )[0]

    const barChartTicksAfter = await createBarChartTicks(
      activeTickIdxAfter,
      fullPoolAfter.liquidity,
      tickSpacingAfter,
      fullPoolAfter.token0,
      fullPoolAfter.token1,
      CurrentConfig.chart.numSurroundingTicks,
      fullPoolAfter.fee,
      graphTicksAfter
    )

    pools[poolAddress] = {
      fee,
      poolBefore: fullPoolBefore,
      ticksBefore: barChartTicksBefore,
      poolAfter: fullPoolAfter,
      ticksAfter: barChartTicksAfter,
      positionsBefore: [],
      positionsAfter: [],
    }
  }

  const liquiditiesBefore = await client.multicall({
    contracts: rangesBefore.map((x) => ({
      address: getAddress(
        computePoolAddress({
          factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
          tokenA: token0,
          tokenB: token1,
          fee: x.feeTier,
        })
      ),
      abi: UniswapV3PoolABI,
      functionName: 'positions',
      args: [getPositionId(vault, x.lowerTick, x.upperTick)],
    })) as {
      abi: typeof UniswapV3PoolABI
      address: `0x${string}`
      functionName: 'positions'
      args: [`0x${string}`]
    }[],
    blockNumber: blockBefore,
    allowFailure: false,
  })

  const liquiditiesAfter = await client.multicall({
    contracts: rangesAfter.map((x) => ({
      address: getAddress(
        computePoolAddress({
          factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
          tokenA: token0,
          tokenB: token1,
          fee: x.feeTier,
        })
      ),
      abi: UniswapV3PoolABI,
      functionName: 'positions',
      args: [getPositionId(vault, x.lowerTick, x.upperTick)],
    })) as {
      abi: typeof UniswapV3PoolABI
      address: `0x${string}`
      functionName: 'positions'
      args: [`0x${string}`]
    }[],
    blockNumber: blockAfter,
    allowFailure: false,
  })

  const [token0BalanceBefore, token1BalanceBefore] = await client.multicall({
    contracts: [
      {
        address: getAddress(token0.address),
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [vault],
      },
      {
        address: getAddress(token1.address),
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [vault],
      },
    ],
    blockNumber: blockBefore,
    allowFailure: false,
  })
  const [token0BalanceAfter, token1BalanceAfter, decimals0, decimals1] = await client.multicall({
    contracts: [
      {
        address: getAddress(token0.address),
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [vault],
      },
      {
        address: getAddress(token1.address),
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [vault],
      },
      {
        address: getAddress(token1.address),
        abi: erc20Abi,
        functionName: 'decimals',
      },
      {
        address: getAddress(token1.address),
        abi: erc20Abi,
        functionName: 'decimals',
      },
    ],
    blockNumber: blockAfter,
    allowFailure: false,
  })

  for (const rangeIdx in rangesBefore) {
    const range = rangesBefore[rangeIdx]
    const poolAddress = getAddress(
      computePoolAddress({
        factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
        tokenA: token0,
        tokenB: token1,
        fee: range.feeTier,
      })
    )
    const liquidityBefore = liquiditiesBefore[rangeIdx]

    pools[poolAddress].positionsBefore.push(
      new Position({
        pool: pools[poolAddress].poolBefore,
        liquidity: liquidityBefore[0].toString(),
        tickLower: range.lowerTick,
        tickUpper: range.upperTick,
      })
    )
  }

  for (const rangeIdx in rangesAfter) {
    const range = rangesAfter[rangeIdx]
    const poolAddress = getAddress(
      computePoolAddress({
        factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
        tokenA: token0,
        tokenB: token1,
        fee: range.feeTier,
      })
    )
    const liquidityAfter = liquiditiesAfter[rangeIdx]

    pools[poolAddress].positionsAfter.push(
      new Position({
        pool: pools[poolAddress].poolAfter,
        liquidity: liquidityAfter[0].toString(),
        tickLower: range.lowerTick,
        tickUpper: range.upperTick,
      })
    )
  }

  for (const poolAddress of Object.keys(pools)) {
    pools[poolAddress].positionsBefore.sort((a, b) => a.tickLower - b.tickLower)
    pools[poolAddress].positionsAfter.sort((a, b) => a.tickLower - b.tickLower)
  }

  return {
    pools,
    token0BalanceBefore,
    token1BalanceBefore,
    token0BalanceAfter,
    token1BalanceAfter,
    decimals0,
    decimals1,
    token0,
    token1,
  }
}

async function getFullTickData(poolAddress: string, blockNumber: number): Promise<GraphTick[]> {
  let allTicks: GraphTick[] = []
  let skip = 0
  let loadingTicks = true
  while (loadingTicks) {
    const ticks = await getTickDataFromSubgraph(poolAddress, skip, blockNumber)
    allTicks = allTicks.concat(ticks)
    if (ticks.length < 1000) {
      loadingTicks = false
    } else {
      skip += 1000
    }
  }

  return allTicks
}

async function getTickDataFromSubgraph(poolAddress: string, skip: number, blockNumber: number): Promise<GraphTick[]> {
  const ticksQuery = JSON.stringify({
    query: `{ ticks(
          where: {poolAddress: "${poolAddress.toLowerCase()}", liquidityNet_not: "0"}
          first: 1000,
          orderBy: tickIdx,
          orderDirection: asc,
          skip: ${skip},
          block: { number: ${blockNumber} }
        ) {
          tickIdx
          liquidityGross
          liquidityNet
        }
      }
    `,
  })

  const response = await axios.post('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3', ticksQuery, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return response.data.data.ticks
}

function getPositionId(vault: Address, lowerTick: number, upperTick: number) {
  return keccak256(encodePacked(['address', 'int24', 'int24'], [vault, lowerTick, upperTick]))
}
