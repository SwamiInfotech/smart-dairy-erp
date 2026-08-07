import { createApiAuthTenantModule } from './apiAuthTenantModule'
import { createApiConfigurationModule } from './apiConfigurationModule'
import { createApiBusinessModule } from './apiBusinessModule'
import { createApiMastersModule } from './apiMastersModule'
import { createBinaryRequest, createRequest } from './apiRequestCore'

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
const requestBinary = createBinaryRequest(API_BASE_URL)

const authTenantApi = createApiAuthTenantModule({ request })
const configurationApi = createApiConfigurationModule({ request })
const mastersApi = createApiMastersModule({ request })
const businessApi = createApiBusinessModule({ request, requestBinary })

export const api = {
  ...authTenantApi,
  ...configurationApi,
  ...mastersApi,
  ...businessApi,
}