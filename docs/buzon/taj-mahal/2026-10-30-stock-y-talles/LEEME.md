# Taj Mahal · Talles por prenda (pedido de Marta)

**Qué quiere Marta:** que la clienta vea el talle de cada prenda **en letras** (S, M, L…) y, si Marta lo carga, **también en número** (por ejemplo «M (40)»). El talle va **por prenda** (vale para todos sus colores).

Hoy no hay campo de talle: Marta lo escribe dentro del color o de la descripción («Verde (Talle S/M)», «Talle S / M / L»).

## 1. Dato nuevo en cada prenda (catalog.js / base)

```js
talles: [{ letra: 'S' }, { letra: 'M', numero: '40' }, { letra: 'L' }]
```

- `letra`: obligatoria. Valores: XXS, XS, S, M, L, XL, XXL, XXXL o ÚNICO.
- `numero`: opcional (texto: «40», «3»…).
- Si una prenda no tiene `talles`, se ve como hoy.

## 2. Panel de carga (Marta, desde el celular)

- Botones para tocar y marcar varios: **XS · S · M · L · XL · XXL · Único**.
- Al lado de cada talle marcado, un casillero opcional para el número.
- Para las prendas que ya están cargadas, si se puede, pasar a este campo lo que hoy está escrito en el color o la descripción.

## 3. Tiendanube (lo más importante)

Si la prenda se compra en Tiendanube, el talle tiene que existir **también allá** como segunda propiedad de la variante (Color + Talle). Si no, la clienta elige un talle en la web y en el pago de Tiendanube no aparece.

Ojo con el stock: hoy el stock es por color. Con talle, cada combinación color + talle es una variante en Tiendanube. Definir con Marta cómo carga el stock (por combinación, o una unidad por combinación si son piezas únicas).

## 4. Web (ya hecho, archivos adjuntos)

- **`talles.js`** (nuevo): muestra el talle en la ficha (debajo del color) y en las tarjetas del catálogo («S · M · L»). Con varios talles, la clienta elige con botones y el talle elegido se suma solo al mensaje de WhatsApp. Agregar después de `ficha.js`:

  ```html
  <script src="talles.js" defer></script>
  ```
  (con el mismo atributo que usan los otros scripts).

- **`ficha.js`** (corregido): ya no muestra «Queda 1 en este color» (otro pedido de Marta: las clientas no ven cuántas unidades quedan).

- CSS sugerido para la tarjeta:

  ```css
  .product-talles { display: block; margin-top: 4px; font-size: 12px; letter-spacing: .08em; opacity: .75; }
  ```

En la ficha usa las mismas clases que los botones de color (`color-chips`, `color-chips-title`, `color-unico`), así que se ve igual sin CSS nuevo.
