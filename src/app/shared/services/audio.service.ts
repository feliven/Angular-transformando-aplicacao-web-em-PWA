import { Service } from '@angular/core';
import { Howl } from 'howler';

@Service()
export class AudioService {
  private audioTracks: Map<string, Howl> = new Map();

  constructor() {
    this.initializeTracks();
  }

  private initializeTracks() {
    this.audioTracks.set(
      'environment',
      new Howl({
        src: ['./sounds/luna-rise-part-one.mp3'],
      }),
    );

    this.audioTracks.set(
      'play',
      new Howl({
        src: ['./sounds/play.wav'],
      }),
    );

    this.audioTracks.set(
      'pause',
      new Howl({
        src: ['./sounds/pause.mp3'],
      }),
    );

    this.audioTracks.set(
      'beep',
      new Howl({
        src: ['./sounds/beep.mp3'],
      }),
    );
  }

  play(trackName: string) {
    const track = this.audioTracks.get(trackName);
    track?.play();
  }

  pause(trackName: string) {
    const track = this.audioTracks.get(trackName);
    track?.pause();
  }

  stop(trackName: string) {
    const track = this.audioTracks.get(trackName);
    track?.stop();
  }
}
