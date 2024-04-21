import React, { useState, useEffect } from 'react'
import './Example.css'
import { CurrentConfig } from '../config'
import {
  getBlockTimestamp,
  getTermOpened,
  getVaultRebalances,
} from '../libs/arrakis'
import { BarChartTick } from '../libs/interfaces'
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { Pool } from '@uniswap/v3-sdk'
import { Address } from 'viem'
import { getFullPool } from '../libs/pool-data'

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
  const [poolsData, setPoolsData] =
    useState<Awaited<ReturnType<typeof getFullPool>>>()
  const [selectedVault, setSelectedVault] = useState<VaultData>()
  const [vaultRebalances, setVaultRebalances] = useState<RebalancesType>()
  const [currentRebalance, setCurrentRebalance] =
    useState<SingleRebalanceType>()
  const [currentRebalanceIndex, setCurrentRebalanceIndex] = useState<number>()
  const [currentRebalanceTimestamp, setCurrentRebalanceTimestamp] =
    useState<number>()

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
      Number(currentRebalance.blockNumber)
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
                {selectedVault.symbol0} locked:{' '}
                {tick.liquidityLockedToken0.toFixed(3)}
              </p>
              <p className="tooltip-label">
                {selectedVault.symbol1} locked:{' '}
                {tick.liquidityLockedToken1.toFixed(3)}
              </p>
            </div>
          ) : tick.tickIdx < pool.tickCurrent ? (
            <p className="tooltip-label">
              {pool.token0.symbol} locked:{' '}
              {tick.liquidityLockedToken0.toFixed(3)}
            </p>
          ) : (
            <p className="tooltip-label">
              {pool.token1.symbol} locked:{' '}
              {tick.liquidityLockedToken1.toFixed(3)}
            </p>
          )}
          <p className="tooltip-label">
            Price {pool.token0.symbol}: {tick.price0.toFixed(4)}
            {pool.token1.symbol}
          </p>
          <p className="tooltip-label">
            Price {pool.token1.symbol}: {tick.price1.toFixed(4)}
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
    <div className="App">
      {CurrentConfig.rpc.mainnet === '' && (
        <h2 className="error">Please set your mainnet RPC URL in config.ts</h2>
      )}
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
      {currentRebalance &&
      currentRebalanceIndex !== undefined &&
      vaultRebalances ? (
        <div>
          <h2>
            Date:{' '}
            {currentRebalanceTimestamp
              ? new Date(currentRebalanceTimestamp).toLocaleDateString()
              : 'loading'}
          </h2>
          <button
            onClick={handlePreviousRebalance}
            disabled={currentRebalanceIndex === 0}>
            Previous Rebalance
          </button>
          <button
            onClick={handleNextRebalance}
            disabled={currentRebalanceIndex === vaultRebalances.length - 1}>
            Next Rebalance
          </button>
          {poolsData && selectedVault ? (
            Object.entries(poolsData).map(([poolAddress, poolData]) => (
              <div key={poolAddress} className="pool-data">
                <h2>
                  Pool: {selectedVault.symbol0} / {selectedVault.symbol1}
                </h2>
                <h2>Fee: {`${poolData.fee / 10000} %`}</h2>{' '}
                <h3>
                  Price before: 1 {selectedVault.symbol0} ={' '}
                  {poolData.poolBefore.token0Price.toFixed(4)}{' '}
                  {selectedVault.symbol1}
                </h3>
                <h3>
                  Price before: 1 {selectedVault.symbol1} ={' '}
                  {poolData.poolBefore.token1Price.toFixed(4)}{' '}
                  {selectedVault.symbol0}
                </h3>
                <h3>State before:</h3>
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
                    <YAxis
                      tick={false}
                      axisLine={false}
                      padding={{ top: 0, bottom: 2 }}
                    />
                    <Tooltip
                      isAnimationActive={true}
                      content={
                        <CustomTooltip currentPool={poolData.poolBefore} />
                      }
                    />
                    <Bar
                      dataKey="liquidityActive"
                      fill="#2172E5"
                      isAnimationActive={true}>
                      {poolData.ticksBefore.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isCurrent ? '#F51E87' : '#2172E5'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <h3>
                  Price after: 1 {selectedVault.symbol0} ={' '}
                  {poolData.poolAfter.token0Price.toFixed(4)}{' '}
                  {selectedVault.symbol1}
                </h3>
                <h3>
                  Price after: 1 {selectedVault.symbol1} ={' '}
                  {poolData.poolAfter.token1Price.toFixed(4)}{' '}
                  {selectedVault.symbol0}
                </h3>
                <h3>State after:</h3>
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
                    <YAxis
                      tick={false}
                      axisLine={false}
                      padding={{ top: 0, bottom: 2 }}
                    />
                    <Tooltip
                      isAnimationActive={true}
                      content={
                        <CustomTooltip currentPool={poolData.poolBefore} />
                      }
                    />
                    <Bar
                      dataKey="liquidityActive"
                      fill="#2172E5"
                      isAnimationActive={true}>
                      {poolData.ticksAfter.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isCurrent ? '#F51E87' : '#2172E5'}
                        />
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
