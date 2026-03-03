export interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
  error?: string
}

export interface UserInfo {
  name: string
  email: string
  picture: string
}

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string
            scope: string
            callback: (response: TokenResponse) => void
            prompt?: string
          }): { requestAccessToken(config?: { prompt?: string }): void }
          revoke(token: string, callback?: () => void): void
        }
      }
    }
  }
}
