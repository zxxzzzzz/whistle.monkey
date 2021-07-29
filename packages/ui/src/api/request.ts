export async function post(url:string, data:object) {
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
export async function get(url:string, data:any) {
  const paramsStr = new URLSearchParams(data);
  const request = new Request(`${url}?${paramsStr.toString()}`, {
    method: 'get',
  });
  try {
    const res = await fetch(request);
    return res.json();
  } catch (error) {
    return undefined;
  }
}

export async function setRoot(root:string) {
  return post('/cgi-bin/root', {
    path:root,
  });
}