import { defineConfig } from '@wagmi/cli'
import {ArrakisVaultV2ABI} from './src/libs/abis/ArrakisVaultV2ABI'
 
export default defineConfig({
  out: 'src/generated.ts',
  contracts: [
    {
      name: 'arrakisVaultV2',
      abi: ArrakisVaultV2ABI,
    },
  ],
})