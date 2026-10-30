'use strict';
// Talles por prenda (30/10/2026, pedido de Marta): en letras y, si se cargó, también en número.
// Dato esperado en catalog.js, en cada prenda:
//   talles: [{ letra: 'S' }, { letra: 'M', numero: '40' }]
// Se dibuja en la ficha (debajo del color) y en la tarjeta del catálogo.
// Si la prenda tiene varios talles, la clienta elige con botones; el talle elegido se suma
// al mensaje de WhatsApp porque updateAsk() (app.js) lee todos los <select> de #productOptions.
(() => {
  const ORDEN = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'ÚNICO'];
  const texto = t => (t.numero ? `${t.letra} (${t.numero})` : t.letra);
  const talles = p =>
    (Array.isArray(p?.talles) ? p.talles : [])
      .filter(t => t && String(t.letra || '').trim())
      .map(t => ({ letra: String(t.letra).trim().toUpperCase(), numero: String(t.numero || '').trim() }))
      .sort((a, b) => (ORDEN.indexOf(a.letra) + 1 || 99) - (ORDEN.indexOf(b.letra) + 1 || 99));

  function ficha() {
    const box = document.getElementById('productOptions');
    const p = (typeof active !== 'undefined' && active) || null;
    if (!box || !p) return;
    box.querySelector('.talle-box')?.remove();
    const lista = talles(p);
    if (!lista.length) return;

    const wrap = document.createElement('div');
    wrap.className = 'talle-box';
    const title = document.createElement('p');
    title.className = 'color-chips-title';
    title.textContent = 'Talle';
    wrap.append(title);

    if (lista.length === 1) {
      const solo = document.createElement('p');
      solo.className = 'color-unico';
      solo.textContent = lista[0].letra === 'ÚNICO' ? 'Talle único' : texto(lista[0]);
      wrap.append(solo);
    } else {
      // Select oculto: lo lee updateAsk() para el mensaje de WhatsApp.
      const label = document.createElement('label');
      label.className = 'visually-hidden';
      label.textContent = 'Talle';
      const select = document.createElement('select');
      select.id = 'talleSelect';
      select.append(new Option('Elegí un talle', ''));
      lista.forEach(t => select.append(new Option(`Talle ${texto(t)}`, `Talle ${texto(t)}`)));
      select.onchange = () => typeof updateAsk === 'function' && updateAsk();
      label.append(select);

      const group = document.createElement('div');
      group.className = 'color-chips';
      group.setAttribute('role', 'group');
      group.setAttribute('aria-label', 'Talle');
      lista.forEach(t => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = texto(t);
        b.setAttribute('aria-pressed', 'false');
        b.onclick = () => {
          select.value = `Talle ${texto(t)}`;
          select.dispatchEvent(new Event('change'));
          group.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        };
        group.append(b);
      });
      wrap.append(group, label);
    }
    box.append(wrap);
  }

  // Tarjetas del catálogo: «S · M · L» debajo del nombre.
  function tarjetas() {
    document.querySelectorAll('.product-button[data-product]').forEach(btn => {
      if (btn.querySelector('.product-talles')) return;
      const p = (window.CATALOG || []).find(x => x.id === btn.dataset.product);
      const lista = talles(p);
      if (!lista.length) return;
      const span = document.createElement('span');
      span.className = 'product-talles';
      span.textContent = lista.length === 1 && lista[0].letra === 'ÚNICO' ? 'Talle único' : lista.map(t => t.letra).join(' · ');
      btn.querySelector('.product-name')?.after(span);
    });
  }

  window.addEventListener('productopened', () => setTimeout(ficha, 0));
  new MutationObserver(tarjetas).observe(document.body, { childList: true, subtree: true });
  tarjetas();
})();
