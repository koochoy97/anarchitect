import type { TokenResponse, UserInfo } from '../types/google'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ')

let tokenClient: ReturnType<typeof window.google.accounts.oauth2.initTokenClient> | null = null

export function initTokenClient(
  onSuccess: (token: string) => void,
  onError: (error: string) => void,
) {
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response: TokenResponse) => {
      if (response.error) {
        onError(response.error)
      } else {
        onSuccess(response.access_token)
      }
    },
  })
}

export function requestAccessToken(prompt?: string) {
  if (!tokenClient) throw new Error('Token client not initialized')
  tokenClient.requestAccessToken(prompt ? { prompt } : undefined)
}

export function revokeToken(token: string) {
  window.google.accounts.oauth2.revoke(token, () => {})
}

export async function fetchUserInfo(token: string): Promise<UserInfo> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch user info')
  return res.json()
}
