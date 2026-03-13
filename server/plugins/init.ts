import { setPassword } from '../utils/password'

export default defineNitroPlugin(async () => {
  const envPassword = process.env.TILLER_PASSWORD
  if (envPassword) {
    await setPassword(envPassword)
  }
})
