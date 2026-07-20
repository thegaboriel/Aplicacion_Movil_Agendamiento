const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Evita que el navegador cachee las respuestas de la API (soluciona el 304)
app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

const eventosRoutes = require("./routes/eventos.routes");

app.use("/api/eventos", eventosRoutes);

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});