// ============================================================
// 🔊 sounds.ts - 효과음 엔진 (Web Audio API)
// ============================================================
// 별도 음원 파일 없이, Web Audio API의 오실레이터(Oscillator)를
// 사용하여 코드로 직접 효과음을 생성합니다.
// 브라우저에서만 동작하므로, 서버 사이드에서는 사용하지 않습니다.

// ----------------------------------------------------------
// 🎛️ 사운드 엔진 클래스
// ----------------------------------------------------------

class SoundEngine {
  /** Web Audio API 컨텍스트 (브라우저 오디오 처리의 핵심 객체) */
  private context: AudioContext | null = null;

  /** 마스터 볼륨을 조절하는 Gain 노드 */
  private masterGain: GainNode | null = null;

  /** 현재 볼륨 값 (0.0 ~ 1.0) */
  private volume: number = 0.5;

  /** 음소거 상태 여부 */
  private isMuted: boolean = false;

  /**
   * AudioContext를 초기화합니다.
   * 브라우저 정책상, 사용자 상호작용(클릭 등) 이후에만 오디오를 재생할 수 있어서
   * 첫 번째 사운드 재생 시 lazy(지연) 초기화합니다.
   */
  private ensureContext(): AudioContext {
    if (!this.context) {
      // AudioContext 생성 (브라우저 호환성 처리)
      this.context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      // 마스터 볼륨 노드 생성 및 스피커에 연결
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.context.destination);
    }

    // AudioContext가 정지(suspended) 상태이면 재개(resume)
    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    return this.context;
  }

  /**
   * 기본적인 톤(음)을 재생하는 헬퍼 함수입니다.
   * 오실레이터(음 생성기)를 만들어 지정된 주파수, 파형, 시간으로 소리를 냅니다.
   *
   * @param frequency - 주파수(Hz). 높을수록 높은 음. 예: 440Hz = 라(A) 음
   * @param duration  - 지속 시간(초)
   * @param type      - 파형(Waveform) 타입. sine(부드러운), square(8비트풍), triangle(중간), sawtooth(거친)
   * @param startTime - 재생 시작 시간 (AudioContext 기준, 딜레이용)
   * @param gainValue - 이 톤의 개별 볼륨 (0.0 ~ 1.0)
   */
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    startTime?: number,
    gainValue: number = 0.3
  ): void {
    // 음소거 상태이면 아무것도 하지 않음
    if (this.isMuted) return;

    const ctx = this.ensureContext();
    const now = startTime ?? ctx.currentTime;

    // 오실레이터(Oscillator): 소리를 만드는 음원
    const oscillator = ctx.createOscillator();
    oscillator.type = type;           // 파형 설정
    oscillator.frequency.value = frequency; // 주파수 설정

    // Gain 노드: 이 톤의 개별 볼륨 조절기
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(gainValue, now);
    // 소리 끝부분에서 부드럽게 페이드아웃 (클릭 노이즈 방지)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // 연결: 오실레이터 → 개별 볼륨 → 마스터 볼륨 → 스피커
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain!);

    // 재생 시작 및 종료 예약
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // ----------------------------------------------------------
  // 🎵 게임 효과음 함수들
  // ----------------------------------------------------------

  /**
   * 🔵 O/X 배치음 - 짧은 "톡!" 클릭 소리
   * 사용자가 셀을 클릭하여 O 또는 X를 놓을 때 재생됩니다.
   */
  playPlace(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    // 높은 주파수(660Hz)의 짧은 삼각파 → 경쾌한 "톡!" 소리
    this.playTone(660, 0.08, 'triangle', now, 0.4);
    // 약간의 하모닉(배음)을 추가하여 풍성한 소리
    this.playTone(880, 0.05, 'sine', now, 0.15);
  }

  /**
   * 🤖 AI 배치음 - 사용자와 구분되는 다른 톤
   * AI가 수를 놓을 때 재생됩니다.
   */
  playAiPlace(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    // 낮은 주파수(440Hz)의 사각파 → 로봇 느낌의 "뚝" 소리
    this.playTone(440, 0.1, 'square', now, 0.2);
    this.playTone(550, 0.06, 'sine', now + 0.03, 0.15);
  }

  /**
   * 🎉 승리 팡파레 - 상승하는 멜로디 시퀀스
   * 한 쪽이 승리했을 때 재생됩니다.
   */
  playWin(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    // 4개의 음을 연속으로 재생하여 "빠밤빠밤~" 상승 멜로디 생성
    // 도(C5) → 미(E5) → 솔(G5) → 높은도(C6)
    const melody = [523, 659, 784, 1047]; // C5, E5, G5, C6 주파수
    const noteDuration = 0.15;             // 각 음의 길이

    melody.forEach((freq, i) => {
      this.playTone(freq, noteDuration + 0.05, 'sine', now + i * noteDuration, 0.3);
      // 배음 추가로 풍성한 소리
      this.playTone(freq * 1.5, noteDuration, 'triangle', now + i * noteDuration, 0.1);
    });
  }

  /**
   * 🤝 무승부 알림음 - 하강하는 짧은 두 음
   * 무승부로 게임이 끝났을 때 재생됩니다.
   */
  playDraw(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    // 두 음이 내려가는 "뚜둡" 소리
    this.playTone(440, 0.2, 'triangle', now, 0.3);
    this.playTone(330, 0.3, 'triangle', now + 0.2, 0.25);
  }

  /**
   * ❌ 잘못된 클릭 경고음 - 짧은 버저 소리
   * 이미 O/X가 놓인 칸을 다시 클릭했을 때 재생됩니다.
   */
  playInvalid(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    // 낮은 주파수의 사각파 → "삐!" 경고 소리
    this.playTone(200, 0.15, 'square', now, 0.25);
    this.playTone(150, 0.15, 'square', now + 0.08, 0.2);
  }

  /**
   * 🔔 게임 시작/재시작 알림음 - 밝은 상승 두 음
   * 새 게임이 시작되거나 재시작할 때 재생됩니다.
   */
  playStart(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    // 올라가는 두 음 "딩동~"
    this.playTone(523, 0.15, 'sine', now, 0.3);        // 도(C5)
    this.playTone(784, 0.25, 'sine', now + 0.12, 0.3);  // 솔(G5)
  }

  // ----------------------------------------------------------
  // 🎛️ 볼륨 & 음소거 컨트롤
  // ----------------------------------------------------------

  /**
   * 마스터 볼륨을 설정합니다.
   *
   * @param vol - 볼륨 값 (0.0 ~ 1.0)
   */
  setVolume(vol: number): void {
    // 0.0과 1.0 사이로 클램프(제한)
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  /**
   * 현재 볼륨 값을 반환합니다.
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * 음소거를 켜거나 끕니다.
   *
   * @returns 변경 후의 음소거 상태
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      // 음소거 시 볼륨 0, 해제 시 원래 볼륨 복원
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
    }
    return this.isMuted;
  }

  /**
   * 현재 음소거 상태를 반환합니다.
   */
  getMuted(): boolean {
    return this.isMuted;
  }
}

// ----------------------------------------------------------
// 📤 싱글톤 인스턴스 내보내기
// ----------------------------------------------------------
// 앱 전체에서 하나의 SoundEngine 인스턴스를 공유합니다.
// 여러 컴포넌트에서 import하더라도 같은 인스턴스를 사용하게 됩니다.

export const soundEngine = new SoundEngine();
