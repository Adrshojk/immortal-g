import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    // 1. Dark glowing background
    this.add.rectangle(400, 300, 800, 600, 0x11111e);
    
    // Add background decorative grids
    this.add.grid(400, 300, 800, 600, 40, 40, 0x000000, 0, 0x00ffcc, 0.05);
    
    // 2. Title with glowing effect
    this.add.text(402, 82, 'IMMORTAL: KAIL', {
      fontSize: '48px',
      color: '#ff3366',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(400, 80, 'IMMORTAL: KAIL', {
      fontSize: '48px',
      color: '#00ffcc',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(400, 130, 'Focus Your Power. Control the Destruction.', {
      fontSize: '16px',
      color: '#8892b0',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // 3. Selection Title
    this.add.text(400, 190, 'SELECT CHALLENGE SCENARIO', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // 4. Level Cards (Interactive rectangles)
    this.createLevelCard(200, 350, 1, 'FOCUS TUTORIAL', 
      'Goal: Destroy 4 crates.\nRule: Keep collateral < 30%.\nRule: Do not break the ground.\nSuppression: Tap=INF, Hold=Restrain.',
      { level: 1, maxCollateral: 30, groundBreakFails: true, targetCratesCount: 4 }
    );

    this.createLevelCard(400, 350, 2, 'HOSTAGE RESCUE', 
      'Goal: Walk up & Rescue NPC (E).\nRule: Keep collateral < 10%.\nRule: Do NOT harm the NPC.\nSuppression: Hold F to not blast.',
      { level: 2, maxCollateral: 10, npcDamageFails: true, rescueNPCsCount: 1 }
    );

    this.createLevelCard(600, 350, 3, 'DEMOLITION DERBY', 
      'Goal: Destroy 100% of Fortress.\nRule: No collateral limit!\nWin: Reach 100% destruction.\nSuppression: Single Tap for INF blast!',
      { level: 3, maxCollateral: 100, winAt100Percent: true }
    );
  }

  private createLevelCard(x: number, y: number, num: number, title: string, desc: string, config: any): void {
    // Card background
    const bg = this.add.rectangle(x, y, 180, 260, 0x1f1f3a).setOrigin(0.5);
    bg.setStrokeStyle(2, 0x3b3b6d);
    
    this.add.text(x, y - 90, `LEVEL ${num}`, {
      fontSize: '18px',
      color: '#ffcc00',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(x, y - 60, title, {
      fontSize: '14px',
      color: '#00ffcc',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(x, y + 15, desc, {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center',
      wordWrap: { width: 160 }
    }).setOrigin(0.5);

    const playText = this.add.text(x, y + 100, '[ PLAY NOW ]', {
      fontSize: '13px',
      color: '#ff3366',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Make interactive
    bg.setInteractive({ useHandCursor: true });
    
    bg.on('pointerover', () => {
      bg.setFillStyle(0x2f2f5c);
      bg.setStrokeStyle(3, 0x00ffcc);
      playText.setColor('#00ffcc');
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x1f1f3a);
      bg.setStrokeStyle(2, 0x3b3b6d);
      playText.setColor('#ff3366');
    });

    bg.on('pointerdown', () => {
      this.cameras.main.fade(300, 0, 0, 0, false, (_cam: any, progress: number) => {
        if (progress === 1) {
          this.scene.start('MainScene', config);
        }
      });
    });
  }
}
