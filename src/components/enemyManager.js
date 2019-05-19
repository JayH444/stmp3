class EnemyManagerClass {
  constructor(enemyCountMedian=12, enemyCountRange=12) {
    let ecm = enemyCountMedian;
    let ecr = enemyCountRange;
    this.initialEnemyCount = Math.floor(Math.random()*ecr + ecm);
    this.currentEnemyCount = this.initialEnemyCount;
    this.decrement = this.decrement.bind(this);
    this.getEnemyCountText = this.getEnemyCountText.bind(this);
  }
  getEnemyCountText() {
    return this.currentEnemyCount.toString().padStart(3, '0');
  }
  decrement() {
    if (this.currentEnemyCount > 0) {
      this.currentEnemyCount--;
      updateText('foesLeft', this.getEnemyCountText);
    }
  }
}