import React, { useState, useEffect } from 'react'
import './Example.css'
import { CurrentConfig } from '../config'
import { getBlockTimestamp, getTermOpened, getVaultRebalances } from '../libs/arrakis'
import { BarChartTick } from '../libs/interfaces'
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis, YAxis, Tooltip } from 'recharts'
import { Pool } from '@uniswap/v3-sdk'
import { Address, formatUnits, parseUnits } from 'viem'
import { getFullPool } from '../libs/pool-data'
import JSBI from 'jsbi'
import { CurrencyAmount } from '@uniswap/sdk-core'

export interface PoolData {
  pool: Pool
  ticks: BarChartTick[]
}

export interface VaultData {
  vault: `0x${string}`
  token0: Address
  token1: Address
  symbol0: string
  symbol1: string
  deployBlock: bigint
}

type RebalancesType = Awaited<ReturnType<typeof getVaultRebalances>>
type SingleRebalanceType = RebalancesType extends (infer U)[] ? U : never

const Example = () => {
  const [vaults, setVaults] = useState<VaultData[]>()
  const [poolsData, setPoolsData] = useState<Awaited<ReturnType<typeof getFullPool>>>()
  const [selectedVault, setSelectedVault] = useState<VaultData>()
  const [vaultRebalances, setVaultRebalances] = useState<RebalancesType>()
  const [currentRebalance, setCurrentRebalance] = useState<SingleRebalanceType>()
  const [currentRebalanceIndex, setCurrentRebalanceIndex] = useState<number>()
  const [currentRebalanceTimestamp, setCurrentRebalanceTimestamp] = useState<number>()

  useEffect(() => {
    getTermOpened().then((data) => setVaults(data))
  }, [])

  useEffect(() => {
    if (!selectedVault) {
      return
    }
    getVaultRebalances(selectedVault).then((data: RebalancesType) => {
      setVaultRebalances(data)
      setCurrentRebalance(data[0])
      setCurrentRebalanceIndex(0)
    })
  }, [selectedVault])

  useEffect(() => {
    if (!selectedVault || !currentRebalance) {
      return
    }
    getFullPool(
      selectedVault.vault,
      selectedVault.token0,
      selectedVault.symbol0,
      selectedVault.token1,
      selectedVault.symbol1,
      currentRebalance.blockNumber
    ).then((data) => setPoolsData(data))
  }, [selectedVault, currentRebalance])

  useEffect(() => {
    if (!currentRebalance) {
      return
    }
    getBlockTimestamp(currentRebalance.blockNumber).then((timestamp) =>
      setCurrentRebalanceTimestamp(Number(timestamp * 1000n))
    )
  }, [currentRebalance])

  const handleVaultSelectChange = (e: any) => {
    setCurrentRebalance(undefined)
    setCurrentRebalanceIndex(undefined)
    setSelectedVault(vaults!.find((vault) => vault.vault === e.target.value))
  }

  const formatTokenBalancesBefore = () => {
    if (!poolsData || !selectedVault) {
      return ''
    }

    return `${parseFloat(formatUnits(poolsData.token0BalanceBefore, poolsData.decimals0)).toFixed(2)} ${
      selectedVault.symbol0
    } + ${parseFloat(formatUnits(poolsData.token1BalanceBefore, poolsData.decimals1)).toFixed(2)} ${
      selectedVault.symbol1
    }`
  }

  const formatTokenBalancesAfter = () => {
    if (!poolsData || !selectedVault) {
      return ''
    }

    return `${parseFloat(formatUnits(poolsData.token0BalanceAfter, poolsData.decimals0)).toFixed(2)} ${
      selectedVault.symbol0
    } + ${parseFloat(formatUnits(poolsData.token1BalanceAfter, poolsData.decimals1)).toFixed(2)} ${
      selectedVault.symbol1
    }`
  }

  const handleNextRebalance = () => {
    setCurrentRebalanceIndex((prevIndex) => {
      if (prevIndex === undefined || !vaultRebalances) {
        return
      }
      const newIndex = prevIndex + 1
      if (newIndex < vaultRebalances.length) {
        setCurrentRebalance(vaultRebalances[newIndex])
        return newIndex
      }
      return prevIndex // Stay on the last item if at the end
    })
  }

  const handlePreviousRebalance = () => {
    setCurrentRebalanceIndex((prevIndex) => {
      if (prevIndex === undefined || !vaultRebalances) {
        return
      }
      const newIndex = prevIndex - 1
      if (newIndex >= 0) {
        setCurrentRebalance(vaultRebalances[newIndex])
        return newIndex
      }
      return prevIndex // Stay on the first item if at the start
    })
  }

  const CustomTooltip = ({ active, payload, currentPool }: any) => {
    if (active && payload && poolsData && selectedVault) {
      const tick = payload[0].payload
      const pool = currentPool
      return (
        <div className="custom-tooltip">
          {tick.isCurrent ? (
            <div>
              <p className="tooltip-label">
                {selectedVault.symbol0} locked: {tick.liquidityLockedToken0.toFixed(6)}
              </p>
              <p className="tooltip-label">
                {selectedVault.symbol1} locked: {tick.liquidityLockedToken1.toFixed(6)}
              </p>
            </div>
          ) : tick.tickIdx < pool.tickCurrent ? (
            <p className="tooltip-label">
              {pool.token0.symbol} locked: {tick.liquidityLockedToken0.toFixed(6)}
            </p>
          ) : (
            <p className="tooltip-label">
              {pool.token1.symbol} locked: {tick.liquidityLockedToken1.toFixed(6)}
            </p>
          )}
          <p className="tooltip-label">
            Price {pool.token0.symbol}: {tick.price0.toFixed(6)}
            {pool.token1.symbol}
          </p>
          <p className="tooltip-label">
            Price {pool.token1.symbol}: {tick.price1.toFixed(6)}
            {pool.token0.symbol}
          </p>
        </div>
      )
    } else {
      return null
    }
  }
  if (!vaults) {
    return <div>Loading vaults...</div>
  }

  return (
    <div className="App" style={{ minWidth: '800px' }}>
      {CurrentConfig.rpc.mainnet === '' && <h2 className="error">Please set your mainnet RPC URL in config.ts</h2>}
      <div>
        <select onChange={handleVaultSelectChange} defaultValue={''}>
          <option value="" disabled>
            Select a vault...
          </option>
          {vaults.map((vault, index) => (
            <option key={index} value={vault.vault}>
              {vault.symbol0} / {vault.symbol1}
            </option>
          ))}
        </select>
      </div>
      {currentRebalance && currentRebalanceIndex !== undefined && vaultRebalances ? (
        <div>
          <h2>
            Date: {currentRebalanceTimestamp ? new Date(currentRebalanceTimestamp).toLocaleDateString() : 'loading'}
          </h2>
          <button onClick={handlePreviousRebalance} disabled={currentRebalanceIndex === 0}>
            Previous Rebalance
          </button>
          <button onClick={handleNextRebalance} disabled={currentRebalanceIndex === vaultRebalances.length - 1}>
            Next Rebalance
          </button>
          <h3>vault before: {formatTokenBalancesBefore()}</h3>
          <h3>vault after: {formatTokenBalancesAfter()}</h3>
          {poolsData && selectedVault ? (
            Object.entries(poolsData.pools).map(([poolAddress, poolData]) => (
              <div key={poolAddress} className="pool-data">
                <h3>
                  Pool: {selectedVault.symbol0} / {selectedVault.symbol1} {`${poolData.fee / 10000} %`}
                </h3>
                <h4>
                  Price before: 1 {selectedVault.symbol0} = {poolData.poolBefore.token0Price.toFixed(6)}{' '}
                  {selectedVault.symbol1}
                </h4>
                <h4>
                  Price before: 1 {selectedVault.symbol1} = {poolData.poolBefore.token1Price.toFixed(6)}{' '}
                  {selectedVault.symbol0}
                </h4>
                <h4>State before:</h4>
                <h4>positions before:</h4>
                {poolData.positionsBefore.map((x, i) => (
                  <div key={i.toString()} className="pool-data">
                    <h3>
                      Lower tick:{' '}
                      {x.token0PriceLower
                        .quote(
                          CurrencyAmount.fromRawAmount(
                            poolsData.token0,
                            parseUnits('1', poolsData.decimals0).toString()
                          )
                        )
                        .toFixed(6)}
                    </h3>
                    <h3>
                      Upper tick:{' '}
                      {x.token0PriceUpper
                        .quote(
                          CurrencyAmount.fromRawAmount(
                            poolsData.token0,
                            JSBI.BigInt(parseUnits('1', poolsData.decimals0).toString())
                          )
                        )
                        .toFixed(6)}
                    </h3>
                    <h3>
                      {x.amount0.toFixed(2)} {selectedVault.symbol0} + {x.amount1.toFixed(2)} {selectedVault.symbol1}
                    </h3>
                  </div>
                ))}
                <ResponsiveContainer height={400}>
                  <BarChart
                    width={500}
                    height={300}
                    data={poolData.ticksBefore}
                    margin={{
                      top: 30,
                      right: 20,
                      left: 20,
                      bottom: 30,
                    }}
                    barGap={0}>
                    <XAxis tick={false} />
                    <YAxis tick={false} axisLine={false} padding={{ top: 0, bottom: 2 }} />
                    <Tooltip isAnimationActive={true} content={<CustomTooltip currentPool={poolData.poolBefore} />} />
                    <Bar dataKey="liquidityActive" fill="#2172E5" isAnimationActive={true}>
                      {poolData.ticksBefore.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#F51E87' : '#2172E5'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <h4>
                  Price after: 1 {selectedVault.symbol0} = {poolData.poolAfter.token0Price.toFixed(6)}{' '}
                  {selectedVault.symbol1}
                </h4>
                <h4>
                  Price after: 1 {selectedVault.symbol1} = {poolData.poolAfter.token1Price.toFixed(6)}{' '}
                  {selectedVault.symbol0}
                </h4>
                <h4>State after:</h4>
                <h4>positions after:</h4>
                {poolData.positionsAfter.map((x, i) => (
                  <div key={i.toString()} className="pool-data">
                    <h3>
                      Lower tick:{' '}
                      {x.token0PriceLower
                        .quote(
                          CurrencyAmount.fromRawAmount(
                            poolsData.token0,
                            parseUnits('1', poolsData.decimals0).toString()
                          )
                        )
                        .toFixed(6)}
                    </h3>
                    <h3>
                      Upper tick:{' '}
                      {x.token0PriceUpper
                        .quote(
                          CurrencyAmount.fromRawAmount(
                            poolsData.token0,
                            parseUnits('1', poolsData.decimals0).toString()
                          )
                        )
                        .toFixed(6)}
                    </h3>
                    <h3>
                      {x.amount0.toFixed(2)} {selectedVault.symbol0} + {x.amount1.toFixed(2)} {selectedVault.symbol1}
                    </h3>
                  </div>
                ))}
                <ResponsiveContainer height={400}>
                  <BarChart
                    width={500}
                    height={300}
                    data={poolData.ticksAfter}
                    margin={{
                      top: 30,
                      right: 20,
                      left: 20,
                      bottom: 30,
                    }}
                    barGap={0}>
                    <XAxis tick={false} />
                    <YAxis tick={false} axisLine={false} padding={{ top: 0, bottom: 2 }} />
                    <Tooltip isAnimationActive={true} content={<CustomTooltip currentPool={poolData.poolBefore} />} />
                    <Bar dataKey="liquidityActive" fill="#2172E5" isAnimationActive={true}>
                      {poolData.ticksAfter.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#F51E87' : '#2172E5'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))
          ) : (
            <p>No pools data available or loading...</p>
          )}
        </div>
      ) : (
        <p>loading rebalances...</p>
      )}
    </div>
  )
}

export default Example
