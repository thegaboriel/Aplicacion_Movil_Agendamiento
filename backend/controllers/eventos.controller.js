const fs = require("fs");
const path = require("path");

const archivo = path.join(__dirname, "../data/eventos.json");

// Leer eventos
const leerEventos = () => {
    const datos = fs.readFileSync(archivo, "utf8");
    return JSON.parse(datos);
};

// Guardar eventos
const guardarEventos = (eventos) => {
    fs.writeFileSync(archivo, JSON.stringify(eventos, null, 2));
};

// GET /api/eventos
exports.obtenerEventos = (req, res) => {
    try {
        const eventos = leerEventos();
        res.json(eventos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al leer los eventos." });
    }
};

// POST /api/eventos
exports.crearEvento = (req, res) => {
    const { titulo, descripcion, fecha, hora, lugar, tipo } = req.body;

    // Manejo de datos inválidos (400)
    if (!titulo || !fecha || !hora || !lugar || !tipo) {
        return res.status(400).json({
            mensaje: "Faltan campos obligatorios: titulo, fecha, hora, lugar y tipo son requeridos."
        });
    }

    try {
        const eventos = leerEventos();

        const nuevoEvento = {
            id: eventos.length > 0 ? eventos[eventos.length - 1].id + 1 : 1,
            titulo,
            descripcion: descripcion ?? "",
            fecha,
            hora,
            lugar,
            tipo
        };

        eventos.push(nuevoEvento);
        guardarEventos(eventos);

        res.status(201).json(nuevoEvento);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al guardar el evento." });
    }
};

// PUT /api/eventos/:id
exports.actualizarEvento = (req, res) => {
    const eventos = leerEventos();
    const id = parseInt(req.params.id);

    const indice = eventos.findIndex(e => e.id === id);

    if (indice === -1) {
        return res.status(404).json({ mensaje: "Evento no encontrado" });
    }

    eventos[indice] = {
        ...eventos[indice],
        ...req.body
    };

    guardarEventos(eventos);
    res.json(eventos[indice]);
};

// DELETE /api/eventos/:id
exports.eliminarEvento = (req, res) => {
    let eventos = leerEventos();
    const id = parseInt(req.params.id);

    const existe = eventos.some(e => e.id === id);

    if (!existe) {
        return res.status(404).json({ mensaje: "Evento no encontrado" });
    }

    eventos = eventos.filter(e => e.id !== id);
    guardarEventos(eventos);

    res.json({ mensaje: "Evento eliminado correctamente" });
};
