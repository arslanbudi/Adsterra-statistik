// functions/api/stats.js

export async function onRequest(context) {
  // 1. Cek apakah API Key terbaca
  const API_KEY = context.env.ADSTERRA_API_KEY;
  if (!API_KEY) {
    return new Response(JSON.stringify({ 
      status: 'error', 
      error: "Sistem Error: API Key belum terbaca di Cloudflare Environment Variables. Silakan Retry Deployment." 
    }), { status: 500 });
  }

  // 2. Ambil parameter
  const url = new URL(context.request.url);
  const startDate = url.searchParams.get("start_date");
  const endDate = url.searchParams.get("end_date");
  
  // Jika tanggal kosong (akses langsung browser), set default 7 hari
  let finalStart = startDate;
  let finalEnd = endDate;
  if(!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);
      finalEnd = end.toISOString().split('T')[0];
      finalStart = start.toISOString().split('T')[0];
  }

  const groupBy = url.searchParams.get("group_by") || "date"; 

  // 3. Request ke Adsterra
const adsterraUrl = `https://api3.adsterratools.com/publisher/stats.json?start_date=${finalStart}&end_date=${finalEnd}&group_by=${groupBy}`;
  try {
    const response = await fetch(adsterraUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-API-Key": API_KEY
      }
    });

    // Cek jika API Token ditolak Adsterra
    if (response.status === 401 || response.status === 403) {
        return new Response(JSON.stringify({ 
            status: 'error', 
            error: "Token API Ditolak Adsterra (Unauthorized). Cek apakah Token benar." 
        }), { status: 401 });
    }

    if (!response.ok) {
        const text = await response.text();
        return new Response(JSON.stringify({ 
            status: 'error', 
            error: `Adsterra Error (${response.status}): ${text}` 
        }), { status: response.status });
    }

    const data = await response.json();
    
    // Sukses
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ 
        status: 'error', 
        error: `Internal Server Error: ${err.message}` 
    }), { status: 500 });
  }
}
