// Importar Firestore desde Firebase
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Obtener la referencia a la base de datos desde `window.db` (definido en index.html)
const db = window.db;

document.addEventListener("DOMContentLoaded", () => {
    // Elementos de la pantalla de selección de historial
    const btnIngresar = document.getElementById("btn-ingresar");
    const btnCrear = document.getElementById("btn-crear");
    const btnGuardarHistorial = document.getElementById("btn-guardar-historial");
    const btnCancelar = document.getElementById("btn-cancelar");

    const seleccionarHistorial = document.getElementById("seleccionar-historial");
    const registroHistorial = document.getElementById("registro-historial");

    // Evento para ingresar a un historial existente
    btnIngresar.addEventListener("click", () => {
        const historialId = document.getElementById("historial-id").value.trim();
        if (historialId === "") {
            alert("Por favor, ingresá un ID válido.");
            return;
        }
        window.location.href = `historial.html?id=${historialId}`;
    });

    // Evento para mostrar el formulario de creación de historial
    btnCrear.addEventListener("click", () => {
        seleccionarHistorial.style.display = "none";
        registroHistorial.style.display = "block";
    });

    // Evento para cancelar la creación de un historial
    btnCancelar.addEventListener("click", () => {
        registroHistorial.style.display = "none";
        seleccionarHistorial.style.display = "block";
    });

    // Evento para guardar un nuevo historial en Firebase
    btnGuardarHistorial.addEventListener("click", async () => {
        const jugador1 = document.getElementById("jugador1").value.trim();
        const jugador2 = document.getElementById("jugador2").value.trim();
        const nuevoHistorialId = document.getElementById("nuevo-historial-id").value.trim();

        if (jugador1 === "" || jugador2 === "" || nuevoHistorialId === "") {
            alert("Todos los campos son obligatorios.");
            return;
        }

        // Guardar el historial en Firebase
        const historialRef = collection(db, "historiales");
        const historialDoc = doc(historialRef, nuevoHistorialId);

        try {
            await setDoc(historialDoc, {
                jugador1,
                jugador2,
                partidos: []
            });
            alert("Historial creado con éxito.");
            window.location.href = "index.html"; // Volver a la pantalla inicial
        } catch (error) {
            console.error("Error al guardar el historial:", error);
            alert("Hubo un error al crear el historial.");
        }
    });
});
