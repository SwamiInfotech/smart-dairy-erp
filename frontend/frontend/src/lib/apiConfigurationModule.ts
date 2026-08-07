import type {
  CreateSmartDairyConfigurationRequest,
  SmartDairyConfigurationResponse,
  UpdateSmartDairyConfigurationRequest,
} from '../types/api'
import type { RequestFn } from './apiRequestCore'

type ApiConfigurationModuleDependencies = {
  request: RequestFn
}

export function createApiConfigurationModule({ request }: ApiConfigurationModuleDependencies) {
  return {
    getCurrentTenantConfiguration(token: string) {
      return request<SmartDairyConfigurationResponse>('GET', '/api/v1/smart-dairy-configuration/current/tenant', token)
    },

    getSmartDairyConfiguration(token: string, uuid: string) {
      return request<SmartDairyConfigurationResponse>('GET', `/api/v1/smart-dairy-configuration/${uuid}`, token)
    },

    createSmartDairyConfiguration(token: string, payload: CreateSmartDairyConfigurationRequest) {
      return request<SmartDairyConfigurationResponse>('POST', '/api/v1/smart-dairy-configuration', token, payload)
    },

    updateSmartDairyConfiguration(token: string, uuid: string, payload: UpdateSmartDairyConfigurationRequest) {
      return request<SmartDairyConfigurationResponse>('PUT', `/api/v1/smart-dairy-configuration/${uuid}`, token, payload)
    },

    deleteSmartDairyConfiguration(token: string, uuid: string) {
      return request<void>('DELETE', `/api/v1/smart-dairy-configuration/${uuid}`, token)
    },
  }
}
