import { createApiAuthTenantModule } from './apiAuthTenantModule'
import { createApiBusinessModule } from './apiBusinessModule'
import { createApiMastersModule } from './apiMastersModule'
import { createRequest } from './apiRequestCore'

export {
  BACKEND_MODULES,
  type BackendModuleDefinition,
  type EndpointDefinition,
} from './apiMetadata'
export { getLastLoginAttemptDebug } from './apiAuthTenantModule'
export type { LoginAttemptDebug } from './apiAuthTenantModule'
export { clearAuth, getSavedAuth, saveAuth } from './apiStorage'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString().trim() || 'http://localhost:8081'
const request = createRequest(API_BASE_URL)

const authTenantApi = createApiAuthTenantModule({ request })
const mastersApi = createApiMastersModule({ request })
const businessApi = createApiBusinessModule({ request })

export const api = {
  ...authTenantApi,
  ...mastersApi,
  ...businessApi,
}