"""Turret Merge: deterministic procedural SFX. Python 3 + NumPy only.
Run: python turret_merge_sfx_generator.py
Exports 16-bit mono 32 kHz WAVs and turret_merge_sfx.zip (<3 MiB).
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import wave
import numpy as np

SR = 32000
OUT = Path(__file__).resolve().parent
WAVDIR = OUT / 'turret_merge_wav'
WAVDIR.mkdir(exist_ok=True)
RNG = np.random.default_rng(260711)
PEAK = 10 ** (-1 / 20)  # -1 dBFS file normalization; use event gains in game


def track(sec):
    return np.zeros(int(SR * sec), dtype=np.float64)


def env(n, attack=.002, release=.035, decay=4):
    t = np.arange(n) / SR
    duration = n / SR
    return np.minimum(1., t / max(attack, 1/SR)) * \
        np.minimum(1., (duration - t) / max(release, 1/SR)) * np.exp(-decay * t)


def put(dst, at, audio):
    i = max(0, int(round(at * SR)))
    k = min(len(audio), len(dst)-i)
    if k > 0:
        dst[i:i+k] += audio[:k]


def T(y, at, dur, f0, f1=None, amp=.5, kind='sine', decay=4., a=.002, r=.03):
    n = max(2, int(dur * SR))
    t = np.arange(n) / SR
    f1 = f0 if f1 is None else f1
    freq = f0 * ((f1 / f0) ** (t / max(dur, 1 / SR)))
    phase = 2 * np.pi * np.cumsum(freq) / SR
    if kind == 'tri':
        s = (np.sin(phase) + np.sin(3*phase)/9 + np.sin(5*phase)/25) / 1.15
    elif kind == 'saw':
        # Band limited enough for these short, mid-pitched game tones.
        s = sum(np.sin(k*phase) / k for k in range(1, 7)) / 1.7
    elif kind == 'square':
        s = sum(np.sin(k*phase) / k for k in (1, 3, 5, 7)) / 1.24
    elif kind == 'metal':
        s = .67*np.sin(phase) + .26*np.sin(phase*2.41) + .16*np.sin(phase*4.13)
    elif kind == 'fm':
        s = np.sin(phase + (2.2*np.exp(-13*t))*np.sin(2.63*phase))
    else:
        s = np.sin(phase)
    put(y, at, amp * s * env(n, a, r, decay))


def N(y, at, dur, amp=.3, color='high', decay=20., a=.0007, r=.025):
    n = max(2, int(dur*SR))
    z = RNG.standard_normal(n)
    if color == 'low':
        z = np.convolve(z, np.ones(35)/35, mode='same')
    elif color == 'mid':
        z = np.convolve(z, np.ones(7)/7, mode='same')
        z -= np.convolve(z, np.ones(43)/43, mode='same')
    elif color == 'high':
        z -= np.convolve(z, np.ones(11)/11, mode='same')
    elif color == 'crunch':
        z = np.repeat(z[::6], 6)[:n]
        z -= np.convolve(z, np.ones(33)/33, mode='same')
    z /= max(np.std(z), 1e-8)
    put(y, at, amp * z * env(n, a, r, decay))


def I(y, at, power=.7, dur=.20):
    # Translation-friendly thud: fundamentals + higher harmonic + crack.
    T(y, at, dur, 280, 105, power*.75, 'tri', 13, .001, .07)
    T(y, at, dur*.75, 480, 180, power*.23, 'sine', 18, .001, .03)
    N(y, at, .065, power*.30, 'mid', 36, .0002, .015)


def motif(y, at, step=.090, scale=1., amp=.3, mode='bell'):
    # E - B - G: fifth up then minor-tonic color. The identity of Turret Merge.
    for j, f in enumerate((329.63, 493.88, 392.00)):
        T(y, at + j*step, .21, f*scale, f*scale*.99, amp*(.95-.12*j),
          'metal' if mode == 'bell' else 'tri', 9., .0015, .10)


def make(name, d):
    y = track(d)
    if name == 'ui_tap':
        T(y, 0, .075, 1510, 1130, .40, 'tri', 29, .001, .011)
        N(y, 0, .018, .11, 'high', 110)
    elif name == 'ui_back':
        T(y, 0, .13, 1080, 660, .40, 'tri', 19, .001, .026)
        T(y, .022, .07, 740, 530, .15, 'sine', 26)
    elif name == 'summon':
        N(y, 0, .18, .11, 'high', 11, .008, .06)
        T(y, 0, .22, 330, 690, .31, 'saw', 9, .012, .05)
        T(y, .12, .20, 660, 430, .29, 'fm', 13, .001, .06)
        I(y, .18, .38, .14)
        T(y, .235, .12, 1180, 1350, .13, 'sine', 16)
    elif name == 'place_lock':
        T(y, 0, .15, 710, 310, .26, 'fm', 15)
        N(y, .10, .040, .25, 'mid', 45)
        T(y, .115, .14, 810, 690, .23, 'metal', 13)
    elif name in ('merge_1', 'merge_2', 'merge_3', 'merge_high'):
        idx = {'merge_1': 0, 'merge_2': 1, 'merge_3': 2, 'merge_high': 3}[name]
        p = [1., 1.06, .95, 1.5][idx]
        T(y, 0, .24, 420*p, 700*p, .25, 'tri', 8, .008, .065)
        T(y, .038, .20, 880*p, 480*p, .25, 'fm', 9, .003, .035)
        I(y, .16, [.45, .52, .57, .66][idx], .19)
        motif(y, .18, .068, [1., 1.12, .90, 1.5][idx], .19 if idx < 3 else .32)
        if idx == 3:
            N(y, .21, .37, .15, 'high', 5, .03, .12)
            T(y, .30, .40, 510, 790, .20, 'metal', 5, .010, .16)
    elif name == 'jackpot':
        motif(y, 0, .115, 2.0, .38)
        motif(y, .31, .070, 3.0, .20)
        I(y, .28, .54, .23)
        N(y, .28, .44, .13, 'high', 5, .005, .14)
        T(y, .39, .43, 1020, 1450, .24, 'metal', 6, .004, .18)
    elif name == 'breakthrough':
        T(y, 0, .30, 200, 620, .40, 'saw', 6, .008, .03)
        for j in range(4):
            T(y, .08+j*.066, .13, 440*(1.13**j), 520*(1.13**j),
              .16, 'fm', 17, .001, .028)
        I(y, .35, .86, .24)
        T(y, .39, .38, 659.26, 659.26, .26, 'metal', 5, .002, .17)
        N(y, .355, .22, .18, 'high', 13)
    elif name == 'level_up':
        motif(y, .03, .07, 1.35, .28)
        I(y, .22, .35, .12)
    elif name == 'reveal':
        N(y, 0, .14, .10, 'high', 5, .02, .07)
        T(y, .04, .27, 530, 1060, .25, 'metal', 7)
        T(y, .19, .17, 990, 1240, .17, 'sine', 10)
    elif name == 'star_milestone':
        motif(y, .02, .095, 2.0, .31)
        I(y, .245, .50, .16)
        T(y, .27, .30, 880, 1030, .17, 'metal', 7)
    elif name == 'hit_light':
        T(y, 0, .041, 730, 490, .35, 'fm', 38, .0004, .010)
        N(y, 0, .020, .23, 'mid', 80)
    elif name == 'crit':
        # Midrange dual-knock + bright tail, disjoint from gun presence.
        T(y, 0, .100, 790, 585, .45, 'metal', 17, .0005, .020)
        T(y, .031, .110, 1150, 1620, .30, 'fm', 17, .001, .05)
        N(y, 0, .019, .19, 'high', 75)
    elif name == 'kill_small':
        T(y, 0, .086, 550, 350, .28, 'tri', 30)
        N(y, 0, .035, .20, 'mid', 60)
        T(y, .037, .065, 390, 230, .12, 'sine', 27)
    elif name == 'boss_intro':
        T(y, 0, .30, 220, 196, .28, 'saw', 6, .015, .08)
        T(y, .18, .41, 174.6, 164.8, .38, 'metal', 3, .012, .14)
        for t0 in (.07, .22, .38):
            N(y, t0, .043, .17, 'mid', 40)
        T(y, .48, .35, 370, 240, .27, 'tri', 7, .002, .11)
        I(y, .58, .53, .22)
    elif name == 'boss_skill':
        for j in range(3):
            T(y, .045+j*.135, .095, 650+150*j, 990+160*j,
              .24, 'fm', 13, .003, .028)
        T(y, .39, .23, 290, 170, .34, 'saw', 10)
        N(y, .42, .11, .15, 'high', 16)
    elif name == 'boss_down':
        I(y, 0, .84, .36)
        I(y, .22, .87, .42)
        for k in range(6):
            N(y, .10+k*.097, .068, .13, 'mid', 22)
        T(y, .32, .66, 420, 130, .37, 'metal', 5, .010, .20)
        motif(y, .58, .12, .5, .14)
    elif name == 'wave_start':
        T(y, 0, .32, 340, 690, .27, 'saw', 5, .007, .04)
        N(y, 0, .20, .11, 'high', 7, .015, .05)
        I(y, .30, .43, .18)
        T(y, .35, .27, 493.88, 493.88, .15, 'metal', 9)
    elif name == 'wave_clear':
        motif(y, .01, .082, 1.45, .27)
        T(y, .26, .17, 784, 660, .15, 'sine', 12)
    elif name == 'win':
        motif(y, .04, .13, 1.0, .37)
        motif(y, .42, .11, 2.0, .31)
        I(y, .55, .42, .22)
        T(y, .64, .41, 784, 784, .24, 'metal', 4, .005, .16)
    elif name == 'lose':
        T(y, 0, .32, 495, 370, .34, 'tri', 5, .003, .1)
        T(y, .24, .35, 392, 246.9, .31, 'metal', 6, .001, .17)
        I(y, .44, .28, .20)
        T(y, .47, .30, 165, 92, .24, 'sine', 5, .001, .19)
    elif name in ('shot_gun', 'shot_gatling'):
        fac = .88 if name == 'shot_gatling' else 1.
        T(y, 0, .062, 340*fac, 145*fac, .43, 'fm', 38, .0002, .012)
        N(y, 0, .047, .39, 'mid', 44)
        N(y, .005, .025, .19, 'high', 58)
    elif name == 'shot_sniper':
        N(y, 0, .035, .41, 'high', 56)
        T(y, 0, .16, 1130, 380, .43, 'fm', 23, .0004, .035)
        T(y, .018, .13, 620, 340, .30, 'metal', 23)
    elif name == 'shot_cannon':
        I(y, 0, .80, .20)
        N(y, .016, .16, .38, 'low', 18)
        T(y, .06, .20, 260, 130, .29, 'tri', 10)
    elif name == 'shot_launcher':
        N(y, 0, .08, .24, 'mid', 27)
        T(y, .015, .25, 330, 730, .38, 'saw', 8, .01, .045)
        N(y, .14, .12, .16, 'high', 17)
    elif name == 'shot_laser':
        T(y, 0, .14, 1150, 540, .40, 'sine', 14, .002, .035)
        T(y, .002, .12, 2300, 1400, .14, 'fm', 16)
        N(y, .015, .055, .10, 'high', 28)
    elif name == 'shot_energy':
        T(y, 0, .20, 500, 900, .39, 'fm', 13, .006, .035)
        T(y, .02, .15, 1010, 660, .24, 'metal', 15)
        N(y, .07, .045, .09, 'high', 34)
    elif name == 'shot_frost':
        T(y, 0, .16, 900, 620, .25, 'metal', 12, .001, .06)
        for j in range(3):
            T(y, .035+j*.035, .088, 1520+j*170, 1270+j*105,
              .095, 'sine', 23, .0005, .035)
        N(y, .01, .12, .10, 'high', 18)
    elif name == 'shot_fire':
        N(y, 0, .21, .30, 'mid', 10, .003, .060)
        N(y, .015, .12, .18, 'high', 20)
        T(y, .005, .22, 220, 365, .20, 'saw', 12, .005, .06)
        for t0 in (.04, .105, .157):
            T(y, t0, .054, 490, 340, .085, 'fm', 28)
    elif name == 'shot_poison':
        T(y, 0, .22, 420, 240, .28, 'fm', 11, .002, .08)
        T(y, .07, .16, 770, 560, .18, 'tri', 12)
        N(y, .02, .16, .12, 'low', 13)
    elif name == 'shot_lightning':
        for t0 in (0, .037, .073):
            N(y, t0, .026, .34, 'high', 75)
            T(y, t0, .055, 1550, 620, .14, 'fm', 38)
        T(y, .01, .15, 610, 450, .18, 'metal', 19)
    elif name == 'shot_melee':
        N(y, 0, .12, .28, 'high', 13, .007, .030)
        T(y, .035, .11, 720, 270, .29, 'fm', 28)
        N(y, .085, .034, .22, 'mid', 52)
    elif name == 'shot_summoner':
        T(y, 0, .22, 430, 720, .30, 'tri', 12, .003, .06)
        T(y, .10, .16, 780, 910, .23, 'metal', 13)
        N(y, .11, .06, .10, 'high', 25)
    elif name == 'shot_explosion':
        I(y, 0, .8, .24)
        N(y, 0, .21, .35, 'mid', 15)
        N(y, .05, .22, .27, 'low', 12)
    elif name == 'support_pulse':
        T(y, 0, .30, 460, 750, .27, 'sine', 8, .01, .10)
        T(y, .06, .28, 920, 1180, .20, 'tri', 9, .008, .10)
        T(y, .19, .15, 780, 780, .11, 'metal', 12)
    else:
        raise ValueError(name)
    # Global edges, DC removal and low-cost smooth saturation.
    fade = min(int(.003*SR), len(y)//4)
    y[:fade] *= np.linspace(0, 1, fade)
    y[-fade:] *= np.linspace(1, 0, fade)
    y -= np.mean(y)
    pk = np.max(np.abs(y))
    if pk < 1e-8:
        raise ValueError('Silent: '+name)
    drive = 1.06 if name.startswith(('shot_', 'hit_', 'kill_')) else 1.16
    y = np.tanh(y/pk*drive) / np.tanh(drive)
    y *= PEAK / max(np.max(np.abs(y)), 1e-10)
    return y


# Durations are deliberate, not padded to arbitrary 1-second files.
DURATIONS = {
    'ui_tap': .09, 'ui_back': .15, 'summon': .40, 'place_lock': .28,
    'merge_1': .48, 'merge_2': .48, 'merge_3': .48, 'merge_high': .82,
    'jackpot': .99, 'breakthrough': .90, 'level_up': .47,
    'reveal': .42, 'star_milestone': .70,
    'hit_light': .060, 'crit': .17, 'kill_small': .13,
    'boss_intro': 1.00, 'boss_skill': .69, 'boss_down': 1.30,
    'wave_start': .72, 'wave_clear': .52, 'win': 1.12, 'lose': .87,
    'shot_gun': .082, 'shot_gatling': .073, 'shot_sniper': .19,
    'shot_cannon': .34, 'shot_launcher': .34, 'shot_laser': .18,
    'shot_energy': .25, 'shot_frost': .22, 'shot_fire': .27,
    'shot_poison': .30, 'shot_lightning': .20, 'shot_melee': .18,
    'shot_summoner': .31, 'shot_explosion': .38,
    'support_pulse': .44,
}


def main():
    log = ['filename,duration_ms,peak_dbfs,rms_dbfs']
    for name, dur in DURATIONS.items():
        y = make(name, dur)
        pcm = np.clip(np.rint(y * 32767), -32768, 32767).astype('<i2')
        f = WAVDIR / (name + '.wav')
        with wave.open(str(f), 'wb') as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(pcm.tobytes())
        peak = 20*np.log10(np.max(np.abs(pcm.astype(float)))/32768)
        rms = 20*np.log10(np.sqrt(np.mean((pcm.astype(float)/32768)**2)))
        log.append(f'{f.name},{dur*1000:.0f},{peak:.2f},{rms:.2f}')
    (OUT / 'turret_merge_sfx_levels.csv').write_text('\n'.join(log)+'\n', encoding='utf-8')
    zpath = OUT / 'turret_merge_sfx.zip'
    with ZipFile(zpath, 'w', compression=ZIP_DEFLATED, compresslevel=9) as z:
        for f in sorted(WAVDIR.glob('*.wav')):
            z.write(f, 'wav/'+f.name)
        z.write(Path(__file__), 'turret_merge_sfx_generator.py')
        z.write(OUT/'turret_merge_sfx_levels.csv', 'levels.csv')
        design = OUT/'turret_merge_sound_design.md'
        if design.exists():
            z.write(design, 'turret_merge_sound_design.md')
    print(f'{len(DURATIONS)} WAVs @ {SR} Hz, mono PCM16; ZIP {zpath.stat().st_size/1048576:.2f} MiB')
    print('\n'.join(log[:10]))
    print('...')
    print('\n'.join(log[-6:]))


if __name__ == '__main__':
    main()
