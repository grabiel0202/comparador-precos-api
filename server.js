import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Rota de teste simples
app.get("/", (req, res) => {
  res.send("✅ API Comparador de Preços está online (ScraperAPI ativo)!");
});

// 🔹 Rota de produtos via ScraperAPI
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

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("⚠️ Falha ao converter resposta em JSON.");
      return res.status(500).json({ message: "Resposta inválida da ScraperAPI." });
    }

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

// 🔹 Porta dinâmica exigida pelo Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
