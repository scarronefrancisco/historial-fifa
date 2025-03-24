// Importar solo lo necesario desde Firebase (sin duplicaciones)
// Importar Firestore correctamente
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, query, orderBy, addDoc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Configuración de Firebase (usá tu propia configuración aquí)
const firebaseConfig = {
    apiKey: "AIzaSyC8cVuqT9MB8YbAt9DTDH5PWLQ5aRZ_BQ8",
    authDomain: "historial-fifa.firebaseapp.com",
    projectId: "historial-fifa",
    storageBucket: "historial-fifa.appspot.com",
    messagingSenderId: "1025482983434",
    appId: "1:1025482983434:web:7c5c7f882508a6bc4c37f3"
};

// Verificar si Firebase ya está inicializado
const app = window.firebaseApp || initializeApp(firebaseConfig);
window.firebaseApp = app;

// Obtener la referencia a Firestore
const db = window.db || getFirestore(app);
window.db = db;

// Verificar si Firestore está bien cargado
console.log("Firestore DB:", db);


// Obtener el ID del historial desde la URL
const params = new URLSearchParams(window.location.search);
const historialId = params.get("id");

// Elementos del DOM
const tituloHistorial = document.getElementById("titulo-historial");
const jugador1 = document.getElementById("jugador1");
const jugador2 = document.getElementById("jugador2");
const listaPartidos = document.getElementById("lista-partidos");
const btnVolver = document.getElementById("volver");
const btnAgregarPartido = document.getElementById("btn-agregar-partido");
const formPartido = document.getElementById("form-partido");
const registroPartido = document.getElementById("registro-partido");
const btnCancelarPartido = document.getElementById("btn-cancelar-partido");

// Función para cargar los datos del historial desde Firebase
const cargarHistorial = async () => {
    if (!historialId) {
        tituloHistorial.textContent = "Error: No se encontró el historial.";
        return;
    }

    try {
        // Obtener el historial desde Firebase
        const historialRef = doc(db, "historiales", historialId);
        const historialSnap = await getDoc(historialRef);

        if (!historialSnap.exists()) {
            tituloHistorial.textContent = "El historial no existe.";
            return;
        }

        const historial = historialSnap.data();

        // Actualizar encabezado del historial
        tituloHistorial.textContent = `Historial: ${historialId}`;

        // Llenar nombres en inputs de cuadros y resultado
        document.getElementById("cuadro-nombre-jugador1").textContent = historial.jugador1;
        document.getElementById("cuadro-nombre-jugador2").textContent = historial.jugador2;
        document.getElementById("nombre-jugador1").textContent = historial.jugador1;
        document.getElementById("nombre-jugador2").textContent = historial.jugador2;

        // Llenar select del ganador
        const selectGanador = document.getElementById("ganador");
        selectGanador.innerHTML = `
            <option value="">Seleccionar...</option>
            <option value="${historial.jugador1}">${historial.jugador1}</option>
            <option value="${historial.jugador2}">${historial.jugador2}</option>
        `;

        // Obtener partidos
        const partidosRef = collection(historialRef, "partidos");
        const q = query(partidosRef, orderBy("fecha", "desc"));
        const partidosSnap = await getDocs(q);

        // Contar victorias
        let victoriasJ1 = 0;
        let victoriasJ2 = 0;

        let golesJ1 = 0;
        let golesJ2 = 0;

        let partidoMaxGoleada = null;
        let maxDiferencia = -1;
        // Limpiar lista y mostrar partidos
        listaPartidos.innerHTML = "";

        if (partidosSnap.empty) {
            listaPartidos.innerHTML = "<p>No hay partidos registrados.</p>";
        } else {
            partidosSnap.forEach((docSnap) => {
                // Agregar listeners a los botones de eliminar
        document.querySelectorAll(".btn-eliminar-partido").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.target.getAttribute("data-id");
                const confirmar = confirm("¿Estás seguro de que querés eliminar este partido?");
                if (!confirmar) return;

                try {
                    const partidoRef = doc(db, `historiales/${historialId}/partidos/${id}`);
                    await deleteDoc(partidoRef);
                    alert("Partido eliminado con éxito.");
                    cargarHistorial();
                } catch (error) {
                    console.error("Error al eliminar el partido:", error);
                    alert("Hubo un error al eliminar el partido.");
                }
            });
        });
// Agregar listeners a los botones de editar
            document.querySelectorAll(".btn-editar-partido").forEach(btn => {
                btn.addEventListener("click", async (e) => {
                    const id = e.target.getAttribute("data-id");
                    const partidoRef = doc(db, `historiales/${historialId}/partidos/${id}`);
                    const partidoSnap = await getDoc(partidoRef);

                    if (partidoSnap.exists()) {
                        const partido = partidoSnap.data();

                        // Cargar datos en el formulario
                        document.getElementById("ganador").value = partido.ganador;
                        document.getElementById("resultado-jugador1").value = partido.resultado[document.getElementById("nombre-jugador1").textContent] || "";
                        document.getElementById("resultado-jugador2").value = partido.resultado[document.getElementById("nombre-jugador2").textContent] || "";

                        document.getElementById("cuadro-jugador1").value = partido.cuadros ? partido.cuadros[document.getElementById("cuadro-nombre-jugador1").textContent] || "" : "";
                        document.getElementById("cuadro-jugador2").value = partido.cuadros ? partido.cuadros[document.getElementById("cuadro-nombre-jugador2").textContent] || "" : "";

                        document.getElementById("comentarios").value = partido.comentarios || "";

                        // Mostrar formulario
                        registroPartido.style.display = "block";
                        btnAgregarPartido.style.display = "none";
                        
                        document.getElementById("registro-partido").scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                        // Guardar el ID en una variable global
                        window.partidoEditandoId = id;
                    }
                });
            });

                const partido = docSnap.data();

                // Contar victoria
                if (partido.ganador === historial.jugador1) victoriasJ1++;
                if (partido.ganador === historial.jugador2) victoriasJ2++;

                if (typeof partido.resultado === "object") {
                    const goles1 = parseInt(partido.resultado[historial.jugador1]) || 0;
                    const goles2 = parseInt(partido.resultado[historial.jugador2]) || 0;
                    golesJ1 += goles1;
                    golesJ2 += goles2;
                
                    const diferencia = Math.abs(goles1 - goles2);
                    if (diferencia > maxDiferencia) {
                        maxDiferencia = diferencia;
                        partidoMaxGoleada = { id: docSnap.id, ...partido };
                    }
                    
                }
                
                // Mostrar partido en lista
                const li = document.createElement("li");
                li.className = "card-partido";               

                li.innerHTML = `
                <div class="fecha">${new Date(partido.fecha).toLocaleDateString()}</div>
                <div class="ganador">🏆 Ganador: ${partido.ganador}</div>
                <div class="resultado-compacto">
                    ${historial.jugador1} ${partido.resultado[historial.jugador1] ?? '-'} 
                    - 
                    ${partido.resultado[historial.jugador2] ?? '-'} ${historial.jugador2}
                </div>
                ${partido.cuadros ? `
                    <div class="cuadros">
                        <strong>Cuadros:</strong>
                        <span>${historial.jugador1} → ${partido.cuadros[historial.jugador1] || '-'}</span>
                        <span>${historial.jugador2} → ${partido.cuadros[historial.jugador2] || '-'}</span>
                    </div>` : ""
                }
                ${partido.comentarios ? `<div class="comentarios">💬 ${partido.comentarios}</div>` : ""}
                <button class="btn-editar-partido" id="editar-part" data-id="${docSnap.id}"> ✏️ </button>
                <button class="btn-eliminar-partido" data-id="${docSnap.id}"> 🗑️ </button>

            `;
            
                listaPartidos.appendChild(li);

            });
        }

        // Mostrar resumen de victorias
        document.getElementById("nombre-j1").textContent = historial.jugador1;
        document.getElementById("nombre-j2").textContent = historial.jugador2;
        document.getElementById("victorias-j1").textContent = victoriasJ1;
        document.getElementById("victorias-j2").textContent = victoriasJ2;
        document.getElementById("goles-j1").textContent = golesJ1;
        document.getElementById("goles-j2").textContent = golesJ2;

        const canvas = document.getElementById("torta-victorias");
        const graficoContainer = document.getElementById("grafico-victorias");

        // Mostrar gráfico con animación
        graficoContainer.classList.add("visible");

        // Destruir gráfico anterior si ya existe (para evitar duplicados)
        if (window.graficoVictorias) {
            window.graficoVictorias.destroy();
        }

        // Plugin para mostrar texto en el centro del gráfico
        const centroTextoPlugin = {
            id: 'centroTexto',
            beforeDraw(chart) {
                const { width, height, ctx } = chart;
                const total = chart.config.data.datasets[0].data.reduce((a, b) => a + b, 0);

                ctx.save();
                ctx.font = 'bold 30px Poppins';
                ctx.fillStyle = '#004d40';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${total} PJ`, width / 2, height / 2);
                ctx.restore();
            }
        };

        // Crear nuevo gráfico
        window.graficoVictorias = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: [historial.jugador1, historial.jugador2],
                datasets: [{
                    label: 'Victorias',
                    data: [victoriasJ1, victoriasJ2],
                    backgroundColor: ['#26a69a', '#00796b'],
                    borderColor: 'transparent',
                    borderWidth: 1,
                    hoverOffset: 20,
                }]
            },
            options: {
                cutout: '65%',
                responsive: true,
                animation: {
                    animateRotate: true,
                    duration: 1000,
                    easing: 'easeOutBounce'
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Poppins',
                                size: 14
                            },
                            color: '#333'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#004d40',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 8,
                        padding: 10
                    }
                }
            },
            plugins: [centroTextoPlugin] // ✅ Acá sí va el plugin
        });
        
        
        // Animar resumen
        const resumen = document.getElementById("resumen-jugadores");
        resumen.classList.add("visible");
        if (partidoMaxGoleada) {
            const contenedorGoleada = document.getElementById("goleada-maxima");
            const contenido = document.getElementById("contenido-goleada");
        
            contenido.innerHTML = `
            <div class="card-partido">
                <div class="fecha">${new Date(partidoMaxGoleada.fecha).toLocaleDateString()}</div>
                <div class="ganador">🏆 Ganador: ${partidoMaxGoleada.ganador}</div>
                <div class="resultado-compacto">
                    ${historial.jugador1} ${partidoMaxGoleada.resultado[historial.jugador1] ?? '-'} 
                    - 
                    ${partidoMaxGoleada.resultado[historial.jugador2] ?? '-'} ${historial.jugador2}
                </div>
                ${partidoMaxGoleada.cuadros ? `
                    <div class="cuadros">
                        <strong>Cuadros:</strong>
                        <span>${historial.jugador1} → ${partidoMaxGoleada.cuadros[historial.jugador1] || '-'}</span>
                        <span>${historial.jugador2} → ${partidoMaxGoleada.cuadros[historial.jugador2] || '-'}</span>
                    </div>` : ""
                }
                ${partidoMaxGoleada.comentarios ? `<div class="comentarios">💬 ${partidoMaxGoleada.comentarios}</div>` : ""}
            </div>
        `;
        
        
            contenedorGoleada.classList.add("visible");
        }
        const btnHeaderAgregar = document.getElementById("btn-header-agregar");
        if (btnHeaderAgregar) {
            // Aseguramos que el botón esté visible
            btnHeaderAgregar.style.display = "inline-block";
        
            btnHeaderAgregar.addEventListener("click", () => {
                registroPartido.style.display = "block";
                btnAgregarPartido.style.display = "none";
        
                // Hacer scroll suave hacia el formulario
                document.getElementById("registro-partido").scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            });
        }
        
    
    } catch (error) {
        console.error("Error al cargar el historial:", error);
        tituloHistorial.textContent = "Error al cargar el historial.";
    }
};


// Evento para volver al inicio
btnVolver.addEventListener("click", () => {
    window.location.href = "index.html";
});

// Mostrar el formulario al presionar "Agregar Partido"
btnAgregarPartido.addEventListener("click", () => {
    registroPartido.style.display = "block";
    btnAgregarPartido.style.display = "none";
});

// Cancelar el registro de un partido
btnCancelarPartido.addEventListener("click", () => {
    registroPartido.style.display = "none";
    btnAgregarPartido.style.display = "block";
});

// Manejar el formulario para guardar un partido en Firestore
formPartido.addEventListener("submit", async (event) => {
    event.preventDefault();
    let cuadro1 = document.getElementById("cuadro-jugador1").value.trim();
    let cuadro2 = document.getElementById("cuadro-jugador2").value.trim();
    let cuadros = (cuadro1 || cuadro2) ? {
        [document.getElementById("cuadro-nombre-jugador1").textContent]: cuadro1,
        [document.getElementById("cuadro-nombre-jugador2").textContent]: cuadro2
    } : null;

    const partido = {
        ganador: document.getElementById("ganador").value.trim(),
        resultado: {
            [document.getElementById("nombre-jugador1").textContent]: document.getElementById("resultado-jugador1").value.trim(),
            [document.getElementById("nombre-jugador2").textContent]: document.getElementById("resultado-jugador2").value.trim()
        },        
        cuadros: cuadros,
        comentarios: document.getElementById("comentarios").value.trim(),
        fecha: new Date().toISOString()
    };

    if (partido.ganador === "" || partido.resultado === "") {
        alert("Debes completar los campos de ganador y resultado.");
        return;
    }

    try {
        if (window.partidoEditandoId) {
            // Modo edición
            const partidoRef = doc(db, `historiales/${historialId}/partidos/${window.partidoEditandoId}`);
            await setDoc(partidoRef, partido);
            alert("Partido actualizado con éxito.");
            window.partidoEditandoId = null;
        } else {
            // Modo agregar
            const partidosRef = collection(db, `historiales/${historialId}/partidos`);
            await addDoc(partidosRef, partido);
            alert("Partido registrado con éxito");
        }

        registroPartido.style.display = "none";
        btnAgregarPartido.style.display = "block";
        formPartido.reset();
        cargarHistorial();
    } catch (error) {
        console.error("Error al guardar el partido:", error);
        alert("Hubo un error al guardar el partido.");
    }
});


// Cargar el historial al cargar la página
cargarHistorial();
