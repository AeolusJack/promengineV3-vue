import client from './client'

export const mcpApi = {
  listServers: () => client.get('/mcp/servers'),
  addServer: (name: string, url: string) => client.post('/mcp/servers', { name, url }),
  deleteServer: (id: string) => client.delete(`/mcp/servers/${id}`),
}