// functions/api/metadata.js
export async function onRequest(context) {
  const API_KEY = context.env.ADSTERRA_API_KEY;
  if (!API_KEY) return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });

  try {
    // Limit 2000 agar semua nama terambil
    const [resPlacements, resDomains] = await Promise.all([
      fetch(`https://api3.adsterratools.com/publisher/placements.json?limit=2000`, { headers: { "X-API-Key": API_KEY } }),
      fetch(`https://api3.adsterratools.com/publisher/domains.json?limit=2000`, { headers: { "X-API-Key": API_KEY } })
    ]);

    const jsonPlacements = await resPlacements.json();
    const jsonDomains = await resDomains.json();

    const result = {
      placements: jsonPlacements.items || [],
      domains: jsonDomains.items || []
    };

    return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
