async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export function adapt(netlifyHandler) {
  return async function vercelHandler(req, res) {
    const url = new URL(req.url || "/", `https://${req.headers.host || "localhost"}`);
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) {
      if (value !== undefined)
        headers.set(name, Array.isArray(value) ? value.join(", ") : value);
    }
    const init = { method: req.method || "GET", headers };
    if (!['GET', 'HEAD'].includes(init.method)) {
      init.body = await readBody(req);
      init.duplex = "half";
    }
    const response = await netlifyHandler(new Request(url, init));
    res.statusCode = response.status;
    response.headers.forEach((value, name) => res.setHeader(name, value));
    res.end(Buffer.from(await response.arrayBuffer()));
  };
}
