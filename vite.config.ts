import { defineConfig } from 'vitest/config'
import vize from '@vizejs/vite-plugin'

export default defineConfig({
  plugins: [vize({ vapor: true })],
  test: { environment: 'node' },
})
