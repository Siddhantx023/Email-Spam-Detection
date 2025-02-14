export class SpamClassifier {
  private vocabulary: Set<string>;
  private spamWordCounts: Map<string, number>;
  private hamWordCounts: Map<string, number>;
  private spamTotal: number;
  private hamTotal: number;

  constructor() {
    this.vocabulary = new Set();
    this.spamWordCounts = new Map();
    this.hamWordCounts = new Map();
    this.spamTotal = 0;
    this.hamTotal = 0;
  }

  private preprocessText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  train(data: { text: string; label: number }[]): void {
    data.forEach(({ text, label }) => {
      const words = this.preprocessText(text);
      
      words.forEach(word => {
        this.vocabulary.add(word);
        
        if (label === 1) {
          this.spamWordCounts.set(word, (this.spamWordCounts.get(word) || 0) + 1);
          this.spamTotal++;
        } else {
          this.hamWordCounts.set(word, (this.hamWordCounts.get(word) || 0) + 1);
          this.hamTotal++;
        }
      });
    });
  }

  private calculateWordProbability(word: string, isSpam: boolean): number {
    const counts = isSpam ? this.spamWordCounts : this.hamWordCounts;
    const total = isSpam ? this.spamTotal : this.hamTotal;
    const count = counts.get(word) || 0;
    
    // Laplace smoothing
    return (count + 1) / (total + this.vocabulary.size);
  }

  predict(text: string): { prediction: number; confidence: number } {
    const words = this.preprocessText(text);
    
    // Calculate log probabilities to avoid underflow
    let spamLogProb = Math.log(this.spamTotal / (this.spamTotal + this.hamTotal));
    let hamLogProb = Math.log(this.hamTotal / (this.spamTotal + this.hamTotal));

    words.forEach(word => {
      if (this.vocabulary.has(word)) {
        spamLogProb += Math.log(this.calculateWordProbability(word, true));
        hamLogProb += Math.log(this.calculateWordProbability(word, false));
      }
    });

    // Convert to probabilities
    const spamProb = Math.exp(spamLogProb);
    const hamProb = Math.exp(hamLogProb);
    const total = spamProb + hamProb;

    // Normalize probabilities
    const normalizedSpamProb = spamProb / total;

    return {
      prediction: normalizedSpamProb > 0.5 ? 1 : 0,
      confidence: normalizedSpamProb > 0.5 ? normalizedSpamProb : 1 - normalizedSpamProb
    };
  }
}