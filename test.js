const http = require('http');

async function run() {
  const fetch = (url, options) => new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });

  const regRes = await fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'test', email: 'test'+Date.now()+'@example.com', password: 'password' })
  });
  const token = JSON.parse(regRes.data).token;

  const wsRes = await fetch('http://localhost:8080/api/workspaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name: 'Workspace' })
  });
  const wsId = JSON.parse(wsRes.data).id;

  const convRes = await fetch('http://localhost:8080/api/ai/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ workspaceId: wsId, title: 'AI Conv' })
  });
  const convId = JSON.parse(convRes.data).id;

  const msgRes = await fetch(`http://localhost:8080/api/ai/conversations/${convId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ content: 'Hello AI' })
  });
  console.log('AI Msg Response:', msgRes.status, msgRes.data);

  const taskRes = await fetch(`http://localhost:8080/api/workspaces/${wsId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ title: 'Test task', description: 'Desc' })
  });
  console.log('Task Response:', taskRes.status, taskRes.data);
}
run();
