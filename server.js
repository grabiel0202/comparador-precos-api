// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Rota principal de teste
app.get("/", (req, res) => {
  res.send("✅ API Comparador de Preços está online (com proxy via AllOrigins)!");
});

// 🔹 Rota que busca produtos do Mercado Livre via proxy
app.get("/produtos", async (req, res) => {
  const query = req.query.q || "notebook";

  try {
    // 🔹 Usando o proxy AllOrigins para evitar bloqueio de CORS
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
      `https://api.mercadolibre.com/sites/MLB/search?q=${query}`
    )}`;

    const response = await fetch(proxyUrl);

    if (!response.ok) {
      return res.status(response.status).json({ message: "Erro ao acessar o proxy ou Mercado Livre" });
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ message: "Nenhum produto encontrado." });
    }

    // 🔹 Mapeia os produtos para o app
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

// 🔹 Porta dinâmica exigida pelo Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
