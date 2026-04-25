import client from './client'

export const settingsApi = {
  get: () => client.get('/settings'),
  save: (data: any) => client.put('/settings', data),
  reset: () => client.post('/settings/reset'),
}