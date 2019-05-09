class EnemyManagerClass {
  constructor() {
    this.enemyCount = Math.floor(Math.random()*12 + 12);
    this.decrement = this.decrement.bind(this);
    this.getEnemyCountText = this.getEnemyCountText.bind(this);
  }
  getEnemyCountText() {
    return this.enemyCount.toString().padStart(3, '0');
  }
  decrement() {
    if (this.enemyCount > 0) {
      this.enemyCount--;
      updateText('foesLeft', this.getEnemyCountText);
    }
  }
}