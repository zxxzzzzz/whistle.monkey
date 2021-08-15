export async function post(url: string, data: object) {
  const request = new Request(url, {
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
    method: 'post',
  });
  try {
    const res = await fetch(request);
    return res.json();
  } catch (error) {
    return undefined;
  }
}
export async function get(url: string, data?: any) {
  if (data) {
    const paramsStr = new URLSearchParams(data);
    url = `${url}?${paramsStr.toString()}`
  }
  const request = new Request(url, {
    method: 'get',
  });
  try {
    const res = await fetch(request);
    return res.json();
  } catch (error) {
    return undefined;
  }
}

export async function setRoot(root: string) {
  return post('/cgi-bin/root', {
    path: root,
  });
}
export async function getRoot() {
  return get('/cgi-bin/root');
}