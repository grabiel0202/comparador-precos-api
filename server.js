// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Rota principal de teste
app.get("/", (req, res) => {
  console.log("GET / requisitado");
  res.send("✅ API Comparador de Preços está online!");
});

// 🔹 Rota que busca produtos do Mercado Livre com query dinâmica
app.get("/produtos/:query?", async (req, res) => {
  const query = req.params.query || "notebook";
  console.log(`🔍 Buscando produtos para query: "${query}"`);

  try {
    const response = await fetch(
      `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.188 Safari/537.36",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Erro na API do Mercado Livre:", response.status);
      return res
        .status(response.status)
        .json({ message: "Erro na API do Mercado Livre" });
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.warn("⚠️ Nenhum produto encontrado");
      return res.status(404).json({ message: "Nenhum produto encontrado." });
    }

    const produtos = data.results.slice(0, 10).map((item) => ({
      id: item.id,
      nome: item.title,
      preco: item.price,
      imagem: item.thumbnail,
      link: item.permalink, // link direto do produto
      categoria: item.category_id,
    }));

    console.log(`✅ ${produtos.length} produtos retornados`);
    res.json(produtos);
  } catch (error) {
    console.error("Erro interno ao buscar produtos:", error);
    res.status(500).json({ message: "Erro interno ao buscar produtos." });
  }
});

// 🔹 Porta dinâmica exigida pelo Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
