// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Teste simples
app.get("/", (req, res) => {
  res.send("✅ API Comparador de Preços está online!");
});

// 🔹 Busca produtos do Mercado Livre com logs e fallback
app.get("/produtos", async (req, res) => {
  const termo = req.query.q || "notebook"; // permite ?q=iphone por exemplo

  try {
    console.log(`🟡 Buscando produtos no Mercado Livre: ${termo}`);
    const response = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${termo}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0 Safari/537.36",
        Accept: "application/json",
      },
    });

    console.log("🔍 Status da resposta:", response.status);

    if (!response.ok) {
      const body = await response.text();
      console.error("❌ Erro ao buscar produtos:", body);
      return res.status(response.status).json({
        message: "Erro na API do Mercado Livre",
        status: response.status,
        detalhes: body,
      });
    }

    const data = await response.json();
    console.log(`✅ ${data.results?.length || 0} produtos encontrados`);

    if (!data.results || data.results.length === 0) {
      console.warn("⚠️ Nenhum produto encontrado. Enviando lista padrão.");
      return res.json([
        {
          id: "exemplo1",
          nome: "Notebook Genérico",
          preco: 2999.99,
          imagem: "https://via.placeholder.com/150",
        },
        {
          id: "exemplo2",
          nome: "Celular Genérico",
          preco: 1999.99,
          imagem: "https://via.placeholder.com/150",
        },
      ]);
    }

    const produtos = data.results.slice(0, 10).map((item) => ({
      id: item.id,
      nome: item.title,
      preco: item.price,
      imagem: item.thumbnail,
    }));

    res.json(produtos);
  } catch (error) {
    console.error("💥 Erro interno ao buscar produtos:", error);
    res.status(500).json({
      message: "Erro interno ao buscar produtos.",
      detalhes: error.message,
    });
  }
});

// 🔹 Porta dinâmica para o Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
