// functions/api/metadata.js
export async function onRequest(context) {
  const API_KEY = context.env.ADSTERRA_API_KEY;

  if (!API_KEY) {
    return new Response(JSON.stringify({ status: 'error', error: "API Key missing" }), { status: 500 });
  }

  try {
    // KITA AMBIL DUA SUMBER DATA SEKALIGUS: PLACEMENTS DAN DOMAINS
    const [resPlacements, resDomains] = await Promise.all([
      fetch(`https://api3.adsterratools.com/publisher/placements.json`, { headers: { "X-API-Key": API_KEY } }),
      fetch(`https://api3.adsterratools.com/publisher/domains.json`, { headers: { "X-API-Key": API_KEY } })
    ]);

    const jsonPlacements = await resPlacements.json();
    const jsonDomains = await resDomains.json();

    // Gabungkan data
    const result = {
      placements: jsonPlacements.items || [],
      domains: jsonDomains.items || []
    };

    // Cache 1 jam agar cepat
    return new Response(JSON.stringify(result), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600" 
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ status: 'error', error: err.message }), { status: 500 });
  }
}
