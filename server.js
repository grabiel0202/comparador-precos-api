// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Rota de teste
app.get("/", (req, res) => {
  res.send("✅ API Comparador de Preços está online (via ScraperAPI)!");
});

// ✅ Proxy para Mercado Livre
app.get("/produtos", async (req, res) => {
  const query = req.query.q || "notebook";
  const apiKey = process.env.SCRAPER_API_KEY; // 🔑 chave do ScraperAPI

  if (!apiKey) {
    return res.status(500).json({ message: "Chave do ScraperAPI ausente no servidor" });
  }

  const url = `https://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(
    `https://api.mercadolibre.com/sites/MLB/search?q=${query}`
  )}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ message: "Erro ao acessar ScraperAPI" });
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
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
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ message: "Erro interno ao buscar produtos." });
  }
});

// 🔹 Porta exigida pelo Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
