declare module "@ducanh2912/next-pwa" {
  import type { NextConfig } from "next"
  function withPWA(config: object): (nextConfig: NextConfig) => NextConfig
  export default withPWA
}
