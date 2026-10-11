import { app } from './app.js'
import { env } from './config/env.js'

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason)
})

app.listen(env.port, () => {
  console.log(`Personal OS API listening on http://localhost:${env.port} (${env.nodeEnv})`)
})
