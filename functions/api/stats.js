// functions/api/stats.js
export async function onRequest(context) {
  const API_KEY = context.env.ADSTERRA_API_KEY;
  if (!API_KEY) return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });

  const url = new URL(context.request.url);
  const startDate = url.searchParams.get("start_date");
  const endDate = url.searchParams.get("end_date"); // Frontend kirim end_date
  const groupBy = url.searchParams.get("group_by") || "date";
  const placementId = url.searchParams.get("placement_id");

  // Default Tanggal
  let finalStart = startDate, finalFinish = endDate;
  if(!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);
      // Format YYYY-MM-DD
      finalFinish = end.toISOString().split('T')[0];
      finalStart = start.toISOString().split('T')[0];
  }

  // UPDATE SESUAI DOC: Gunakan 'finish_date' bukan 'end_date'
  let adsterraUrl = `https://api3.adsterratools.com/publisher/stats.json?start_date=${finalStart}&finish_date=${finalFinish}&group_by=${groupBy}`;
  
  if (placementId) {
      adsterraUrl += `&placement_ids=${placementId}`;
  }

  try {
    const response = await fetch(adsterraUrl, {
      headers: { "Accept": "application/json", "X-API-Key": API_KEY }
    });
    
    const data = await response.json();
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ status: 'error', error: err.message }), { status: 500 });
  }
}
