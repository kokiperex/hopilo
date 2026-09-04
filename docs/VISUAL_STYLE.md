# Estilo visual

## Dirección

3D low-poly minimalista con apariencia de juguete colorido.

## Reglas visuales

- Usar cubos, cilindros, esferas, conos y planos siempre que sea posible.
- Preferir colores planos, degradados suaves y materiales simples.
- Mantener sombras suaves y una iluminación ligera.
- Usar pocos elementos decorativos por escena.
- Mantener una silueta de canica clara y una escala visual consistente en los siete skins del MVP.
- Usar una estela luminosa sutil sin ocultar obstáculos.
- Aplicar animaciones simples de rebote y squash & stretch.
- Combinar superficies primitivas exactas con chapas modulares low-poly muy finas: arena y bordes turquesa en Playa; tablones y listones en Madera; paneles con juntas tenues en Espacio; tierra, raíz y hierba espaciada en Bosque.
- Mantener los props importados detrás de la ruta y con una densidad máxima aproximada de dos o tres siluetas por ancho de cámara.
- Mantener VFX por debajo de un segundo, con pocas partículas, pooling y reducción adicional cuando `prefers-reduced-motion` esté activo.

## Consistencia

La posición del HUD, los controles, el contador de gemas, las estrellas, la cámara y la escala de gameplay deben mantenerse constantes entre mundos.

## Skins

- El skin azul de vidrio conserva el aspecto original.
- Los otros seis skins siguen la lámina `docs/concepts/skins-concept-v1.png`.
- Los detalles que sobresalen, como las púas de la llanta, son decorativos y redondeados; no alteran el collider.
- Los motivos de Turquía y Perú deben ser inequívocos y mantener buen contraste.
- Las caras de los seis skins nuevos deben ser simples, amables y legibles a tamaño pequeño.
