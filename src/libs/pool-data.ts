import { ethers } from 'ethers'
import { Tick, computePoolAddress, Pool, TickMath } from '@uniswap/v3-sdk'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { POOL_FACTORY_CONTRACT_ADDRESS } from './constants'
import { getMainnetProvider } from './providers'
import axios from 'axios'
import { CurrentConfig } from '../config'
import { BarChartTick, GraphTick } from './interfaces'
import { createBarChartTicks } from './active-liquidity'
import { Address } from 'viem'
import { Token } from '@uniswap/sdk-core'
import { ArrakisVaultV2ABI } from './abis/ArrakisVaultV2ABI'

interface PoolData {
  fee: number
  poolBefore: Pool
  ticksBefore: BarChartTick[]
  poolAfter: Pool
  ticksAfter: BarChartTick[]
}

type Pools = Record<string, PoolData>

export async function getFullPool(
  vault: Address,
  token0Address: Address,
  token0Symbol: string,
  token1Address: Address,
  token1Symbol: string,
  blockNumber: number
): Promise<Pools> {
  const token0 = new Token(
    CurrentConfig.myConfig.CHAIN.id,
    token0Address,
    18,
    token0Symbol,
    token0Symbol
  )
  const token1 = new Token(
    CurrentConfig.myConfig.CHAIN.id,
    token1Address,
    18,
    token1Symbol,
    token1Symbol
  )

  const vaultContract = new ethers.Contract(
    vault,
    ArrakisVaultV2ABI,
    getMainnetProvider()
  )

  const pools: Pools = {}

  const ranges = await vaultContract.getRanges({ blockTag: blockNumber })
  const fees = [...new Set(ranges.map((x: { feeTier: number }) => x.feeTier))]
  console.log('fees', fees)

  for (const fee of fees) {
    const poolAddress = computePoolAddress({
      factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
      tokenA: token0,
      tokenB: token1,
      fee: fee as number,
    })

    const poolContract = new ethers.Contract(
      poolAddress,
      IUniswapV3PoolABI.abi,
      getMainnetProvider()
    )
    const blockBefore = blockNumber - 1

    const [slot0Before, liquidityBefore, graphTicksBefore] = await Promise.all([
      poolContract.slot0({ blockTag: blockBefore }),
      poolContract.liquidity({ blockTag: blockBefore }),
      getFullTickData(poolAddress, blockBefore),
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
      fee as number,
      slot0Before.sqrtPriceX96,
      liquidityBefore,
      slot0Before.tick,
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

    const blockAfter = blockNumber
    const [slot0After, liquidityAfter, graphTicksAfter] = await Promise.all([
      poolContract.slot0({ blockTag: blockAfter }),
      poolContract.liquidity({ blockTag: blockAfter }),
      getFullTickData(poolAddress, blockAfter),
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
      fee as number,
      slot0After.sqrtPriceX96,
      liquidityAfter,
      slot0After.tick,
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
      fee: fee as number,
      poolBefore: fullPoolBefore,
      ticksBefore: barChartTicksBefore,
      poolAfter: fullPoolAfter,
      ticksAfter: barChartTicksAfter,
    }
  }

  return pools
}

async function getFullTickData(
  poolAddress: string,
  blockNumber: number
): Promise<GraphTick[]> {
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

async function getTickDataFromSubgraph(
  poolAddress: string,
  skip: number,
  blockNumber: number
): Promise<GraphTick[]> {
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

  const response = await axios.post(
    'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
    ticksQuery,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  return response.data.data.ticks
}
