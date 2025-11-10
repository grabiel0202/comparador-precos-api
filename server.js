app.get("/produtos", async (req, res) => {
  const query = req.query.q || "notebook";
  const apiKey = process.env.SCRAPER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: "❌ SCRAPER_API_KEY não configurada." });
  }

  const targetUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}`;
  const scraperUrl = `https://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}`;

  try {
    console.log("🔎 Buscando produtos com query:", query);
    const response = await fetch(scraperUrl);

    console.log("🛰️ Status da resposta ScraperAPI:", response.status);

    const text = await response.text();
    console.log("📦 Retorno bruto (primeiros 300 chars):", text.slice(0, 300));

    if (!response.ok) {
      return res.status(response.status).json({ message: "Erro ao acessar ScraperAPI" });
    }

    const data = JSON.parse(text);

    if (!data.results || data.results.length === 0) {
      console.log("⚠️ Nenhum produto encontrado na resposta.");
      return res.status(404).json({ message: "Nenhum produto encontrado." });
    }

    const produtos = data.results.slice(0, 10).map((item) => ({
      id: item.id,
      nome: item.title,
      preco: item.price,
      imagem: item.thumbnail,
      link: item.permalink,
    }));

    res.json(produtos);
  } catch (error) {
    console.error("⚠️ Erro ao buscar produtos:", error);
    res.status(500).json({ message: "Erro interno ao buscar produtos." });
  }
});
