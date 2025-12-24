// functions/api/stats.js
// VERSI FINAL - FIXED URL & PARAMETERS

export async function onRequest(context) {
  // 1. Ambil API KEY
  const API_KEY = context.env.ADSTERRA_API_KEY;
  if (!API_KEY) {
    return new Response(JSON.stringify({ 
      status: 'error', 
      error: "Sistem Error: API Key belum terbaca di Cloudflare. Silakan Retry Deployment." 
    }), { status: 500 });
  }

  // 2. Ambil parameter dari Frontend
  const url = new URL(context.request.url);
  const startDate = url.searchParams.get("start_date");
  const endDate = url.searchParams.get("end_date"); // Frontend mengirim 'end_date'
  const groupBy = url.searchParams.get("group_by") || "date"; 

  // Default tanggal jika kosong (7 hari terakhir)
  let finalStart = startDate;
  let finalFinish = endDate;
  
  if(!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);
      finalFinish = end.toISOString().split('T')[0];
      finalStart = start.toISOString().split('T')[0];
  }

  // 3. KONSTRUKSI URL ADSTERRA (CORRECTED)
  // Perbaikan 1: Hapus '/v3' dari URL path
  // Perbaikan 2: Ubah parameter 'end_date' menjadi 'finish_date' sesuai dokumentasi resmi
  const adsterraUrl = `https://api3.adsterratools.com/publisher/stats.json?start_date=${finalStart}&finish_date=${finalFinish}&group_by=${groupBy}`;

  try {
    const response = await fetch(adsterraUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-API-Key": API_KEY
      }
    });

    // Cek Status HTTP
    if (response.status === 401 || response.status === 403) {
        return new Response(JSON.stringify({ status: 'error', error: "Unauthorized: API Token Salah." }), { status: 401 });
    }

    if (!response.ok) {
        const text = await response.text();
        // Tampilkan error detail dari Adsterra jika ada
        return new Response(JSON.stringify({ status: 'error', error: `Adsterra Error (${response.status}): ${text}` }), { status: response.status });
    }

    const data = await response.json();
    
    // Sukses
    return new Response(JSON.stringify(data), {
      headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=600" // Cache 10 menit
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ status: 'error', error: `Internal Server Error: ${err.message}` }), { status: 500 });
  }
}
