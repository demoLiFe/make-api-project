export type SetupUsageMode = 'external' | 'demo'

export interface SetupStatus {
  status: boolean
  root_init: boolean
  database_type: string
  DemoSiteEnabled?: boolean
}

export interface SetupFormValues {
  username: string
  password: string
  confirmPassword: string
  usageMode: SetupUsageMode
}

export interface SetupResponse {
  success: boolean
  message?: string
  data?: SetupStatus
}
