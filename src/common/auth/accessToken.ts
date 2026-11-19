// Access Token은 새로고침하면 사라지는 메모리에만 보관한다.
let accessToken: string | null = null
let version = 0
let renew: (() => Promise<string>) | undefined
let invalidate: (() => void) | undefined

export const authSession = {
  getToken: () => accessToken,
  getVersion: () => version,
  replaceToken(token: string | null) {
    version += 1
    accessToken = token
  },
  setToken: (token: string | null) => {
    accessToken = token
  },
  configure(refresh: () => Promise<string>, clear: () => void) {
    renew = refresh
    invalidate = clear
  },
  refresh() {
    return (
      renew?.() ?? Promise.reject(new Error('인증 설정을 불러오지 못했습니다.'))
    )
  },
  clear() {
    if (invalidate) invalidate()
    else this.replaceToken(null)
  },
}
