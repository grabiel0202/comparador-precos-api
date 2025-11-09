import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Rota principal de teste
app.get("/", (req, res) => {
  res.send("✅ API Comparador de Preços está online!");
});

// 🔹 Rota que busca produtos do Mercado Livre real
app.get("/produtos", async (req, res) => {
  try {
    const response = await fetch("https://api.mercadolibre.com/sites/MLB/search?q=notebook");
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ message: "Nenhum produto encontrado." });
    }

    const produtos = data.results.map((item) => ({
      id: item.id,
      nome: item.title,
      preco: item.price,
      imagem: item.thumbnail,
    }));

    res.json(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ message: "Erro ao buscar produtos da API." });
  }
});

// 🔹 Porta dinâmica exigida pelo Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
