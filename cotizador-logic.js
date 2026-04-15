const CATALOGO = {
    puerta: { marco: {p: 0.728}, hoja: {p: 1.088}, contra: {p: 0.206}, zocaloA: {p: 1.262}, inversor: {p: 0.650} },
    corrediza: { umbral: {p: 1.333}, jamba: {p: 0.680}, lateral: {p: 0.711}, central: {p: 0.633}, zocalo: {p: 0.707} },
    ventanaAbrir: { marco: {p: 0.728}, hoja: {p: 0.862}, contra: {p: 0.206}, inversor: {p: 0.650} },
    panoFijo: { marco: {p: 0.728}, contra: {p: 0.206} }
};

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

    document.getElementById('opciones-puerta').style.display = (d.tipo.toLowerCase().includes('puerta') || d.tipo === 'porton') ? 'block' : 'none';

    if (!d.ancho || !d.alto) return;

    const aM = d.ancho / 1000; const hM = d.alto / 1000; const m2 = aM * hM;
    let kg = 0, acc = 0, cantH = 1;

    if (d.tipo === 'panoFijo') {
        kg = ((aM*2)+(hM*2)) * (CATALOGO.panoFijo.marco.p + CATALOGO.panoFijo.contra.p);
        acc = PRECIOS.puerta.escuadra * 4;
    } 
    else if (d.tipo === 'puerta' || d.tipo === 'puertaDoble') {
        cantH = (d.tipo === 'puertaDoble') ? 2 : 1;
        kg = ((hM*2)+(aM*(d.umbral?2:1)))*CATALOGO.puerta.marco.p + (hM*2*cantH + aM*cantH)*CATALOGO.puerta.hoja.p + (aM*CATALOGO.puerta.zocaloA.p);
        if (cantH === 2) kg += hM * CATALOGO.puerta.inversor.p;
        acc = PRECIOS.puerta.cerradura + PRECIOS.puerta.picaporte + (PRECIOS.puerta.bisagra*3*cantH) + (cantH > 1 ? PRECIOS.puerta.t98 * 2 : 0);
    }
    else if (d.tipo === 'ventanaAbrir' || d.tipo === 'ventanaAbrirDoble' || d.tipo === 'oscilo' || d.tipo === 'banderola') {
        cantH = (d.tipo === 'ventanaAbrirDoble') ? 2 : 1;
        kg = ((aM*2)+(hM*2))*CATALOGO.ventanaAbrir.marco.p + (hM*2*cantH + aM*2*cantH)*(CATALOGO.ventanaAbrir.hoja.p + CATALOGO.ventanaAbrir.contra.p);
        if (cantH === 2) kg += hM * CATALOGO.ventanaAbrir.inversor.p;
        if (d.tipo === 'oscilo') acc = PRECIOS.kitOscilo;
        else if (d.tipo === 'banderola') acc = (PRECIOS.puerta.bisagra*2) + PRECIOS.banderola.chingolo + PRECIOS.banderola.reten;
        else acc = PRECIOS.kitAbrir * cantH;
    }
    else if (d.tipo === 'porton') {
        cantH = 3;
        kg = ((hM*2)+(aM*2))*CATALOGO.puerta.marco.p + (hM*2*cantH + aM*cantH)*CATALOGO.puerta.hoja.p + (aM*CATALOGO.puerta.zocaloA.p) + (hM*2*CATALOGO.puerta.inversor.p);
        acc = PRECIOS.puerta.cerradura + PRECIOS.puerta.picaporte + (PRECIOS.puerta.bisagra*3*cantH) + (PRECIOS.puerta.t98 * 4);
    }
    else if (d.tipo === 'corrediza') {
        kg = (aM*2*CATALOGO.corrediza.umbral.p) + (hM*2*CATALOGO.corrediza.jamba.p) + (hM*2*(CATALOGO.corrediza.lateral.p+CATALOGO.corrediza.central.p)) + (aM*2*CATALOGO.corrediza.zocalo.p);
        acc = (PRECIOS.corrediza.rueda*2 * (d.ancho > 1800 ? 2 : 1)) + PRECIOS.corrediza.cierre;
    }

    let cVid = 0;
    if (d.vidrio === 'dvh') {
        const pTotal = ((aM/cantH*2)+(hM*2))*cantH;
        cVid = (m2*9950*2) + (pTotal*PRECIOS_DVH.varilla) + (cantH*4*PRECIOS_DVH.escuadra) + (pTotal*PRECIOS_DVH.tamizM*PRECIOS_DVH.tamiz) + ((pTotal/PRECIOS_DVH.rendS)*PRECIOS_DVH.salchicha);
    } else { cVid = m2 * PRECIOS.vidrio[d.vidrio]; }

    let cAlu = (kg * 1.05) * PRECIOS.kiloBase;
    if (d.color === 'negro') cAlu *= 1.15;
    if (d.color === 'anodizado') cAlu *= 1.22;

    const vAlu = (cAlu + acc + ((aM*2+hM*2)*PRECIOS.insumosM)) * 1.1025 * 1.45 * 1.21;
    const vVid = (cVid * 2) * 1.21;
    const finalUnit = vAlu + vVid;

    document.getElementById('res-unitario').innerText = `$ ${Math.round(finalUnit).toLocaleString('es-AR')}`;
    document.getElementById('res-total').innerText = `$ ${Math.round(finalUnit * d.cantidad).toLocaleString('es-AR')}`;
    document.getElementById('res-cant-label').innerText = d.cantidad;
    document.getElementById('res-detalle-text').innerText = `${d.tipo.toUpperCase()} - ${d.ancho}x${d.alto}mm`;

    ultimaCotizacion = {
        desc: `${d.tipo.toUpperCase()} (${d.vidrio.toUpperCase()})${d.tipo.toLowerCase().includes('puerta') ? (d.umbral ? " c/ Umbral" : " s/ Umbral") : ""}`,
        medidas: `${d.ancho}x${d.alto}`,
        cant: d.cantidad,
        subtotal: Math.round(finalUnit * d.cantidad)
    };
}

window.onload = () => {
    ['ancho', 'alto', 'cantidad', 'tipo', 'vidrio', 'color', 'umbral'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', calcularAutomatico);
    });

    document.getElementById('confirmar-agregar').onclick = () => {
        if (!ultimaCotizacion || !parseFloat(document.getElementById('ancho').value)) return;
        listaPresupuesto.push({...ultimaCotizacion});
        actualizarTabla();
    };
};

function actualizarTabla() {
    const tbody = document.getElementById('cuerpo-tabla');
    tbody.innerHTML = ''; let total = 0;
    listaPresupuesto.forEach((it, i) => {
        total += it.subtotal;
        tbody.innerHTML += `<tr><td><b>${it.cant}</b></td><td>${it.desc}</td><td>${it.medidas}</td><td>$ ${it.subtotal.toLocaleString('es-AR')}</td><td class="no-print"><button onclick="eliminarItem(${i})" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold;">ELIMINAR</button></td></tr>`;
    });
    document.getElementById('total-presupuesto-final').innerText = `$ ${total.toLocaleString('es-AR')}`;
    document.getElementById('contenedor-lista').style.display = 'block';
}

function eliminarItem(i) { listaPresupuesto.splice(i, 1); actualizarTabla(); }