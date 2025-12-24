// functions/api/stats.js
// VERSI FINAL 2.0 - Support Filtering by Placement ID

export async function onRequest(context) {
  const API_KEY = context.env.ADSTERRA_API_KEY;
  if (!API_KEY) {
    return new Response(JSON.stringify({ status: 'error', error: "API Key missing" }), { status: 500 });
  }

  const url = new URL(context.request.url);
  const startDate = url.searchParams.get("start_date");
  const endDate = url.searchParams.get("end_date");
  const groupBy = url.searchParams.get("group_by") || "date";
  
  // FITUR BARU: Ambil parameter placement_id
  const placementId = url.searchParams.get("placement_id");

  let finalStart = startDate;
  let finalFinish = endDate;
  
  if(!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);
      finalFinish = end.toISOString().split('T')[0];
      finalStart = start.toISOString().split('T')[0];
  }

  // Base URL
  let adsterraUrl = `https://api3.adsterratools.com/publisher/stats.json?start_date=${finalStart}&finish_date=${finalFinish}&group_by=${groupBy}`;
  
  // Jika ada request filter ID, tambahkan ke URL Adsterra
  // Parameter resmi Adsterra untuk filter adalah 'placement_ids'
  if (placementId) {
      adsterraUrl += `&placement_ids=${placementId}`;
  }

  try {
    const response = await fetch(adsterraUrl, {
      method: "GET",
      headers: { "Accept": "application/json", "X-API-Key": API_KEY }
    });

    if (response.status === 401) return new Response(JSON.stringify({ status: 'error', error: "Unauthorized" }), { status: 401 });
    if (!response.ok) {
        const text = await response.text();
        return new Response(JSON.stringify({ status: 'error', error: `Adsterra: ${text}` }), { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" } });

  } catch (err) {
    return new Response(JSON.stringify({ status: 'error', error: err.message }), { status: 500 });
  }
}
