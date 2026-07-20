const express = require("express");

const router = express.Router();

const controlador = require("../controllers/eventos.controller");

router.get("/", controlador.obtenerEventos);

router.post("/", controlador.crearEvento);

router.put("/:id", controlador.actualizarEvento);

router.delete("/:id", controlador.eliminarEvento);

module.exports = router;