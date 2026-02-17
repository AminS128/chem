const phys = {
    particles:[],// list of Particle objects
    energy:0,// total energy of system
    time:0, // amount of time since sim start, in frames
    iterate:function(){
        this.time++
        // decay pressure values
        for(var i = 0; i < 4; i ++){this.pressures[i]*=0.99}
        for(var i = 0; i < phys.particles.length; i ++){
            phys.particles[i].iterate()
        }
        for(var i = 0; i < phys.particles.length; i ++){
            if(phys.particles[i].destroyed){
                phys.particles.splice(i,1);i--
            }
        }
        this.doCollisions()
        if(
            Math.abs(this.energy - this.getTotalE()) >
            config.energyThreshold * this.particles.length * config.gravity + 1e-10){
            
            this.correctEnergy()
        }

        this.display()
    },
    doCollisions:function(){// not a method in Particle for efficiency
        for(var i = 0; i < this.particles.length; i ++){// checks every unique pair, no repeats
            for(var ii = 0; ii < i; ii ++){
                this.particles[i].interactWith(this.particles[ii])
            }
        }
    },
    setupParticles:function(){
        if(currentScenario){
            currentScenario.loadFunc()
        }else{
            for(var i = 0; i < 200; i ++){
                this.particles.push(new Particle(
                    Math.random()*config.worldWidth,
                    config.worldHeight*Math.random(),
                    2*(Math.random()-0.5),
                    2*(Math.random()-0.5),
                    0
                ))
}
        }
    },
    init:function(){
        this.setupParticles()
        c.width = config.worldWidth
        c.height = config.worldHeight
        this.time = 0

        this.energy = this.getTotalE()
    },
    reset:function(){
        this.particles = []
        this.energy = null
    },
    getTotalE:function(){// check conservation of energy
        let sum = 0
        for(var i = 0; i < this.particles.length; i ++){
            sum += this.particles[i].getKE()
            sum += this.particles[i].getPE()
        }
        return sum
    },
    getAvgTemperature:function(){
        let sum = 0
        for(var i = 0; i < this.particles.length; i ++){
            sum += this.particles[i].getTemperature()
        }
        return sum / (this.particles.length || 1)
    },
    updateEnergy:function(){
        this.energy = this.getTotalE()
    },
    correctEnergy:function(){
        if(!config.energyCorrection){return}
        // called when total energy is off
        let e = this.getTotalE()
        let i = 0 // count
        // max 3 per frame
        while(Math.abs(this.energy - e) > this.particles.length * config.energyThreshold * config.gravity * 0.2 &&
         i < 3){
            i++
            

            if(e > this.energy){
                // console.log('correcting energy down')
                for(var ii = 0; ii < this.particles.length; ii ++){
                    if(this.particles[ii].getKE() > 1.5*(e/this.particles.length)){// slow down fast particles
                        this.particles[ii].vx*=0.7
                        this.particles[ii].vy*=0.7
                    }
                }
                let toMod = this.particles[Math.trunc(Math.random()*this.particles.length)]
                toMod.vx *= 0.7
                toMod.vy *= 0.7
            }else{
                // console.log('correcting energy up')
                for(var ii = 0; ii < this.particles.length; ii ++){
                    if(this.particles[ii].getKE() < (Math.random()*0.05)*(e/this.particles.length)){
                        // speed up slow particles
                        // threshold is 0.025 +/- 0.025 so that there isnt a hard border on the energy
                        // distribution graph
                        // this.particles[ii].vx*=1.2
                        // this.particles[ii].vy*=1.2
                        this.particles[ii].vx+=(Math.random()-0.5)*2
                        this.particles[ii].vy+=(Math.random()-0.5)*2
                    }
                }
                let toMod = this.particles[Math.trunc(Math.random()*this.particles.length)]
                toMod.vx *= 1.5
                toMod.vy *= 1.5
            }

            e = this.getTotalE()
        }
    },
    pressures:[0, 0, 0, 0],// the magnitudes of collisions on each wall// [0] -> top, 1 - right, 2 - bottom, 3 - left
    display:function(){
        for(var i = 0; i < phys.particles.length; i ++){
            phys.particles[i].draw()
        }
    },
    countParticles:function(){// returns a list, where the value at an index n of the list is the amount of particles of type n in the system
        let sums = new Array(molecules.length)// as many slots as there are particles
        sums.fill(0)// which all start at 0
        for(var i = 0; i < this.particles.length; i ++){
            sums[this.particles[i].type]++
        }
        return sums
    },
    getEnergyDistribution:function(resolution = 100, log = false){
        // returns kinetic energy sorted into 100 buckets
        // ie array of length 100, where each item is the proportion (0-1) of particles with ke in that bucket
        // buckets are linear - ie, if max KE in system is 50, then bucket 0 is 0-0.5, bucket 1 is 0.5-1, etc

        let KEs = []
        for(var i = 0; i < this.particles.length; i ++){
            KEs.push(log? Math.log2(this.particles[i].getKE()):this.particles[i].getKE())
        }
        let sorted = selectionSort(KEs)
        let output = new Array(resolution)
        let max = sorted[Math.trunc(sorted.length*0.9)]// 90th percentile
        // console.log(max)
        max = 500
        let lookingAt = 0
        for(var i = 0; i < resolution; i ++){
            let tally = 0
            while(sorted[lookingAt] < i * (max/resolution)){
                if(sorted[lookingAt] > (i-1) * (max/resolution)){tally++}// only count ones which are not in other buckets
                lookingAt ++
            }
            output[i] = tally / this.particles.length
        }
        return output
    }
}
