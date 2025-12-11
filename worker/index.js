addEventListener("fetch", event => {
  event.respondWith(handle(event.request));
});

const ALLOWED_API_KEY = "YOUR_API_KEY_HERE"; // replace or use Wrangler secrets

async function handle(request) {
  const key = request.headers.get("x-api-key");
  if (!key || key !== ALLOWED_API_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }

  const url = new URL(request.url);
  if (url.pathname.startsWith("/data/")) {
    const date = url.pathname.replace("/data/", "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Response(JSON.stringify({ error: "Bad date format" }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }

    const rawUrl = `https://raw.githubusercontent.com/YOUR_GITHUB_USER/YOUR_REPO/main/scraper/data/${date}.json`;
    const resp = await fetch(rawUrl);
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "content-type": "application/json" }
      });
    }

    const body = await resp.text();
    return new Response(body, { headers: { "content-type": "application/json" } });
  }

  if (url.pathname === "/health") {
    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { "content-type": "application/json" }
    });
  }

  return new Response("Not found", { status: 404 });
}
