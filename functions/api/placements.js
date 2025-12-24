// functions/api/placements.js
export async function onRequest(context) {
  const API_KEY = context.env.ADSTERRA_API_KEY;

  if (!API_KEY) {
    return new Response(JSON.stringify({ status: 'error', error: "API Key missing" }), { status: 500 });
  }

  // URL API Placements (Tanpa /v3/)
  const url = `https://api3.adsterratools.com/publisher/placements.json`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-API-Key": API_KEY
      }
    });

    if (!response.ok) {
       return new Response(JSON.stringify({ status: 'error', error: `Adsterra Error: ${response.status}` }), { status: response.status });
    }

    const data = await response.json();

    // Cache 1 jam karena nama placement jarang berubah
    return new Response(JSON.stringify(data), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600" 
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ status: 'error', error: err.message }), { status: 500 });
  }
}
