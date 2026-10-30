'use strict';
// Ficha de producto: el color se elige con botones en lugar de la lista desplegable.
// cart.js sigue armando el <select id="cartVariant"> y leyendo su valor; acá sólo
// se dibujan los botones encima y se sincronizan con ese select.
(() => {
  const optionsBox = document.getElementById('productOptions');
  if (!optionsBox) return;

  function chips() {
    const select = document.getElementById('cartVariant');
    if (!select || optionsBox.querySelector('.color-chips')) return;
    const label = select.closest('label');
    const choices = [...select.options].filter(o => o.value);
    const group = document.createElement('div');
    group.className = 'color-chips';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'Color');
    const title = document.createElement('p');
    title.className = 'color-chips-title';
    title.textContent = 'Color';
    const note = document.createElement('p');
    note.className = 'color-chips-note';
    note.setAttribute('aria-live', 'polite');

    // 30/10/2026, pedido de Marta: las clientas no ven cuántas unidades quedan
    // (antes decía «Queda 1 en este color.»). Los colores sin stock siguen deshabilitados.
    function pick(value) {
      select.value = value;
      select.dispatchEvent(new Event('change'));
      group.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.value === value)));
      note.textContent = '';
    }

    // Un solo color: no hay nada que elegir, se muestra escrito (un botón verde se confundía con «Comprar»).
    if (choices.length === 1 && !choices[0].disabled) {
      const solo = document.createElement('p');
      solo.className = 'color-unico';
      solo.textContent = choices[0].dataset.label || choices[0].text;
      group.append(solo);
    } else choices.forEach(o => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.value = o.value;
      b.textContent = o.dataset.label || o.text;
      b.disabled = o.disabled;
      b.setAttribute('aria-pressed', 'false');
      if (o.disabled) b.title = 'Sin stock';
      b.onclick = () => pick(o.value);
      group.append(b);
    });

    if (label) label.classList.add('visually-hidden');
    optionsBox.prepend(title, group, note);
    const available = choices.filter(o => !o.disabled);
    if (available.length === 1) pick(available[0].value);
  }

  // Un solo camino de compra por prenda (07/10/2026):
  // - Con precio y en Tiendanube: «Comprar» (se paga en la Tiendanube oficial). Las cuotas y el precio final los
  //   dibuja priceBlock() de app.js (21/10/2026: primero las cuotas, después el precio, tachado si hay descuento).
  // - Sin precio (pendiente) o todavía no cargada en Tiendanube: «Pedila por WhatsApp».
  // El carrito local no pasa a Tiendanube, así que no se ofrece «Agregar al carrito».
  const ocultables = ['addToCart', 'cartProductStatus'].map(id => document.getElementById(id));
  const comprar = document.getElementById('buyProduct');
  const nota = document.querySelector('#productDialog .checkout-note');
  const ask = document.getElementById('askProduct');
  const comprarTexto = comprar ? comprar.firstChild.textContent : '';
  let aviso = null, pasos = null;

  function crear(tag, clase, despuesDe) {
    const el = document.createElement(tag);
    el.className = clase;
    despuesDe?.after(el);
    return el;
  }

  function caminoDeCompra() {
    const p = (typeof active !== 'undefined' && active) || {};
    // Las prendas son piezas unicas: vendida en Tiendanube, el servidor le baja el stock y aca deja de ofrecerse.
    const agotada = enTienda(p) && !hayStock(p);
    const online = enTienda(p) && !agotada;
    const precioEl = document.getElementById('productPrice');
    if (!aviso) aviso = crear('p', 'nueva-aviso', precioEl);
    if (!pasos) {
      pasos = crear('div', 'como-comprar', nota);
      pasos.innerHTML = '<p class="como-comprar-titulo">Cómo comprar</p><ol>' +
        '<li>Elegí el color y tocá <strong>Comprar</strong>.</li>' +
        '<li>Completás tu nombre y correo y pasás directo al pago seguro de Tiendanube.</li>' +
        '<li>Cargás la entrega y pagás, en cuotas sin interés o como prefieras.</li></ol>';
    }

    ocultables.forEach(el => { if (el) el.hidden = true; });
    if (comprar) {
      comprar.hidden = !online;
      comprar.firstChild.textContent = online ? 'Comprar ' : comprarTexto;
    }
    pasos.hidden = !online;
    if (nota) nota.hidden = true;

    aviso.hidden = online;
    const colores = p.pendiente ? (p.colores || []) : [];
    const lista = colores.length > 1 ? colores.slice(0, -1).join(', ') + ' y ' + colores.at(-1) : colores[0];
    aviso.textContent = online ? '' : agotada
      ? 'Agotada. Era una pieza única: escribinos y te avisamos si llega algo parecido.'
      : p.pendiente
      ? (lista ? `Colores: ${lista}. ` : '') + 'Recién llegada al local. Te confirmamos precio, talle y color por WhatsApp.'
      : 'Te la reservamos por WhatsApp y te confirmamos talle y color.';
    aviso.classList.toggle('ficha-agotada', agotada);

    if (!ask) return;
    ask.classList.toggle('dark', !online);
    ask.classList.toggle('outline', online);
    ask.firstChild.textContent = online ? 'Consultar por WhatsApp ' : agotada ? 'Consultar por algo parecido ' : 'Pedila por WhatsApp ';
    if (!online) {
      const enlace = productUrl(p);
      const pide = agotada ? 'Vi que está agotada: ¿les llega algo parecido?'
        : p.pendiente ? '¿Me pasan precio, talles y colores?' : '¿Me la reservan? Quiero saber talles y colores.';
      ask.href = `https://wa.me/5493415857687?text=${encodeURIComponent(`Hola, Taj Mahal. Me encantó esta prenda: ${p.name}. ${pide}\n${enlace}`)}`;
    }
  }

  window.addEventListener('productopened', () => setTimeout(() => { chips(); caminoDeCompra(); }, 0));
  chips();
  caminoDeCompra();
})();
