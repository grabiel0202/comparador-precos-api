app.get("/produtos", async (req, res) => {
  try {
    const termo = req.query.q || "notebook"; // permite busca dinâmica
    console.log(`🔍 Buscando produtos por: ${termo}`);

    const response = await fetch(
      `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(termo)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("❌ Erro na resposta do Mercado Livre:", response.status);
      return res.status(500).json({ message: "Erro ao buscar produtos no Mercado Livre." });
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.warn("⚠️ Nenhum produto retornado pela API.");
      return res.status(404).json({ message: "Nenhum produto encontrado." });
    }

    const produtos = data.results.slice(0, 10).map((item) => ({
      id: item.id,
      nome: item.title,
      preco: item.price,
      imagem: item.thumbnail,
      link: item.permalink, // adiciona link direto
      loja: item.seller?.nickname || "Desconhecido", // nome do vendedor
    }));

    res.json(produtos);
  } catch (error) {
    console.error("💥 Erro interno:", error);
    res.status(500).json({ message: "Erro interno ao buscar produtos.", error });
  }
});
