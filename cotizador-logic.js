/**
 * ARCEN ABERTURAS - LOGIC FULL V6 (Final Fix)
 * Sistema unificado: Hojas múltiples, Anodizado y Vidrio 3mm.
 */

// Pesos de perfiles por metro lineal (kg/m)
const CATALOGO = {
    puerta: { marco: {p: 0.728}, hoja: {p: 1.088}, contra: {p: 0.206}, zocaloA: {p: 1.262}, inversor: {p: 0.650} },
    corrediza: { umbral: {p: 1.333}, jamba: {p: 0.680}, lateral: {p: 0.711}, central: {p: 0.633}, zocalo: {p: 0.707} },
    ventanaAbrir: { marco: {p: 0.728}, hoja: {p: 0.862}, contra: {p: 0.206}, inversor: {p: 0.650} },
    panoFijo: { marco: {p: 0.728}, contra: {p: 0.206} }
};

// Precios de insumos y accesorios (Actualizados)
const PRECIOS = {
    kiloBase: 12800, 
    vidrio: { simple3: 8150, simple4: 9950, lam33: 30880, dvh: 0 },
    puerta: { cerradura: 24500, picaporte: 14200, bisagra: 5800, escuadra: 1400, t98: 950 },
    corrediza: { rueda: 2800, cierre: 2800 },
    kitAbrir: 14500, kitOscilo: 48000, 
    banderola: { chingolo: 6500, reten: 8900 },
    insumosM: 550 
};

const PRECIOS_DVH = { varilla: 1200, escuadra: 350, tamiz: 6750, salchicha: 15000, rendS: 4.5, tamizM: 0.12 };

let listaPresupuesto = [];
let ultimaCotizacion = null;

/**
 * Función que realiza el cálculo técnico
 */
function calcularAutomatico() {
    const d = {
        tipo: document.getElementById('tipo').value,
        ancho: parseFloat(document.getElementById('ancho').value) || 0,
        alto: parseFloat(document.getElementById('alto').value) || 0,
        vidrio: document.getElementById('vidrio').value,
        color: document.getElementById('color').value,
        cantidad: parseInt(document.getElementById('cantidad').value) || 1,
        umbral: document.getElementById('umbral').checked
    };

    // Mostrar opción umbral solo si la palabra "puerta" o "porton" está en el tipo
    document.getElementById('opciones-puerta').style.display = (d.tipo.toLowerCase().includes('puerta') || d.tipo === 'porton') ? 'block' : 'none';

    if (!d.ancho || !d.alto) {
        document.getElementById('res-unitario').innerText = "$ 0";
        document.getElementById('res-total').innerText = "$ 0";
        return;
    }

    const aM = d.ancho / 1000; 
    const hM = d.alto / 1000; 
    const m2 = aM * hM;
    let kg = 0, acc = 0, cantH = 1;

    // --- LOGICA DE CARPINTERIA ---
    if (d.tipo === 'panoFijo') {
        kg = ((aM * 2) + (hM * 2)) * (CATALOGO.panoFijo.marco.p + CATALOGO.panoFijo.contra.p);
        acc = PRECIOS.puerta.escuadra * 4;
    } 
    else if (d.tipo === 'puerta' || d.tipo === 'puertaDoble') {
        cantH = (d.tipo === 'puertaDoble') ? 2 : 1;
        const P = CATALOGO.puerta;
        // Marco + Hojas + Zócalo Alto
        kg = ((hM * 2) + (aM * (d.umbral ? 2 : 1))) * P.marco.p + (hM * 2 * cantH + aM * cantH) * P.hoja.p + (aM * P.zocaloA.p);
        if (cantH === 2) kg += hM * P.inversor.p; // Agregar perfil inversor
        // Accesorios: Cerradura, picaporte, 3 bisagras por hoja y pasadores si es doble
        acc = PRECIOS.puerta.cerradura + PRECIOS.puerta.picaporte + (PRECIOS.puerta.bisagra * 3 * cantH) + (cantH > 1 ? PRECIOS.puerta.t98 * 2 : 0);
    }
    else if (d.tipo === 'ventanaAbrir' || d.tipo === 'ventanaAbrirDoble' || d.tipo === 'oscilo' || d.tipo === 'banderola') {
        cantH = (d.tipo === 'ventanaAbrirDoble') ? 2 : 1;
        const V = CATALOGO.ventanaAbrir;
        kg = ((aM * 2) + (hM * 2)) * V.marco.p + (hM * 2 * cantH + aM * 2 * cantH) * (V.hoja.p + V.contra.p);
        if (cantH === 2) kg += hM * V.inversor.p;
        
        if (d.tipo === 'oscilo') acc = PRECIOS.kitOscilo;
        else if (d.tipo === 'banderola') acc = (PRECIOS.puerta.bisagra * 2) + PRECIOS.banderola.chingolo + PRECIOS.banderola.reten;
        else acc = PRECIOS.kitAbrir * cantH;
    }
    else if (d.tipo === 'porton') {
        cantH = 3;
        const P = CATALOGO.puerta;
        kg = ((hM * 2) + (aM * 2)) * P.marco.p + (hM * 2 * cantH + aM * cantH) * P.hoja.p + (aM * P.zocaloA.p) + (hM * 2 * P.inversor.p);
        acc = PRECIOS.puerta.cerradura + PRECIOS.puerta.picaporte + (PRECIOS.puerta.bisagra * 3 * cantH) + (PRECIOS.puerta.t98 * 4);
    }
    else if (d.tipo === 'corrediza') {
        const C = CATALOGO.corrediza;
        kg = (aM * 2 * C.umbral.p) + (hM * 2 * C.jamba.p) + (hM * 2 * (C.lateral.p + C.central.p)) + (aM * 2 * C.zocalo.p);
        acc = (PRECIOS.corrediza.rueda * 2 * (d.ancho > 1800 ? 2 : 1)) + PRECIOS.corrediza.cierre;
    }

    // --- LOGICA DE VIDRIO ---
    let costoVid = 0;
    if (d.vidrio === 'dvh') {
        const perimetroTotal = ((aM / cantH * 2) + (hM * 2)) * cantH;
        costoVid = (m2 * 9950 * 2) + (perimetroTotal * PRECIOS_DVH.varilla) + (cantH * 4 * PRECIOS_DVH.escuadra) + (perimetroTotal * PRECIOS_DVH.tamizM * PRECIOS_DVH.tamiz) + ((perimetroTotal / PRECIOS_DVH.rendS) * PRECIOS_DVH.salchicha);
    } else {
        costoVid = m2 * PRECIOS.vidrio[d.vidrio];
    }

    // --- AJUSTES FINALES Y MARGENES ---
    let costoAlu = (kg * 1.05) * PRECIOS.kiloBase;
    if (d.color === 'negro') costoAlu *= 1.15;
    if (d.color === 'anodizado') costoAlu *= 1.22;

    const precioVentaAlu = (costoAlu + acc + ((aM * 2 + hM * 2) * PRECIOS.insumosM)) * 1.1025 * 1.45 * 1.21;
    const precioVentaVid = (costoVid * 2) * 1.21;
    
    const finalUnitario = precioVentaAlu + precioVentaVid;
    const finalTotal = finalUnitario * d.cantidad;

    // Actualizar Interfaz
    document.getElementById('res-unitario').innerText = `$ ${Math.round(finalUnitario).toLocaleString('es-AR')}`;
    document.getElementById('res-total').innerText = `$ ${Math.round(finalTotal).toLocaleString('es-AR')}`;
    document.getElementById('res-cant-label').innerText = d.cantidad;
    document.getElementById('res-detalle-text').innerText = `${d.tipo.toUpperCase()} - ${d.ancho}x${d.alto}mm`;

    let umbTxt = d.tipo.toLowerCase().includes('puerta') ? (d.umbral ? " c/ Umbral" : " s/ Umbral") : "";
    ultimaCotizacion = {
        desc: `${d.tipo.toUpperCase()} (${d.vidrio.toUpperCase()})${umbTxt}`,
        medidas: `${d.ancho}x${d.alto}`,
        cant: d.cantidad,
        subtotal: Math.round(finalTotal)
    };
}

/**
 * Gestión del Presupuesto
 */
function actualizarTabla() {
    const tbody = document.getElementById('cuerpo-tabla');
    tbody.innerHTML = '';
    let totalObra = 0;

    listaPresupuesto.forEach((it, i) => {
        totalObra += it.subtotal;
        tbody.innerHTML += `
            <tr>
                <td><b>${it.cant}</b></td>
                <td>${it.desc}</td>
                <td>${it.medidas}</td>
                <td>$ ${it.subtotal.toLocaleString('es-AR')}</td>
                <td class="no-print">
                    <button onclick="eliminarItem(${i})" style="color:#dc3545; background:none; border:none; cursor:pointer; font-weight:bold;">ELIMINAR</button>
                </td>
            </tr>`;
    });

    document.getElementById('total-presupuesto-final').innerText = `$ ${totalObra.toLocaleString('es-AR')}`;
    document.getElementById('contenedor-lista').style.display = (listaPresupuesto.length > 0) ? 'block' : 'none';
}

function eliminarItem(index) {
    listaPresupuesto.splice(index, 1);
    actualizarTabla();
}

/**
 * Inicialización
 */
window.onload = () => {
    const inputs = ['ancho', 'alto', 'cantidad', 'tipo', 'vidrio', 'color', 'umbral'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calcularAutomatico);
            el.addEventListener('change', calcularAutomatico);
        }
    });

    document.getElementById('confirmar-agregar').onclick = () => {
        if (!ultimaCotizacion || !parseFloat(document.getElementById('ancho').value)) return;
        listaPresupuesto.push({...ultimaCotizacion});
        actualizarTabla();
    };
};