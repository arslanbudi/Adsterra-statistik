// functions/api/stats.js
export async function onRequest(context) {
  const API_KEY = context.env.ADSTERRA_API_KEY;
  if (!API_KEY) return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });

  const url = new URL(context.request.url);
  // Ambil Parameter
  const startDate = url.searchParams.get("start_date");
  const endDate = url.searchParams.get("end_date");
  const groupBy = url.searchParams.get("group_by") || "date";
  
  // Ambil Filter
  const placementId = url.searchParams.get("placement");
  const domainId = url.searchParams.get("domain");
  const countryCode = url.searchParams.get("country");

  // Default Tanggal (7 Hari)
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
  
  // LOGIKA FILTER YANG DIPERBAIKI (FIX ERROR 422)
  // Adsterra strict: ID harus valid & format array untuk placement_ids
  
  if (placementId && placementId !== 'all') {
      // Gunakan sintaks array agar server Adsterra tidak bingung
      adsterraUrl += `&placement_ids[]=${placementId}`;
  }
  
  if (domainId && domainId !== 'all') {
      adsterraUrl += `&domain=${domainId}`;
  }
  
  if (countryCode && countryCode !== 'all') {
      adsterraUrl += `&country=${countryCode}`;
  }

  try {
    const response = await fetch(adsterraUrl, {
      headers: { "Accept": "application/json", "X-API-Key": API_KEY }
    });
    
    // Fail-safe: Jika error, kirim JSON kosong jangan error 500
    if (!response.ok) {
        // const err = await response.text(); // Debugging purposes
        return new Response(JSON.stringify({ items: [] }), { headers: { "Content-Type": "application/json" } });
    }
    
    const data = await response.json();
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ items: [] }), { status: 200 });
  }
}
