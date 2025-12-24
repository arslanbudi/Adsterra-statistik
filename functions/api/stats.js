// functions/api/stats.js
export async function onRequest(context) {
  const API_KEY = context.env.ADSTERRA_API_KEY;

  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "API Key missing on server" }), { status: 500 });
  }

  const url = new URL(context.request.url);
  const startDate = url.searchParams.get("start_date");
  const endDate = url.searchParams.get("end_date");
  
  // FITUR BARU: Menerima parameter group_by dari frontend
  // Default ke 'date' jika tidak ada request spesifik
  const groupBy = url.searchParams.get("group_by") || "date"; 

  // Validasi keamanan parameter agar user tidak input sembarangan
  const allowedGroups = ["date", "placement", "country", "domain"];
  if (!allowedGroups.includes(groupBy)) {
      return new Response(JSON.stringify({ error: "Invalid group_by parameter" }), { status: 400 });
  }

  // Request ke Adsterra dengan grouping yang dinamis
  const adsterraUrl = `https://api3.adsterratools.com/v3/publisher/stats.json?start_date=${startDate}&end_date=${endDate}&group_by=${groupBy}`;

  try {
    const response = await fetch(adsterraUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-API-Key": API_KEY
      }
    });

    if (!response.ok) {
        throw new Error(`Upstream API Error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { 
        "Content-Type": "application/json",
        // Cache 10 menit agar cepat saat member refresh halaman
        "Cache-Control": "public, max-age=600" 
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
