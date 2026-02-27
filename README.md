# Interference

## Group Members
| Full Name | WatID | Student Number |
|-----------|-------|----------------|
| Moosa Malik | m57malik | 20913010 |

## Description
Interference is a psychedelic wave-interference world to explore using WASD or arrow keys. The background is a real-time simulation of 13 circular wave sources whose superposition determines the colour of every tile on screen — the same physics behind soap bubble iridescence and moiré patterns. The world responds to the player's presence: it begins dark and desaturated, with colour slowly unlocking as you explore. Moving fast makes the interference field chaotic and vivid; standing still lets it settle into something calm and geometric. Your path is recorded as persistent glowing footprints that fade over time, leaving a mark of where you have been.

Nine visual anomalies are hidden across the 4000×3000 world — three Blooms (expanding rings of light), three Vortexes (rotating spiral arms around a glowing eye), and three Glitch zones (corrupted scanlines and colour breaks). Each anomaly fades in as you approach and triggers a discovery pulse when entered for the first time. A counter in the top right tracks how many anomalies have been found.

**Bonus:** Nine discoverable visual anomalies (Bloom, Vortex, Glitch) hidden across the world, each with a unique visual effect and a screen-wide discovery pulse on first encounter.

## Setup and Interaction Instructions
1. Open `index.html` in Google Chrome, or visit the GitHub Pages link.
2. Click on the canvas to ensure keyboard focus.
3. Use **WASD** or **Arrow Keys** to move through the world.
4. Move slowly and explore — the world reveals colour and anomalies as you navigate.
5. Try standing completely still and watch the interference field settle.

## Iteration Notes

### Post-Playtest
1. Added a chaos/calm system so that moving fast makes the world more visually electric and standing still lets it settle — playtesting showed the original static feel was too uniform and emotionally flat.
2. Extended the trail length from 55 to 120 points and added persistent footprints so the world visibly remembers where you have been, which made exploration feel more personal.
3. Added a full-screen discovery flash and expanding pulse rings on anomaly discovery — early testing showed the original fade-in alone was too subtle to feel like a meaningful moment.

### Post-Showcase
1. Add ambient generative audio — sine tones that shift in pitch and texture based on the chaos value, so the sound also reflects whether the player is rushing or still.
2. Add directional hints (faint shimmer in the interference pattern) that subtly guide the player toward undiscovered anomalies without explicitly marking them on a map.

## Assets
No external image or audio assets were used. All visuals are generated programmatically using p5.js.

- p5.js v1.9.0 [1]
- p5.sound library [1]

## References
[1] Processing Foundation. 2024. *p5.js*. Retrieved from https://p5js.org
