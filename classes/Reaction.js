class Reaction {
    constructor(reactants, products, enthalpy, chance = 0.2) { // TODO activation energy
        // reactants, products, stored as formulas
        // if non-one of a reactant is needed, is repeated:
        // ie for H2 + Cl2 -> 2HCl,
        // rs = [H2, Cl2] and ps = [HCl, HCl]

        // temporary exceptions
        // if (reactants.length != products.length) {
        //     throw new Error("Reaction: synthesis and decomposition not yet supported");
        // }
        if (reactants.length != 2) {
            throw new Error("Reaction: only two reactants supported");
        }

        this.r = selectionSort(reactants);
        this.p = selectionSort(products);
        this.dH = enthalpy; // delta H in kJmol-1
        this.geo = chance; // represents likelihood per collision of reaction occuring, given requisite energy


        // accounts for reaction geometry, etc -- basically the probability that reaction
        // geometry is correct
    }
    validReactants(rList) {
        // takes list of reactants, returns true iff they match the reactants of this reaction
        let available = []; rList.forEach((v) => { available.push(v); }); // copy contents without reference
        let sorted = selectionSort(available);
        let matches = true;
        for (var i = 0; i < sorted.length; i++) {
            if (sorted[i] != this.r[i]) { matches = false; }
        }
        return matches;
    }
    canHappen(r1, r2) {

        if(r1.destroyed || r2.destroyed){return false}// this would mean that r1 or r2 have already reacted and been consumed this frame

        // takes two Particle objects, which have just collided, and returns whether this reaction will occur
        if (this.validReactants([r1.type, r2.type])) {
            let KE = r1.getKE() + r2.getKE();
            // each reactant is 1 mol, so KE requirement is 2*this.dH
            if (KE > 2 * this.dH * config.enthalpyMult && Math.random() <= this.geo) {
                // also accounts for probability of aligned reaction geometry
                return true;
            }
        }
        return false;
    }
    apply(r1, r2) {
        // takes two Particle objects and applies this reaction to them
        // doesnt need to redirect them, only reduce their energy
        const energyChange = -this.dH * 2 * config.enthalpyMult;
        let remaining = r1.changeKE(energyChange); // this func returns the remaining ke if reducing was not possible
        if (remaining > 0) { r2.changeKE(remaining); }
        phys.energy += energyChange;

        let toWrite = shuffle(this.p); // shuffle list of products and assign them
        r1.setType(toWrite[0]);
        if(this.p.length == 1){r2.destroy()}else{// if only one product, destroy the second Particle
        r2.setType(toWrite[1]);}
        if(this.p.length > 2){// if more than two products, create new Particle(s)
            for(var i = 2; i < this.p.length; i ++){// for starting at 2 (advanced)
                let np = new Particle(r1.x+Math.random()-0.5,r1.y+Math.random()-0.5,0,0,toWrite[i])// new particle
                phys.particles.push(np)
            }
        }
    }
}
