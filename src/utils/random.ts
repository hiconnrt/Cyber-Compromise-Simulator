/**
 * Deterministic Pseudorandom Number Generator (Mulberry32)
 * Ensures 100% reproducible simulation results across trials and runs.
 */
export class DeterministicRNG {
  private state: number;
  private readonly initialSeed: number;

  constructor(seed: number) {
    // Ensure positive 32-bit integer seed
    this.initialSeed = seed >>> 0;
    this.state = this.initialSeed;
  }

  public getSeed(): number {
    return this.initialSeed;
  }

  /**
   * Returns float in range [0, 1)
   */
  public nextFloat(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns integer in inclusive range [min, max]
   */
  public nextInt(min: number, max: number): number {
    const range = max - min + 1;
    return min + Math.floor(this.nextFloat() * range);
  }

  /**
   * Returns a random element from an array
   */
  public choice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot choose from empty array');
    }
    const idx = Math.floor(this.nextFloat() * array.length);
    return array[idx];
  }

  /**
   * Shuffles a copy of an array deterministically using Fisher-Yates
   */
  public shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.nextFloat() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }
}
