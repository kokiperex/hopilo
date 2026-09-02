# Hopilo — Product Specification

**Estado:** Concepto definido / base para MVP  
**Plataforma:** Juego web para dispositivos móviles  
**Orientación:** Horizontal  
**Público principal:** Niños de aproximadamente 5 años, con acompañamiento opcional de un adulto  
**Nombre de trabajo:** Hopilo

## 1. Resumen del producto

Hopilo es un juego web de obstáculos en el que el jugador controla una canica personalizable a través de circuitos 2.5D coloridos y sencillos. La canica rueda, salta, rebota y esquiva obstáculos hasta llegar a la bandera final.

El juego debe ser fácil de entender para un niño pequeño, rápido de iniciar y ligero para funcionar en teléfonos móviles desde el navegador. La profundidad visual será 3D, pero el movimiento se mantendrá principalmente en un plano horizontal para reducir la complejidad de los controles.

## 2. Visión del producto

Crear una experiencia breve, alegre y accesible en la que aprender a jugar tome solo unos segundos, mientras que dominar los circuitos ofrezca suficientes retos para volver a jugar.

Principios del producto:

- Fácil de comenzar.
- Controles mínimos y claros.
- Física divertida, predecible y tolerante.
- Escenarios visualmente atractivos sin sobrecargar el dispositivo.
- Progreso sin presión de tiempo.
- Sin compras ni microtransacciones en el MVP.

## 3. Jugabilidad principal

### Bucle de juego

1. El jugador elige un skin de canica.
2. Selecciona un mundo y un nivel.
3. La canica comienza en el punto de inicio.
4. El jugador rueda y salta para superar el circuito.
5. Recoge gemas opcionales.
6. Activa checkpoints cuando existan.
7. Llega a la bandera final.
8. Recibe una evaluación de hasta tres estrellas.

### Movimiento

- Movimiento lateral izquierda/derecha.
- Salto mediante un botón dedicado.
- Gravedad, aceleración, inercia, fricción y rebote suaves.
- Rampas y pendientes que se recorren sin controles adicionales.
- Reinicio sencillo si la canica cae o toca un peligro.
- Cámara lateral fija o con seguimiento suave.
- La profundidad del escenario es principalmente decorativa; no se requiere desplazamiento libre hacia el fondo.

### Controles

La interfaz debe ofrecer siempre la misma disposición:

- Flecha izquierda: desplazarse hacia la izquierda.
- Flecha derecha: desplazarse hacia la derecha.
- Botón de salto: saltar o activar rebotes.
- Botón de pausa: pausar la partida y mostrar opciones básicas.

No se utilizarán botones arriba/abajo ni joystick en el MVP. El diseño de niveles debe resolver las diferencias de altura mediante rampas, saltos, plataformas y elementos que impulsen a la canica.

Los controles táctiles deben ser grandes, separados y fáciles de pulsar. También se recomienda admitir teclado en escritorio con las flechas izquierda/derecha y una tecla de salto.

## 4. Estructura de contenido

El MVP tendrá cuatro mundos temáticos:

1. **Beach World / Mundo Playa** — arena, agua, rampas y elementos de playa.
2. **Wood World / Mundo Madera** — bloques, puentes y piezas con apariencia de juguete de madera.
3. **Space World / Mundo Espacio** — plataformas flotantes, planetas y fondos espaciales simples.
4. **Forest World / Mundo Bosque** — hojas, troncos, rocas y obstáculos naturales.

Cada mundo puede contener aproximadamente 10 niveles, para un objetivo inicial de 40 niveles.

### Progresión

- Los primeros niveles enseñan movimiento, salto y llegada a la meta.
- Los niveles intermedios combinan plataformas, rampas y obstáculos móviles.
- Los niveles avanzados añaden secuencias de saltos, timing y rutas opcionales.
- La dificultad debe aumentar gradualmente, sin castigar excesivamente los errores.
- No debe existir un límite de tiempo.
- No se mostrará un indicador de progreso durante el gameplay.

## 5. Obstáculos y elementos

Elementos previstos para la primera versión:

- Plataformas estáticas.
- Rampas y pendientes.
- Puentes.
- Plataformas móviles.
- Cintas transportadoras.
- Trampolines y resortes.
- Ventiladores que empujan.
- Martillos oscilantes o giratorios.
- Pinchos y zonas peligrosas.
- Huecos o caídas.
- Checkpoints.
- Gemas coleccionables.
- Bandera o portal de meta.

Los obstáculos deben comunicar claramente si son seguros, móviles o peligrosos. La lectura visual es más importante que el realismo físico.

## 6. Recompensas y evaluación

### Gemas

- Son el único coleccionable principal del MVP.
- Deben ser visibles y opcionales.
- Su contador se muestra en el HUD.
- Recogerlas debe producir una respuesta visual y sonora breve.

### Estrellas

Cada nivel puede otorgar hasta tres estrellas según criterios simples, por ejemplo:

- Completar el nivel.
- Recoger la mayoría o todas las gemas.
- Completarlo con pocos reinicios o errores.

Los criterios exactos pueden ajustarse después de probar la dificultad real.

### Sin presión de tiempo

El juego no tendrá cronómetro ni clasificación basada en velocidad. La prioridad es explorar, aprender y completar el circuito con tranquilidad.

## 7. Dirección visual

### Estilo base

El estilo será **3D low-poly minimalista**, con un enfoque de juguete colorido:

- Geometría basada en cubos, cilindros, esferas, conos y planos.
- Colores planos y degradados suaves.
- Pocas o ninguna textura compleja.
- Bordes redondeados cuando sea posible.
- Sombras suaves y luz ambiental sencilla.
- Fondos limpios con pocos elementos decorativos.
- Animaciones simples de rebote y squash & stretch.

El escenario tendrá volumen 3D, pero conservará la legibilidad de un juego 2D lateral. Cada mundo cambiará la paleta y los elementos decorativos, manteniendo la misma gramática visual.

### Referencia visual

La imagen `reference/visual_reference.png` establece la dirección visual de los cuatro mundos y debe utilizarse como guía de composición, color y legibilidad. La referencia presenta una cuadrícula 2×2 con las variantes **Mundo Playa**, **Mundo Madera**, **Mundo Espacio** y **Mundo Bosque**. No representa una pantalla única del juego, sino un panel de referencia para mantener consistencia entre temas.

Características visuales que deben conservarse:

- Cámara lateral fija o con seguimiento suave, con el circuito ocupando la franja inferior y central de la pantalla.
- Escenarios construidos con plataformas modulares apiladas, rampas, bloques y piezas reutilizables con apariencia de juguete.
- Paletas diferenciadas por mundo: arena y turquesa en Playa; madera cálida en Madera; azul, blanco y violeta en Espacio; verdes y marrones en Bosque.
- Fondos temáticos suaves y desenfocados, subordinados al circuito: costa tropical, interior de taller, espacio estrellado y bosque.
- Contraste alto entre plataformas, obstáculos, gemas y fondo para que un niño pueda identificar rápidamente por dónde avanzar.
- Obstáculos reconocibles por su silueta y color: pinchos blancos, plataformas móviles, martillos, trampolines y ventiladores.
- Meta representada por una bandera a cuadros sobre una estructura elevada y claramente visible.
- Gemas verdes con forma facetada, flotando sobre la ruta y funcionando como coleccionables opcionales.
- Interfaz táctil translúcida y redondeada, consistente en los cuatro mundos: pausa arriba a la izquierda, estrellas junto a la pausa, contador de gemas arriba a la derecha, controles izquierda/derecha abajo a la izquierda y salto abajo a la derecha.

La referencia sugiere un acabado más pulido y suave que un low-poly estricto; se puede utilizar iluminación ambiental, materiales simples, desenfoque selectivo y formas biseladas sin convertir el MVP en una experiencia visual pesada ni realista. La interfaz, la escala de la cámara y la posición de los elementos del HUD deben permanecer constantes aunque cambien el color, los materiales y la decoración de cada mundo.

### Skins de la canica

- Siete skins disponibles para todos desde el inicio: azul de vidrio, llanta con púas suaves, multicolor, rojo y marrón, Turquía, Perú y X multicolor.
- El skin se elige después de pulsar “Jugar” y antes de seleccionar mundo y nivel.
- La selección se guarda localmente y se reutiliza en partidas posteriores.
- Todos los skins mantienen el mismo tamaño, collider, peso y comportamiento.
- Cada skin puede ajustar su material y el color de su pequeña estela luminosa.
- La estela debe ser sutil y no ocultar obstáculos ni controles.

### Consistencia entre mundos

Deben mantenerse constantes:

- Posición y tamaño de los controles.
- Posición del botón de pausa.
- Posición del contador de gemas.
- Escala física y legibilidad de la canica seleccionada.
- Cámara y escala de gameplay.
- Tratamiento de metas, checkpoints y peligros.

## 8. Interfaz de usuario

La pantalla de gameplay debe ser limpia y contener únicamente:

- Botón de pausa.
- Contador de gemas.
- Indicador de estrellas del nivel, cuando corresponda.
- Flecha izquierda.
- Flecha derecha.
- Botón de salto.

No incluir en el gameplay:

- Contador de tiempo.
- Barra o indicador de progreso del nivel.
- Texto permanente como “Llega a la bandera”.
- Caja negra inferior.
- Flechas explicativas flotantes innecesarias.
- Monedas adicionales si las gemas ya cumplen la función de coleccionable.

Pantallas adicionales previstas:

- Pantalla de inicio.
- Selección de skin en cuadrícula.
- Selección de mundo.
- Selección de nivel.
- Resultado del nivel.
- Pausa.
- Ajustes básicos.

## 9. Audio y respuesta

El MVP debe incluir respuestas breves y claras para:

- Saltar.
- Recoger una gema.
- Activar un checkpoint.
- Golpear un obstáculo.
- Llegar a la meta.
- Completar un nivel.

La música debe ser alegre, discreta y apta para sesiones cortas. El audio debe poder desactivarse desde ajustes o pausa.

## 10. Arquitectura de niveles

Los niveles deben describirse mediante datos configurables, preferentemente JSON, en lugar de codificarse de forma rígida dentro de la lógica del juego.

Ejemplo conceptual:

```json
{
  "id": "forest-01",
  "world": "forest",
  "spawn": { "x": 0, "y": 1 },
  "platforms": [],
  "ramps": [],
  "hazards": [],
  "movingPlatforms": [],
  "gems": [],
  "checkpoints": [],
  "goal": { "x": 30, "y": 1 }
}
```

La estructura debe permitir añadir niveles y ajustar posiciones sin modificar el motor principal. También debe facilitar la generación posterior de niveles asistida por IA.

## 11. Requisitos técnicos de alto nivel

- Juego web ejecutable en navegador moderno.
- Diseño responsive priorizando móviles en orientación horizontal.
- Renderizado 3D ligero, con posibilidad de usar Three.js, Babylon.js o una solución equivalente.
- Motor de física apropiado para esferas y colisiones, como Rapier o Cannon-es.
- Carga rápida y bajo consumo de memoria.
- Escenarios construidos principalmente con primitivas reutilizables.
- Guardado local del progreso del jugador.
- Soporte básico para ratón y teclado durante el desarrollo y pruebas.
- Pausa y reanudación sin perder el estado del nivel.

## 12. Guardado y progreso

El juego debe guardar localmente:

- Niveles desbloqueados.
- Mejor resultado de estrellas por nivel.
- Skin de canica seleccionado.
- Gemas obtenidas, si se decide contabilizarlas globalmente.
- Mundo alcanzado.
- Ajustes de audio.

El MVP no requiere cuentas de usuario, backend ni sincronización entre dispositivos.

## 13. Alcance del MVP

### Incluido

- Juego web horizontal.
- Movimiento lateral y salto.
- Física básica de canica.
- Cámara lateral 2.5D.
- Una canica azul de vidrio.
- Estela luminosa sutil.
- Cuatro mundos temáticos.
- Objetivo inicial de 40 niveles.
- Gemas, checkpoints y metas.
- Hasta tres estrellas por nivel.
- Pantallas principales de navegación.
- Guardado local.
- Controles táctiles, teclado y ratón básico.
- Sonidos y música simples.

### Fuera del MVP

- Selector de skins.
- Compras, anuncios o microtransacciones.
- Multijugador.
- Ranking online.
- Cuentas y sincronización en la nube.
- Editor de niveles para usuarios.
- Movimiento libre en profundidad.
- Gráficos realistas o assets 3D de alta complejidad.
- Cronómetro y clasificación por velocidad.

## 14. Versión 2.0: personalización

La arquitectura debe permitir cambiar el material visual de la canica sin cambiar su física. Las skins pueden desbloquearse por logros, no por compras.

Ideas futuras:

- Canica de fuego.
- Canica de hielo.
- Canica arcoíris.
- Planeta.
- Estrella.
- Caramelo.
- Canica de madera.

Todas las skins deben conservar el mismo tamaño, peso, colisiones y comportamiento para no alterar la jugabilidad.

## 15. Criterios de aceptación del MVP

El MVP se considera listo para pruebas cuando:

- Un jugador nuevo entiende los controles sin instrucciones extensas.
- La canica responde de forma consistente a izquierda, derecha y salto.
- Es posible completar varios niveles en un teléfono mediante controles táctiles.
- Los obstáculos se distinguen claramente del suelo y de los elementos decorativos.
- No existe cronómetro ni indicador de progreso en gameplay.
- La interfaz mantiene la misma posición en los cuatro mundos.
- El progreso y las estrellas sobreviven al cierre y reapertura del navegador.
- El juego mantiene un rendimiento fluido en teléfonos móviles de gama media.
- Los errores del jugador pueden corregirse con reinicios rápidos y checkpoints.
- La experiencia resulta apropiada para un niño de aproximadamente 5 años.

## 16. Decisiones pendientes

- Elegir el motor/renderizador final.
- Definir el número exacto de niveles por mundo.
- Ajustar los criterios de las tres estrellas.
- Definir la paleta final y el logotipo de Hopilo.
- Seleccionar música y sonidos.
- Decidir si las gemas se contabilizan por nivel, por mundo o globalmente.
- Verificar disponibilidad legal y comercial del nombre Hopilo antes de publicar.
