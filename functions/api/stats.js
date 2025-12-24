// functions/api/stats.js
export async function onRequest(context) {
  const API_KEY = context.env.ADSTERRA_API_KEY;
  if (!API_KEY) return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });

  const url = new URL(context.request.url);
  const startDate = url.searchParams.get("start_date");
  const endDate = url.searchParams.get("end_date");
  const groupBy = url.searchParams.get("group_by") || "date";
  
  // Ambil Parameter Filter
  const placementId = url.searchParams.get("placement"); // Filter Placement
  const domainId = url.searchParams.get("domain");       // Filter Domain
  const countryCode = url.searchParams.get("country");   // Filter Country

  let finalStart = startDate, finalFinish = endDate;
  if(!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);
      finalFinish = end.toISOString().split('T')[0];
      finalStart = start.toISOString().split('T')[0];
  }

  // Base URL
  let adsterraUrl = `https://api3.adsterratools.com/publisher/stats.json?start_date=${finalStart}&finish_date=${finalFinish}&group_by=${groupBy}`;
  
  // Append Filters jika ada
  if (placementId && placementId !== 'all') adsterraUrl += `&placement_ids=${placementId}`;
  if (domainId && domainId !== 'all') adsterraUrl += `&domain=${domainId}`;
  if (countryCode && countryCode !== 'all') adsterraUrl += `&country=${countryCode}`;

  try {
    const response = await fetch(adsterraUrl, {
      headers: { "Accept": "application/json", "X-API-Key": API_KEY }
    });
    
    if (!response.ok) {
        const errText = await response.text();
        return new Response(JSON.stringify({ status: 'error', error: `Adsterra (${response.status}): ${errText}` }), { status: response.status });
    }
    
    const data = await response.json();
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ status: 'error', error: err.message }), { status: 500 });
  }
}
