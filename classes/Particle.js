class Particle {
    // each Particle treated as 1 mol (imagine the simulator as a massive vat or something)
    constructor(x, y, vx = 0, vy = 0, type = 0){
        this.x = x
        this.vx = vx
        this.y = y
        this.vy = vy
        this.type = type
        this.col = "#ffffff"
        /* types of particles
            0 -> H2O
            1 -> H2
            2 -> Br2
            3 -> HBr
        */
        // all default values are hydrogen, if setproperties does nothing
        this.mass = 2// mass in gmol^-1
        this.bp = 20.28 // boiling point in K
        this.mp = 14.01 // melting point in K (not implemented)
        this.r = 10// radius

        this.rot = Math.random()*6.28// purely visual
        this.vrot = (Math.random()-0.5)*0.1 // also purely visual

        // liquid properties - global for now
        this.coh = 5 // cohesion, simulated hydrogen bonding/dipole-dipole/whatever - only used in liquids

        // used when destroyed - when marked true, this Particle will be removed at the end of phys iteration
        // (removal mid-iteration causes errors w/ undefined)
        this.destroyed = false

        this.setProperties(this.type)
    }
    setType(type){
        this.type = type
        let currentKE = this.getKE()
        this.setProperties(type)
        this.setKE(currentKE)// so change in mass does not change KE
    }
    setProperties(type){// sets the properties (.bp, .mp, etc) according to the molecule type
        this.mass = molecules[type].mass
        this.bp = molecules[type].bp
        this.mp = molecules[type].mp
        this.col = molecules[type].col
        this.r = molecules[type].radius
        this.coh = type == 7 ? 10 : this.mass * 0.1
    }
    getKE(){
        // KE = 0.5mv^2
        // v (magnitude) = sqrt(vx*vx + vy*vy)
        // v^2 = vx*vx+vy*vy
        return 0.5 * this.mass * (this.vx*this.vx + this.vy*this.vy)
    }
    setKE(amount){
        // sets to the amount of KE set, with velocity in the same direction
        let current = this.getKE() + 1e-10 // to avoid divide by zero
        let mult = amount / current
        this.vx*=mult
        this.vy*=mult
    }
    changeKE(amount){// adds amount KE. if don't have enough, returns remaining KE that couldn't be reduced
        let current = this.getKE()
        if(amount + current < 0){this.vx=0;this.vy=0;return -amount-current}
        this.setKE(current + amount)
        return 0
    }
    getPE(){// pe = mgh
        return this.mass * config.gravity * (config.worldHeight-this.y)
    }
    getTemperature(){
        const ke = this.getKE()
        return ke / config.boltzmann
    }
    iterate(){
        this.x += this.vx
        this.y += this.vy

        this.rot += this.vrot * (Math.abs(this.vx)+Math.abs(this.vy)) * 1

        this.rot

        this.vy += config.gravity// todo make this conserve energy ke + pe


        const t = this.getTemperature()
        // if(t < this.mp){
        //     // solid
        // }// add 'else' when solid implemented
        // if(t < this.bp){
        //     // liquid, should make this more rigorous
        //     this.col = '#4444aa'
        // }else{
        //     // gas
        //     this.col = "#aa4444"
        // }

        // check collisions

        // world boundings
        if(this.x < this.r){
            this.x = this.r
            phys.pressures[3]+=this.getKE()// rough approximation
            this.vx *= -1
        }else if(this.x > config.worldWidth - this.r){
            this.x = config.worldWidth - this.r
            this.vx *= -1
            phys.pressures[1]+=this.getKE()
        }
        if(this.y < this.r){
            this.y = this.r
            this.vy *= -1
            phys.pressures[0]+=this.getKE()
        }else if(this.y > config.worldHeight - this.r){
            this.y = config.worldHeight - this.r
            this.vy *= -1
            phys.pressures[2]+=this.getKE()
        }

    }
    draw(){
        if(config.drawMolecules){
            molecules[this.type].draw(this.x, this.y, this.rot)
        }else{
            canvas.drawCircle(this.x, this.y, this.r, this.col)
        }
    }
    interactWith(other){// interacts with a specific particle, called once for every pair of particles
        if(this == other){return}
        if(other == null){return}
        // distance check, no sqrt
        const dx = this.x - other.x + Math.random()-0.5 // random variation to avoid dx=0, etc
        const dy = this.y - other.y + Math.random()-0.5

        const liquid = this.getTemperature()<this.bp && other.getTemperature() < other.bp // boolean

        let d // distance - only used if liquid

        if(liquid){
            // if liquid <-> liquid interaction
            // cohesion
            // inverse square, since its loosely charge-based
            const d2 = dx*dx + dy*dy // distance squared
            d = Math.sqrt(d2)
            const ood = 1/d // one over distance, calculated once and then multiplied with for efficiency
            const f = (this.type == other.type ? 4 : 1) * -this.coh * other.coh / d2 // force (magnitude)

            const oom = 1/this.mass // one over mass
            const oopm = 1/other.mass // one over particle mass
            
            this.vx += f*(dx*ood)*oom
            this.vy += f*(dy*ood)*oom

            other.vx += -f*(dx*ood)*oopm
            other.vy += -f*(dy*ood)*oopm
        }


        // below this return is collisions
        if(dx*dx+dy*dy>(this.r+other.r)*(this.r+other.r)){return}

        // cant violate conservation of e

        // reaction check
        for(var i = 0; i < reactions.length; i ++){
            if(reactions[i].canHappen(this, other)){
                reactions[i].apply(this, other)
                break// stop looking for possible reactions
            }
        }

        const e = this.getKE() + other.getKE() // total energy
        const split = Math.sqrt(Math.random()) // change distribution if needed

        const angleBetween = Math.atan2(dy, dx)

        if(liquid){
            const offset = -0.5*(d - (this.r+other.r)) // calculated in above if liquid
            const nx = offset*Math.cos(angleBetween)
            const ny = offset*Math.sin(angleBetween)
            this.vx+=nx
            this.vy+=ny
            this.x+=nx
            this.y+=ny
            other.x-=nx
            other.y-=ny
            other.vx-=nx
            other.vy-=ny

        }else{// gas collisions

            const mod = (Math.random()-0.5)*3 // radians

            const angles = [angleBetween+mod, angleBetween+mod+3.1415]

            //e = 0.5mv^2
            //2e = mv^2
            //2e/m = v^2
            //v = sqrt(2e/m)
            const mags = [
                Math.sqrt(2*(e * split)/this.mass),
                Math.sqrt(2*(e * (1-split))/other.mass)
            ]

            this.vx = mags[0]*Math.cos(angles[0])
            this.vy = mags[0]*Math.sin(angles[0])
            other.vx = mags[1]*Math.cos(angles[1])
            other.vy = mags[1]*Math.sin(angles[1])
        
        }
        // console.assert(// assert conservation of energy
        //     Math.abs(e - (this.getKE() + particle.getKE())) <= 1e-10, // floating point errors, typically make a diff of 1e-14
        //     e - this.getKE() - particle.getKE()
        // )

    }
    destroy(){// delete self (Called by a Reaction)
        this.destroyed = true
    }
}