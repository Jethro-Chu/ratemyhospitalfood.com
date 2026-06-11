import GameAudio from '../mattMozzarella/audio';

/** Tray Dash sounds — extends the shared WebAudio blip kit. */
export default class TrayDashAudio extends GameAudio {
    slide()     { this._blip(260, 0.12, 'sawtooth', 0.04, 130); }
    jello()     { this._blip(760, 0.09, 'triangle', 0.06, 1140); }
    fork()      { [880, 1320].forEach((f, i) => setTimeout(() => this._blip(f, 0.1, 'triangle', 0.07), i * 70)); }
    shieldUp()  { [520, 780, 1040].forEach((f, i) => setTimeout(() => this._blip(f, 0.1, 'triangle', 0.06), i * 60)); }
    shieldPop() { this._blip(420, 0.16, 'square', 0.07, 180); }
    crash()     { this._blip(180, 0.45, 'sawtooth', 0.09, 55); }
    milestone() { [660, 990].forEach((f, i) => setTimeout(() => this._blip(f, 0.09, 'square', 0.05), i * 90)); }
}
