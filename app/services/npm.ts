export interface NpmProxyHost {
  id: number
  domain_names: string[]
  forward_scheme: string
  forward_host: string
  forward_port: number
  ssl_forced: boolean
  enabled: boolean
  meta: { nginx_online: boolean, nginx_err: string | null }
}

export interface NpmCertificate {
  id: number
  provider: string
  domain_names: string[]
  expires_on: string
}

// _baseUrl and _token are kept for signature compatibility but unused —
// Bearer token lifecycle is managed by the server-side proxy at /api/proxy/npm
export function createNpmService(_baseUrl: string, _token: string) {
  return {
    fetchProxyHosts: () =>
      $fetch<NpmProxyHost[]>('/api/proxy/npm/api/nginx/proxy-hosts'),
    fetchCertificates: () =>
      $fetch<NpmCertificate[]>('/api/proxy/npm/api/nginx/certificates')
  }
}
