const BASE = 'https://sheets.googleapis.com/v4/spreadsheets'
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID

export class AuthExpiredError extends Error {
  constructor() {
    super('Token expired')
    this.name = 'AuthExpiredError'
  }
}

async function request(token: string, url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (res.status === 401) throw new AuthExpiredError()
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(`Sheets API error ${res.status}: ${JSON.stringify(body)}`)
  }
  return res
}

export async function getRows(token: string, range: string): Promise<string[][]> {
  const url = `${BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`
  const res = await request(token, url)
  const data = await res.json()
  return data.values ?? []
}

export async function appendRow(token: string, range: string, values: string[]): Promise<void> {
  const url = `${BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`
  await request(token, url, {
    method: 'POST',
    body: JSON.stringify({ values: [values] }),
  })
}

export async function updateRow(token: string, range: string, values: string[]): Promise<void> {
  const url = `${BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`
  await request(token, url, {
    method: 'PUT',
    body: JSON.stringify({ values: [values] }),
  })
}

export async function deleteRow(token: string, sheetId: number, rowIndex: number): Promise<void> {
  const url = `${BASE}/${SPREADSHEET_ID}:batchUpdate`
  await request(token, url, {
    method: 'POST',
    body: JSON.stringify({
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      }],
    }),
  })
}

interface SheetMeta {
  sheetId: number
  title: string
}

export async function getSheetMetadata(token: string): Promise<SheetMeta[]> {
  const url = `${BASE}/${SPREADSHEET_ID}?fields=sheets(properties(sheetId,title))`
  const res = await request(token, url)
  const data = await res.json()
  return data.sheets.map((s: { properties: SheetMeta }) => s.properties)
}
