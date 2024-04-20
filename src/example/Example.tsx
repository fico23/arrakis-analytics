import React, { useState, useCallback, useEffect } from 'react'
import './Example.css'
import { CurrentConfig } from '../config'
import { getFullPool } from '../libs/pool-data'
import { getTermOpened } from '../libs/arrakis'
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
import { Address, getAddress } from 'viem'

export interface PoolData {
  pool: Pool
  ticks: BarChartTick[]
}

const Example = () => {
  const [vaults, setVaults] =
    useState<{ vault: `0x${string}`; token0: Address; token1: Address }[]>()
  const [poolData, setPool] = useState<PoolData | undefined>()
  const [selectedVault, setSelectedVault] = useState<Address | undefined>()

  const onReload = useCallback(async () => {
    setPool(undefined)
    setPool(await getFullPool())
  }, [])

  useEffect(() => {
    // getFullPool().then((data) => setPool(data))
    getTermOpened().then((data) => setVaults(data))
  }, [])

  useEffect(() => {
    console.log('selectedvault', selectedVault)
    // getVaultAnayltics().then(data => setVaultAnalytics(data))
  }, [selectedVault])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && poolData) {
      const tick = payload[0].payload
      const pool = poolData.pool
      return (
        <div className="custom-tooltip">
          {tick.isCurrent ? (
            <div>
              <p className="tooltip-label">
                {pool.token0.symbol} locked:{' '}
                {tick.liquidityLockedToken0.toFixed(3)}
              </p>
              <p className="tooltip-label">
                {pool.token1.symbol} locked:{' '}
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
        <select onChange={(e) => setSelectedVault(getAddress(e.target.value))}>
          {vaults.map((vault, index) => (
            <option key={index} value={vault.vault}>
              {vault.token0} / {vault.token1}
            </option>
          ))}
        </select>
      </div>
      <div className="pool-data">
        <h2>
          Pool: {poolData?.pool.token0.symbol} / {poolData?.pool.token1.symbol}
        </h2>
        <h3>
          Price: 1 {poolData?.pool.token0.symbol} ={' '}
          {poolData?.pool.token0Price.toFixed(2)} {poolData?.pool.token1.symbol}
        </h3>
        <h3>Liquidity density:</h3>
      </div>
      <ResponsiveContainer width="60%" height={400}>
        {poolData !== undefined ? (
          <BarChart
            width={500}
            height={800}
            data={poolData.ticks}
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
            <Tooltip isAnimationActive={true} content={<CustomTooltip />} />
            <Bar
              dataKey="liquidityActive"
              fill="#2172E5"
              isAnimationActive={true}>
              {poolData.ticks?.map((entry, index) => {
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isCurrent ? '#F51E87' : '#2172E5'}
                  />
                )
              })}
            </Bar>
          </BarChart>
        ) : (
          <p>Loading ...</p>
        )}
      </ResponsiveContainer>
      {poolData !== undefined ? (
        <button onClick={onReload} className="btn">
          <p>Update</p>
        </button>
      ) : (
        <button className="btn-inactive">
          <p>Loading</p>
        </button>
      )}
    </div>
  )
}

export default Example
