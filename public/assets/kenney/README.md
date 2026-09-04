# Kenney assets used by Hopilo

Hopilo includes only the lightweight files listed below. All of them are distributed by Kenney under Creative Commons Zero (CC0); see `LICENSE.txt`.

## Minigolf Kit 3.1

Source: https://kenney.nl/assets/minigolf-kit

| Local file | Use |
| --- | --- |
| `minigolf/flag-blue.glb` | Optional checkpoint marker behind the primitive flag. |
| `minigolf/flag-large-blue.glb` | Optional goal marker behind the checkered primitive goal. |
| `minigolf/tunnel-wide.glb` | Background arch/tunnel in beach and space. |
| `minigolf/obstacle-block.glb` | Toy barrier in the wood background and space surface variation. |
| `minigolf/obstacle-diamond.glb` | Background route/coast/orbit marker. |
| `minigolf/straight.glb` | Thin visual veneer aligned to platform data. |
| `minigolf/narrow-block.glb` | Thin walkway veneer and wood background prop. |
| `minigolf/ramp-low.glb` | Forest surface variation and background beach ramp. |
| `minigolf/Textures/colormap.png` | Shared source texture required by the selected GLB files. |

## Mini Forest 1.0

Source: https://kenney.nl/assets/mini-forest

| Local file | Use |
| --- | --- |
| `mini-forest/tree.glb` | Sparse forest-only background tree. |
| `mini-forest/rocks-low.glb` | Sparse forest-only background rocks. |
| `mini-forest/plant.glb` | Sparse forest-only background plant. |
| `mini-forest/stones.glb` | Sparse forest-only background stones. |
| `mini-forest/Textures/colormap.png` | Shared source texture required by the selected GLB files. |

## Particle Pack 1.1

Source: https://kenney.nl/assets/particle-pack

The selected transparent sprites were resized from 512×512 to 128×128 to reduce download and GPU memory cost.

| Local file | Source file | Use |
| --- | --- | --- |
| `vfx/gem-spark.png` | `spark_04.png` | Faceted gem burst. |
| `vfx/landing-dust.png` | `dirt_02.png` | Small landing dust. |
| `vfx/water-foam.png` | `circle_04.png` | Water/foam splash. |
| `vfx/fan-air.png` | `Rotated/trace_02_rotated.png` | Continuous fan airflow cue. |
| `vfx/goal-star.png` | `star_06.png` | Goal celebration stars. |

## UI Pack 2.0

Source: https://kenney.nl/assets/ui-pack

| Local file | Source file | Use |
| --- | --- | --- |
| `ui/panel-border.png` | `Blue/Default/button_rectangle_border.png` | Nine-slice-style border for pause, dialogs and level cards. |
| `ui/pause-tile.png` | `Blue/Default/button_square_depth_flat.png` | Pause button base. |
| `ui/star-filled.png` | `Blue/Default/star.png` | Earned stars. |
| `ui/star-outline.png` | `Grey/Default/star_outline_depth.png` | Unearned stars. |

## Existing mobile-control icons

Source: https://kenney.nl/assets/mobile-controls

`ui/direction-left.png`, `ui/direction-right.png`, `ui/jump.png` and `ui/pause.png` remain because they are clearer at touch size than the generic UI Pack arrows. They are also CC0.

## Runtime contract

The game creates every collider from TypeScript/Rapier primitives. GLB files and particle/UI images are optional presentation only. A failed load leaves the themed primitive surface, route, obstacle, checkpoint, goal and controls usable. Model and texture leases are reference counted and released when the level ends.
