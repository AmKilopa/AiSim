import { World, Unit } from '../types';
export class Simulation {
  world: World;
  running: boolean = false;
  lastTime: number = 0;
  constructor(world: World) {
    this.world = world;
  }
  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }
  stop(): void {
    this.running = false;
  }
  loop(): void {
    if (!this.running) return;
    const now = performance.now();
    const deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.tick(deltaTime);
    requestAnimationFrame(() => this.loop());
  }
  tick(deltaTime: number): void {
    // reproduction phase
    for (let i = 0; i < this.world.units.length; i++) {
      const u1 = this.world.units[i];
      if (!u1.alive || u1.age < 18 || u1.energy < 50) continue;
      if (u1.gender==='female' && !u1.pregnant && Math.random()<0.002) {
        // random mate search nearby
        for (let j = 0; j < this.world.units.length; j++) {
          const u2 = this.world.units[j];
          if (u2.id===u1.id || !u2.alive || u2.gender!=='male' || Math.abs(u2.age-u1.age)>15 || u2.energy<65) continue;
          const dx = u2.position.x-u1.position.x;
          const dy = u2.position.y-u1.position.y;
          const dist = Math.sqrt(dx*dx+dy*dy);
          if (dist<32) {
            u1.pregnant=true;
            u1.spouseId=u2.id;
            u2.spouseId=u1.id;
            u1.lastRepro=this.world.time;
            u2.lastRepro=this.world.time;
          }
        }
      }
      // birth phase
      if (u1.gender==='female' && u1.pregnant && this.world.time-u1.lastRepro>8) {
        let childrenNum = 1+Math.round(Math.random()*2);
        u1.pregnant=false;
        u1.children+=childrenNum;
        for(let c=0;c<childrenNum;c++){
            this.world.units.push({
                id:`unit_${this.world.units.length}`,
                type:u1.type,
                isWorker:Math.random()<0.5,
                gender:Math.random()<0.5?'male':'female',
                age:1,
                position:{x:u1.position.x+8*(Math.random()-0.5),y:u1.position.y+8*(Math.random()-0.5)},
                velocity:{x:0,y:0},
                health:100,
                energy:90,
                brain:u1.brain,
                countryId:u1.countryId,
                alive:true,
                resources:0,
                children:0,
                spouseId:'',
                pregnant:false,
                lastRepro:this.world.time});
            }
        }
      }
    }
    // war phase: check boundaries
defense: for(const c1 of this.world.countries){
      for(const c2 of this.world.countries){
        if(c1.id===c2.id) continue;
        for(const u1 of this.world.units){
          if(u1.countryId!==c1.id || !u1.alive || u1.type!=="military") continue;
          for(const u2 of this.world.units){
            if(u2.countryId!==c2.id || !u2.alive || u2.type!=="military") continue;
            const dx=u2.position.x-u1.position.x;const dy=u2.position.y-u1.position.y;const dist=Math.sqrt(dx*dx+dy*dy);
            if(dist<24){
              // battle
              if(u1.energy>u2.energy)u2.alive=false;else u1.alive=false;
              continue defense;
            }
          }
        }
      }
    }
    // normal update
    this.world.units.forEach(unit => {
      if (!unit.alive) return;
      unit.brain.fitness+=deltaTime;
    });
    // update world
    import('../core/World').then(m=>m.updateWorld(this.world,deltaTime));
  }
  addUnit(unit: Unit): void {
    this.world.units.push(unit);
  }
  getStats() {
    const aliveUnits = this.world.units.filter(u => u.alive);
    const avgFitness =
      aliveUnits.reduce((sum, u) => sum + u.brain.fitness, 0) /
      (aliveUnits.length || 1);
    return {
      time: this.world.time.toFixed(1),
      totalUnits: this.world.units.length,
      aliveUnits: aliveUnits.length,
      countries: this.world.countries.length,
      avgFitness: avgFitness.toFixed(2)
    };
  }
}