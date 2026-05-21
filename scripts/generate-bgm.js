/**
 * 지브리 & 애니메이션 명품 웨딩 BGM 10곡 다성부 피아노 연주 생성기
 * 
 * [혁신적 개편]
 * - 단순 단선율(X) -> 왼손 아르페지오/코드 반주 + 오른손 메인 멜로디의 "다성부(Polyphony) 피아노 연주"
 * - 서스테인 페달(Sustain Pedal) 효과 탑재: 모든 음이 뚝뚝 끊기지 않고 자연스럽게 겹치며 울려 퍼짐
 * - 피아노 특유의 우아하고 따뜻한 타건 해머 물리 감쇠 모델링(Karplus-Strong 개량형) 적용
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const VOLUME_BOOST = 0.85;

// 주파수 테이블 (C2~C6)
const F = { R: 0 };
const NOTE_NAMES = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];
for (let oct = 2; oct <= 6; oct++) {
  for (let i = 0; i < 12; i++) {
    const name = NOTE_NAMES[i] + oct;
    F[name] = 440 * Math.pow(2, ((oct + 1) * 12 + i - 69) / 12);
  }
}
// 플랫 별칭 매핑
const FLATS = {
  'Db2': 'Cs2', 'Eb2': 'Ds2', 'Gb2': 'Fs2', 'Ab2': 'Gs2', 'Bb2': 'As2',
  'Db3': 'Cs3', 'Eb3': 'Ds3', 'Gb3': 'Fs3', 'Ab3': 'Gs3', 'Bb3': 'As3',
  'Db4': 'Cs4', 'Eb4': 'Ds4', 'Gb4': 'Fs4', 'Ab4': 'Gs4', 'Bb4': 'As4',
  'Db5': 'Cs5', 'Eb5': 'Ds5', 'Gb5': 'Fs5', 'Ab5': 'Gs5', 'Bb5': 'As5',
  'Db6': 'Cs6', 'Eb6': 'Ds6', 'Gb6': 'Fs6', 'Ab6': 'Gs6', 'Bb6': 'As6',
};
for (const [flat, sharp] of Object.entries(FLATS)) {
  F[flat] = F[sharp];
}

// ── 피아노 현 물리 모델링 합성 (다성 서스테인 감쇠 보장) ──
function renderPianoNote(freq, durationSec, volume = 0.35) {
  if (freq === 0) return new Float32Array(0);

  // 실제 해머 타건 후 울림을 충분히 유지하기 위해 duration보다 긴 release 영역(Sustain) 확보
  const sustainSec = Math.max(durationSec, 3.2);
  const totalSamples = Math.floor(sustainSec * SAMPLE_RATE);

  const M = Math.max(2, Math.round(SAMPLE_RATE / freq));
  const ringBuffer = new Float32Array(M);

  // 1. 해머 타건 노이즈 + 피아노 현 초기 물리적 흥분 상태 (풍부한 백색 잡음 및 초기 배음 세팅)
  for (let i = 0; i < M; i++) {
    ringBuffer[i] = (Math.random() * 2 - 1) * 0.85;
  }

  const noteSamples = new Float32Array(totalSamples);
  const decayCoeff = 0.9994 - (freq / 45000); // 고음은 맑고 짧게, 저음은 풍성하고 깊게 울리도록 자동 조절

  // 2. Karplus-Strong 피드백 루프 + 피아노 타건 엔벨로프
  for (let i = 0; i < totalSamples; i++) {
    const p = i % M;
    const q = (i + 1) % M;

    // 로우패스 필터링으로 쇳소리 제거하고 부드러운 그랜드 피아노 나무 울림 재현
    ringBuffer[p] = decayCoeff * 0.5 * (ringBuffer[p] + ringBuffer[q]);

    // 타건 시점의 순간적 해머 어택 느낌 강화를 위한 어택 곡선 적용
    const t = i / SAMPLE_RATE;
    const attackEnv = t < 0.005 ? t / 0.005 : Math.exp(-2.2 * (t - 0.005));

    noteSamples[i] = ringBuffer[p] * attackEnv * volume;
  }

  return noteSamples;
}

// ── 전체 다성부 트랙 믹서 및 홀 리버브 ──
function synthesizePianoTrack(notes, totalSec) {
  const totalSamples = Math.floor(totalSec * SAMPLE_RATE);
  const mixBuffer = new Float32Array(totalSamples);

  // 모든 피아노 음표를 각자의 타임라인 위치에 누적 합산하여 완벽한 다성부(Polyphony) 및 서스테인 페달을 구현!
  for (const note of notes) {
    const startSample = Math.floor(note.time * SAMPLE_RATE);
    const noteSamples = renderPianoNote(note.freq, note.duration, note.volume);

    for (let i = 0; i < noteSamples.length; i++) {
      const targetIndex = startSample + i;
      if (targetIndex < totalSamples) {
        mixBuffer[targetIndex] += noteSamples[i];
      }
    }
  }

  // 홀 리버브(Reverb) 적용하여 대형 성당이나 프리미엄 결혼식 홀의 웅장함 연출
  const reverbBuffer = new Float32Array(totalSamples);
  const reflections = [
    { delaySec: 0.09, gain: 0.45 },
    { delaySec: 0.16, gain: 0.32 },
    { delaySec: 0.28, gain: 0.20 },
    { delaySec: 0.45, gain: 0.12 }
  ];

  for (let i = 0; i < totalSamples; i++) {
    reverbBuffer[i] = mixBuffer[i];
    for (const refl of reflections) {
      const delaySamples = Math.floor(refl.delaySec * SAMPLE_RATE);
      if (i >= delaySamples) {
        reverbBuffer[i] += mixBuffer[i - delaySamples] * refl.gain;
      }
    }
  }

  // 피크 노멀라이즈로 소리 찌그러짐(Clipping) 방지 및 음량 최대화
  let maxVal = 0;
  for (let i = 0; i < totalSamples; i++) {
    const absVal = Math.abs(reverbBuffer[i]);
    if (absVal > maxVal) maxVal = absVal;
  }

  const normFactor = maxVal > 0 ? (1.0 / maxVal) * VOLUME_BOOST : 1.0;

  // 16비트 PCM 버퍼 빌드
  const pcmBuffer = new Int16Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const val = reverbBuffer[i] * normFactor;
    pcmBuffer[i] = Math.max(-32768, Math.min(32767, val * 32767));
  }

  // WAV 포맷 헤더 추가
  const dataSize = pcmBuffer.length * 2;
  const wavHeader = Buffer.alloc(44 + dataSize);

  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(36 + dataSize, 4);
  wavHeader.write('WAVE', 8);
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16);
  wavHeader.writeUInt16LE(1, 20); // PCM format
  wavHeader.writeUInt16LE(1, 22); // Mono
  wavHeader.writeUInt32LE(SAMPLE_RATE, 24);
  wavHeader.writeUInt32LE(SAMPLE_RATE * 2, 28); // Byte rate (16-bit Mono = sampleRate * 2)
  wavHeader.writeUInt16LE(2, 32); // Block align
  wavHeader.writeUInt16LE(16, 34); // Bits per sample
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < pcmBuffer.length; i++) {
    wavHeader.writeInt16LE(pcmBuffer[i], 44 + i * 2);
  }

  return wavHeader;
}

// ── 10곡의 다성부 멜로디 & 반주 생성 매핑 ──
const SONGS = {};

// 1. 인생의 회전목마 (하울의 움직이는 성) - 3/4 박자 왈츠
SONGS.anime_howl = (() => {
  const notes = [];
  const addNote = (freq, time, duration, vol = 0.35) => {
    notes.push({ freq, time, duration, volume: vol });
  };

  const melody = [
    'A4', 'B4', 'C5', 'C5', 'B4', 'A4', 'E5', 'D5', 'C5', 'B4', 'R',
    'A4', 'G4', 'F4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'A4', 'R',
    'E5', 'D5', 'C5', 'D5', 'C5', 'B4', 'A4', 'R'
  ];
  const melodyTimes = [
    0.0, 0.5, 1.0, 2.0, 2.5, 3.0, 4.0, 5.0, 5.5, 6.0, 7.5,
    8.0, 8.5, 9.0, 10.0, 10.5, 11.0, 12.0, 13.0, 13.5, 14.0, 15.5,
    16.0, 17.0, 17.5, 18.0, 19.0, 19.5, 20.0, 21.5
  ];
  const melodyDurs = [
    0.4, 0.4, 0.9, 0.4, 0.4, 0.9, 0.9, 0.4, 0.4, 1.4, 0.4,
    0.4, 0.4, 0.9, 0.4, 0.4, 0.9, 0.9, 0.4, 0.4, 1.4, 0.4,
    0.9, 0.4, 0.4, 0.9, 0.4, 0.4, 1.4, 0.4
  ];

  // 왼손 왈츠 반주 (쿵 짝 짝)
  const leftRoots = [
    'G3', 'C3', 'D3', 'G3', 'C3', 'F3', 'Bb2', 'Eb3', 'A2', 'D3', 'G2'
  ];
  const leftChords = [
    ['Bb3', 'D4'], ['G3', 'C4'], ['Fs3', 'C4'], ['Bb3', 'D4'],
    ['G3', 'C4'], ['A3', 'F4'], ['D3', 'Bb3'], ['G3', 'Eb4'],
    ['C3', 'Fs3'], ['C3', 'Fs3'], ['Bb3', 'D4']
  ];

  // 4회 반복 (전체 약 90초)
  let baseTime = 0.0;
  for (let loop = 0; loop < 4; loop++) {
    // 오른손 멜로디 추가
    for (let i = 0; i < melody.length; i++) {
      if (melody[i] !== 'R') {
        addNote(F[melody[i]], baseTime + melodyTimes[i], melodyDurs[i] * 1.5, 0.5);
      }
    }
    // 왼손 왈츠 반주 추가 (2초 간격 쿵 짝 짝)
    let leftTime = 0.0;
    for (let i = 0; i < 11; i++) {
      const root = leftRoots[i];
      const chord = leftChords[i];
      // 쿵 (베이스)
      addNote(F[root], baseTime + leftTime, 0.8, 0.4);
      // 짝
      addNote(F[chord[0]], baseTime + leftTime + 0.6, 0.6, 0.3);
      addNote(F[chord[1]], baseTime + leftTime + 0.6, 0.6, 0.3);
      // 짝
      addNote(F[chord[0]], baseTime + leftTime + 1.2, 0.6, 0.3);
      addNote(F[chord[1]], baseTime + leftTime + 1.2, 0.6, 0.3);

      leftTime += 2.0;
    }
    baseTime += 22.0;
  }

  return synthesizePianoTrack(notes, baseTime + 2.0);
})();

// 2. 언제나 몇 번이라도 (센과 치히로의 행방불명) - 3/4 왈츠
SONGS.anime_chihiro = (() => {
  const notes = [];
  const addNote = (freq, time, duration, vol = 0.35) => {
    notes.push({ freq, time, duration, volume: vol });
  };

  const melody = [
    'C5', 'Bb4', 'A4', 'G4', 'A4', 'G4', 'F4', 'G4', 'F4', 'E4', 'R',
    'F4', 'G4', 'A4', 'Bb4', 'A4', 'G4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'Bb4', 'A4', 'G4', 'R'
  ];
  const melodyTimes = [
    0.0, 0.5, 1.0, 2.0, 2.5, 3.0, 4.0, 4.5, 5.0, 6.0, 7.5,
    8.0, 8.5, 9.0, 10.0, 10.5, 11.0, 12.0, 13.0, 13.5, 14.0, 15.0, 15.5, 16.0, 17.0, 18.5
  ];
  const melodyDurs = [
    0.4, 0.4, 0.9, 0.4, 0.4, 0.9, 0.4, 0.4, 0.9, 1.4, 0.4,
    0.4, 0.4, 0.9, 0.4, 0.4, 0.9, 0.9, 0.4, 0.4, 0.9, 0.4, 0.4, 0.9, 1.4, 0.4
  ];

  const leftRoots = [
    'F3', 'C3', 'Dm3', 'Am3', 'Bb3', 'F3', 'Gm3', 'C3', 'F3', 'C3'
  ];
  const leftChords = [
    ['A3', 'C4'], ['G3', 'C4'], ['F3', 'A3'], ['E3', 'A3'],
    ['F3', 'Bb3'], ['F3', 'A3'], ['G3', 'Bb3'], ['G3', 'C4'],
    ['A3', 'C4'], ['G3', 'C4']
  ];

  let baseTime = 0.0;
  for (let loop = 0; loop < 4; loop++) {
    for (let i = 0; i < melody.length; i++) {
      if (melody[i] !== 'R') {
        addNote(F[melody[i]], baseTime + melodyTimes[i], melodyDurs[i] * 1.5, 0.5);
      }
    }
    let leftTime = 0.0;
    for (let i = 0; i < 10; i++) {
      addNote(F[leftRoots[i]], baseTime + leftTime, 0.8, 0.4);
      addNote(F[leftChords[i][0]], baseTime + leftTime + 0.6, 0.6, 0.3);
      addNote(F[leftChords[i][1]], baseTime + leftTime + 0.6, 0.6, 0.3);
      addNote(F[leftChords[i][0]], baseTime + leftTime + 1.2, 0.6, 0.3);
      addNote(F[leftChords[i][1]], baseTime + leftTime + 1.2, 0.6, 0.3);
      leftTime += 2.0;
    }
    baseTime += 20.0;
  }

  return synthesizePianoTrack(notes, baseTime + 2.0);
})();

// 3. One Summer's Day / 하루 (센과 치히로의 행방불명) - 4/4 박자 웅장한 로맨틱 아르페지오
SONGS.anime_summer = (() => {
  const notes = [];
  const addNote = (freq, time, duration, vol = 0.35) => {
    notes.push({ freq, time, duration, volume: vol });
  };

  const melody = [
    'D5', 'Cs5', 'B4', 'A4', 'Fs4', 'G4', 'A4', 'B4', 'D5', 'R',
    'D5', 'E5', 'D5', 'Cs5', 'A4', 'B4', 'A4', 'G4', 'Fs4', 'R'
  ];
  const melodyTimes = [
    0.0, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 5.5, 6.0, 7.5,
    8.0, 9.0, 9.5, 10.0, 11.0, 12.0, 13.0, 13.5, 14.0, 15.5
  ];
  const melodyDurs = [
    0.9, 0.4, 0.4, 0.9, 0.9, 0.9, 0.4, 0.4, 1.4, 0.4,
    0.9, 0.4, 0.4, 0.9, 0.9, 0.9, 0.4, 0.4, 1.4, 0.4
  ];

  // 왼손 1-5-8 rolling 아르페지오 반주
  const leftArps = [
    ['C3', 'G3', 'C4', 'E4'], ['G2', 'D3', 'G3', 'B3'],
    ['A2', 'E3', 'A3', 'C4'], ['E2', 'B2', 'E3', 'G3'],
    ['F2', 'C3', 'F3', 'A3'], ['C3', 'G3', 'C4', 'E4'],
    ['D3', 'A3', 'D4', 'F4'], ['G2', 'D3', 'G3', 'B3']
  ];

  let baseTime = 0.0;
  for (let loop = 0; loop < 4; loop++) {
    for (let i = 0; i < melody.length; i++) {
      if (melody[i] !== 'R') {
        addNote(F[melody[i]], baseTime + melodyTimes[i], melodyDurs[i] * 1.5, 0.50);
      }
    }
    // 아르페지오 (2초에 코드 하나씩, 4/4 느낌으로 0.5초 간격으로 물결침)
    let leftTime = 0.0;
    for (let i = 0; i < 8; i++) {
      const arp = leftArps[i];
      addNote(F[arp[0]], baseTime + leftTime, 1.8, 0.4);
      addNote(F[arp[1]], baseTime + leftTime + 0.4, 1.4, 0.3);
      addNote(F[arp[2]], baseTime + leftTime + 0.8, 1.0, 0.3);
      addNote(F[arp[3]], baseTime + leftTime + 1.2, 0.8, 0.3);
      leftTime += 2.0;
    }
    baseTime += 16.0;
  }

  return synthesizePianoTrack(notes, baseTime + 2.0);
})();

// 4. 너를 태우고 (천공의 성 라퓨타) - 4/4 박자 잔잔한 피아노 진행
SONGS.anime_laputa = (() => {
  const notes = [];
  const addNote = (freq, time, duration, vol = 0.35) => {
    notes.push({ freq, time, duration, volume: vol });
  };

  const melody = [
    'D5', 'Cs5', 'B4', 'A4', 'R', 'B4', 'A4', 'G4', 'Fs4',
    'A4', 'B4', 'A4', 'G4', 'Fs4', 'E4', 'D4',
    'Fs4', 'G4', 'A4', 'B4', 'A4', 'Fs4', 'R'
  ];
  const melodyTimes = [
    0.0, 1.0, 1.5, 2.0, 3.5, 4.0, 5.0, 5.5, 6.0,
    8.0, 9.0, 9.5, 10.0, 11.0, 11.5, 12.0,
    14.0, 15.0, 15.5, 16.0, 17.0, 17.5, 19.5
  ];
  const melodyDurs = [
    0.9, 0.4, 0.4, 1.4, 0.4, 0.9, 0.4, 0.4, 1.9,
    0.9, 0.4, 0.4, 0.9, 0.4, 0.4, 1.9,
    0.9, 0.4, 0.4, 0.9, 0.4, 1.9, 0.4
  ];

  const leftArps = [
    ['D3', 'A3', 'D4', 'Fs4'], ['A2', 'E3', 'A3', 'Cs4'],
    ['B2', 'Fs3', 'B3', 'D4'], ['Fs2', 'Cs3', 'Fs3', 'A3'],
    ['G2', 'D3', 'G3', 'B3'], ['D3', 'A3', 'D4', 'Fs4'],
    ['E3', 'B3', 'E4', 'G4'], ['A2', 'E3', 'A3', 'Cs4'],
    ['B2', 'Fs3', 'B3', 'D4'], ['Fs2', 'Cs3', 'Fs3', 'A3']
  ];

  let baseTime = 0.0;
  for (let loop = 0; loop < 4; loop++) {
    for (let i = 0; i < melody.length; i++) {
      if (melody[i] !== 'R') {
        addNote(F[melody[i]], baseTime + melodyTimes[i], melodyDurs[i] * 1.5, 0.50);
      }
    }
    let leftTime = 0.0;
    for (let i = 0; i < 10; i++) {
      const arp = leftArps[i];
      addNote(F[arp[0]], baseTime + leftTime, 1.8, 0.4);
      addNote(F[arp[1]], baseTime + leftTime + 0.4, 1.4, 0.3);
      addNote(F[arp[2]], baseTime + leftTime + 0.8, 1.0, 0.3);
      addNote(F[arp[3]], baseTime + leftTime + 1.2, 0.8, 0.3);
      leftTime += 2.0;
    }
    baseTime += 20.0;
  }

  return synthesizePianoTrack(notes, baseTime + 2.0);
})();

// 5. 바다가 보이는 마을 (마녀 배달부 키키) - 4/4 박자 로맨틱 웨딩 진행
SONGS.anime_kiki = (() => {
  const notes = [];
  const addNote = (freq, time, duration, vol = 0.35) => {
    notes.push({ freq, time, duration, volume: vol });
  };

  const melody = [
    'E4', 'G4', 'C5', 'B4', 'A4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5',
    'D5', 'C5', 'B4', 'A4', 'G4', 'F4', 'G4', 'A4', 'G4', 'F4', 'E4', 'R'
  ];
  const melodyTimes = [
    0.0, 0.5, 1.0, 2.0, 2.5, 3.0, 4.0, 4.5, 5.0, 5.5, 6.0,
    8.0, 8.5, 9.0, 10.0, 10.5, 11.0, 12.0, 12.5, 13.0, 13.5, 14.0, 15.5
  ];
  const melodyDurs = [
    0.4, 0.4, 0.9, 0.4, 0.4, 0.9, 0.4, 0.4, 0.4, 0.4, 1.9,
    0.4, 0.4, 0.9, 0.4, 0.4, 0.9, 0.4, 0.4, 0.4, 0.4, 1.4, 0.4
  ];

  const leftArps = [
    ['C3', 'G3', 'C4', 'E4'], ['F2', 'C3', 'F3', 'A3'],
    ['G2', 'D3', 'G3', 'B3'], ['C3', 'G3', 'C4', 'E4'],
    ['Am2', 'E3', 'A3', 'C4'], ['Dm3', 'A3', 'D4', 'F4'],
    ['G2', 'D3', 'G3', 'B3'], ['C3', 'G3', 'C4', 'E4']
  ];

  let baseTime = 0.0;
  for (let loop = 0; loop < 4; loop++) {
    for (let i = 0; i < melody.length; i++) {
      if (melody[i] !== 'R') {
        addNote(F[melody[i]], baseTime + melodyTimes[i], melodyDurs[i] * 1.5, 0.50);
      }
    }
    let leftTime = 0.0;
    for (let i = 0; i < 8; i++) {
      const arp = leftArps[i];
      addNote(F[arp[0]], baseTime + leftTime, 1.8, 0.4);
      addNote(F[arp[1]], baseTime + leftTime + 0.4, 1.4, 0.3);
      addNote(F[arp[2]], baseTime + leftTime + 0.8, 1.0, 0.3);
      addNote(F[arp[3]], baseTime + leftTime + 1.2, 0.8, 0.3);
      leftTime += 2.0;
    }
    baseTime += 16.0;
  }

  return synthesizePianoTrack(notes, baseTime + 2.0);
})();

// 6. 이웃집 토토로 메인 테마 - 경쾌하고 따뜻한 피아노 진행
SONGS.anime_totoro = (() => {
  const notes = [];
  const addNote = (freq, time, duration, vol = 0.35) => {
    notes.push({ freq, time, duration, volume: vol });
  };

  const melody = [
    'C4', 'D4', 'E4', 'G4', 'E4', 'D4', 'C4', 'G4', 'A4', 'G4', 'E4', 'C4',
    'D4', 'E4', 'F4', 'G4', 'A4', 'G4', 'F4', 'E4', 'F4', 'E4', 'D4', 'C4', 'R'
  ];
  const melodyTimes = [
    0.0, 0.5, 1.0, 1.5, 2.0, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0,
    8.0, 8.5, 9.0, 9.5, 10.0, 11.0, 11.5, 12.0, 12.5, 13.0, 13.5, 14.0, 15.5
  ];
  const melodyDurs = [
    0.4, 0.4, 0.4, 0.4, 0.9, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 1.9,
    0.4, 0.4, 0.4, 0.4, 0.9, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 1.4, 0.4
  ];

  const leftArps = [
    ['C3', 'G3', 'C4', 'E4'], ['F2', 'C3', 'F3', 'A3'],
    ['C3', 'G3', 'C4', 'E4'], ['G2', 'D3', 'G3', 'B3'],
    ['Am2', 'E3', 'A3', 'C4'], ['F2', 'C3', 'F3', 'A3'],
    ['G2', 'D3', 'G3', 'B3'], ['C3', 'G3', 'C4', 'E4']
  ];

  let baseTime = 0.0;
  for (let loop = 0; loop < 4; loop++) {
    for (let i = 0; i < melody.length; i++) {
      if (melody[i] !== 'R') {
        addNote(F[melody[i]], baseTime + melodyTimes[i], melodyDurs[i] * 1.5, 0.50);
      }
    }
    let leftTime = 0.0;
    for (let i = 0; i < 8; i++) {
      const arp = leftArps[i];
      addNote(F[arp[0]], baseTime + leftTime, 1.8, 0.4);
      addNote(F[arp[1]], baseTime + leftTime + 0.4, 1.4, 0.3);
      addNote(F[arp[2]], baseTime + leftTime + 0.8, 1.0, 0.3);
      addNote(F[arp[3]], baseTime + leftTime + 1.2, 0.8, 0.3);
      leftTime += 2.0;
    }
    baseTime += 16.0;
  }

  return synthesizePianoTrack(notes, baseTime + 2.0);
})();

// 7. 나와 당신의 이야기 (너의 이름은 - Sparkle) - 몽환적이고 아름다운 현대 애니 웨딩 피아노
SONGS.anime_yourname = (() => {
  const notes = [];
  const addNote = (freq, time, duration, vol = 0.35) => {
    notes.push({ freq, time, duration, volume: vol });
  };

  const melody = [
    'G4', 'A4', 'B4', 'D5', 'C5', 'B4', 'A4', 'G4',
    'A4', 'B4', 'C5', 'D5', 'E5', 'D5', 'C5', 'B4',
    'C5', 'D5', 'E5', 'G5', 'Fs5', 'E5', 'D5', 'G4', 'R'
  ];
  const melodyTimes = [
    0.0, 0.5, 1.0, 1.5, 2.0, 3.0, 3.5, 4.0,
    6.0, 6.5, 7.0, 7.5, 8.0, 9.0, 9.5, 10.0,
    12.0, 12.5, 13.0, 13.5, 14.0, 15.0, 15.5, 16.0, 17.5
  ];
  const melodyDurs = [
    0.4, 0.4, 0.4, 0.4, 0.9, 0.4, 0.4, 1.9,
    0.4, 0.4, 0.4, 0.4, 0.9, 0.4, 0.4, 1.9,
    0.4, 0.4, 0.4, 0.4, 0.9, 0.4, 0.4, 1.4, 0.4
  ];

  const leftArps = [
    ['G2', 'D3', 'G3', 'B3'], ['C3', 'G3', 'C4', 'E4'], ['G2', 'D3', 'G3', 'B3'],
    ['A2', 'E3', 'A3', 'C4'], ['D3', 'A3', 'D4', 'Fs4'], ['A2', 'E3', 'A3', 'C4'],
    ['C3', 'G3', 'C4', 'E4'], ['G2', 'D3', 'G3', 'B3'], ['D3', 'A3', 'D4', 'Fs4']
  ];

  let baseTime = 0.0;
  for (let loop = 0; loop < 4; loop++) {
    for (let i = 0; i < melody.length; i++) {
      if (melody[i] !== 'R') {
        addNote(F[melody[i]], baseTime + melodyTimes[i], melodyDurs[i] * 1.5, 0.50);
      }
    }
    let leftTime = 0.0;
    for (let i = 0; i < 9; i++) {
      const arp = leftArps[i];
      addNote(F[arp[0]], baseTime + leftTime, 1.8, 0.4);
      addNote(F[arp[1]], baseTime + leftTime + 0.4, 1.4, 0.3);
      addNote(F[arp[2]], baseTime + leftTime + 0.8, 1.0, 0.3);
      addNote(F[arp[3]], baseTime + leftTime + 1.2, 0.8, 0.3);
      leftTime += 2.0;
    }
    baseTime += 18.0;
  }

  return synthesizePianoTrack(notes, baseTime + 2.0);
})();

// 8. 모노노케 히메 테마 - 4/4 박자 깊은 숲속의 고요한 피아노
SONGS.anime_mononoke = (() => {
  const notes = [];
  const addNote = (freq, time, duration, vol = 0.35) => {
    notes.push({ freq, time, duration, volume: vol });
  };

  const melody = [
    'E4', 'Fs4', 'G4', 'A4', 'G4', 'Fs4', 'E4', 'B3',
    'B4', 'A4', 'G4', 'Fs4', 'E4', 'D4', 'E4', 'Fs4', 'E4', 'R'
  ];
  const melodyTimes = [
    0.0, 1.0, 1.5, 2.0, 3.5, 4.0, 5.0, 6.0,
    8.0, 9.0, 9.5, 10.0, 11.0, 12.0, 13.0, 13.5, 14.0, 15.5
  ];
  const melodyDurs = [
    0.9, 0.4, 0.4, 1.4, 0.4, 0.9, 0.9, 1.9,
    0.9, 0.4, 0.4, 0.9, 0.9, 0.9, 0.4, 0.4, 1.4, 0.4
  ];

  const leftArps = [
    ['E2', 'B2', 'E3', 'G3'], ['Am2', 'E3', 'A3', 'C4'], ['E2', 'B2', 'E3', 'G3'],
    ['B2', 'Fs3', 'B3', 'D4'], ['E3', 'B3', 'E4', 'G4'], ['Am2', 'E3', 'A3', 'C4'],
    ['D3', 'A3', 'D4', 'Fs4'], ['E2', 'B2', 'E3', 'G3']
  ];

  let baseTime = 0.0;
  for (let loop = 0; loop < 4; loop++) {
    for (let i = 0; i < melody.length; i++) {
      if (melody[i] !== 'R') {
        addNote(F[melody[i]], baseTime + melodyTimes[i], melodyDurs[i] * 1.5, 0.50);
      }
    }
    let leftTime = 0.0;
    for (let i = 0; i < 8; i++) {
      const arp = leftArps[i];
      addNote(F[arp[0]], baseTime + leftTime, 1.8, 0.4);
      addNote(F[arp[1]], baseTime + leftTime + 0.4, 1.4, 0.3);
      addNote(F[arp[2]], baseTime + leftTime + 0.8, 1.0, 0.3);
      addNote(F[arp[3]], baseTime + leftTime + 1.2, 0.8, 0.3);
      leftTime += 2.0;
    }
    baseTime += 16.0;
  }

  return synthesizePianoTrack(notes, baseTime + 2.0);
})();

// 9. 벼랑 위의 포뇨 테마 - 통통 튀는 피아노 왈츠 스타일
SONGS.anime_ponyo = (() => {
  const notes = [];
  const addNote = (freq, time, duration, vol = 0.35) => {
    notes.push({ freq, time, duration, volume: vol });
  };

  const melody = [
    'G4', 'A4', 'B4', 'C5', 'D5', 'C5', 'B4', 'A4', 'G4', 'G4',
    'E5', 'D5', 'C5', 'B4', 'A4', 'G4', 'A4', 'G4', 'R'
  ];
  const melodyTimes = [
    0.0, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 4.5, 5.0, 6.0,
    8.0, 9.0, 9.5, 10.0, 11.0, 11.5, 12.0, 13.5, 15.5
  ];
  const melodyDurs = [
    0.4, 0.4, 0.4, 0.4, 0.9, 0.9, 0.9, 0.4, 0.9, 1.9,
    0.9, 0.4, 0.4, 0.9, 0.4, 0.4, 1.4, 1.9, 0.4
  ];

  const leftArps = [
    ['C3', 'G3', 'C4', 'E4'], ['F2', 'C3', 'F3', 'A3'], ['C3', 'G3', 'C4', 'E4'],
    ['G2', 'D3', 'G3', 'B3'], ['Am2', 'E3', 'A3', 'C4'], ['F2', 'C3', 'F3', 'A3'],
    ['G2', 'D3', 'G3', 'B3'], ['C3', 'G3', 'C4', 'E4']
  ];

  let baseTime = 0.0;
  for (let loop = 0; loop < 4; loop++) {
    for (let i = 0; i < melody.length; i++) {
      if (melody[i] !== 'R') {
        addNote(F[melody[i]], baseTime + melodyTimes[i], melodyDurs[i] * 1.5, 0.50);
      }
    }
    let leftTime = 0.0;
    for (let i = 0; i < 8; i++) {
      const arp = leftArps[i];
      addNote(F[arp[0]], baseTime + leftTime, 1.8, 0.4);
      addNote(F[arp[1]], baseTime + leftTime + 0.4, 1.4, 0.3);
      addNote(F[arp[2]], baseTime + leftTime + 0.8, 1.0, 0.3);
      addNote(F[arp[3]], baseTime + leftTime + 1.2, 0.8, 0.3);
      leftTime += 2.0;
    }
    baseTime += 16.0;
  }

  return synthesizePianoTrack(notes, baseTime + 2.0);
})();

// 10. 바람의 계곡 나우시카 테마 - 서사적이고 로맨틱한 오 orchestra 피아노
SONGS.anime_nausicaa = (() => {
  const notes = [];
  const addNote = (freq, time, duration, vol = 0.35) => {
    notes.push({ freq, time, duration, volume: vol });
  };

  const melody = [
    'D4', 'F4', 'A4', 'Bb4', 'A4', 'G4', 'F4', 'G4', 'A4', 'D5',
    'C5', 'Bb4', 'A4', 'G4', 'F4', 'E4', 'D4', 'A4', 'Bb4', 'A4', 'G4', 'R'
  ];
  const melodyTimes = [
    0.0, 0.5, 1.0, 2.0, 2.5, 3.0, 4.0, 4.5, 5.0, 6.0,
    8.0, 9.0, 9.5, 10.0, 11.0, 11.5, 12.0, 14.0, 15.0, 15.5, 16.0, 17.5
  ];
  const melodyDurs = [
    0.4, 0.4, 0.9, 0.4, 0.4, 0.9, 0.4, 0.4, 0.9, 1.9,
    0.9, 0.4, 0.4, 0.9, 0.4, 0.4, 1.9, 0.9, 0.4, 0.4, 1.4, 0.4
  ];

  const leftArps = [
    ['D3', 'A3', 'D4', 'F4'], ['G2', 'D3', 'G3', 'Bb3'], ['D3', 'A3', 'D4', 'F4'],
    ['A2', 'E3', 'A3', 'Cs4'], ['Bb2', 'F3', 'Bb3', 'D4'], ['G2', 'D3', 'G3', 'Bb3'],
    ['A2', 'E3', 'A3', 'Cs4'], ['D3', 'A3', 'D4', 'F4'], ['G2', 'D3', 'G3', 'Bb3']
  ];

  let baseTime = 0.0;
  for (let loop = 0; loop < 4; loop++) {
    for (let i = 0; i < melody.length; i++) {
      if (melody[i] !== 'R') {
        addNote(F[melody[i]], baseTime + melodyTimes[i], melodyDurs[i] * 1.5, 0.50);
      }
    }
    let leftTime = 0.0;
    for (let i = 0; i < 9; i++) {
      const arp = leftArps[i];
      addNote(F[arp[0]], baseTime + leftTime, 1.8, 0.4);
      addNote(F[arp[1]], baseTime + leftTime + 0.4, 1.4, 0.3);
      addNote(F[arp[2]], baseTime + leftTime + 0.8, 1.0, 0.3);
      addNote(F[arp[3]], baseTime + leftTime + 1.2, 0.8, 0.3);
      leftTime += 2.0;
    }
    baseTime += 18.0;
  }

  return synthesizePianoTrack(notes, baseTime + 2.0);
})();

// ── 로컬 디렉토리 저장 진행 ──
const outDir = path.join(__dirname, '..', 'public', 'bgm');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const [key, wavBuffer] of Object.entries(SONGS)) {
  const filename = `${key}.wav`;
  const outPath = path.join(outDir, filename);
  console.log(`Generating Polyphonic Piano Wave: ${filename} ...`);
  fs.writeFileSync(outPath, wavBuffer);
  console.log(`  ✓ Saved! Size: ${(wavBuffer.length / 1024).toFixed(0)} KB`);
}

console.log('\n [성공] 모든 10곡의 프리미엄 지브리 다성부 피아노 아르페지오 WAV 생성 완료!');
