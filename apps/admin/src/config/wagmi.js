import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { polygon, bsc } from '@reown/appkit/networks'

// 1. Get a project ID at https://cloud.reown.com
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'be6c4bb8f355023de996ba6748be22e2'

// 2. Create Wagmi Adapter
export const networks = [polygon, bsc]

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})

export const config = wagmiAdapter.wagmiConfig

// 3. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'SwapStore Admin',
    description: 'SwapStore Admin Dashboard',
    url: window.location.origin,
    icons: ['https://avatars.githubusercontent.com/u/179229932']
  },
  themeMode: 'dark',
  themeVariables: {
    "--w3m-font-family": "Roboto, sans-serif",
    "--w3m-accent-color": "#10b981", // emerald-500
  },
  features: {
    analytics: true,
    email: false,
    socials: false,
    onramp: false,
    swaps: false,
    send: false,
    receive: false,
    history: false,
    ens: false
  },
  enableEIP6963: true
})
