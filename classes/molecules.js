// contains both Molecule and Atom class, since Atom is so small

class Atom {
    constructor(name, color, size){
        this.name = name
        this.col = color
        this.r = size
    }
}

class Molecule {
    // in molecules, one of these per molecule type will be stored
    // this contains atomic information of the molecule, as well as a draw method
    // to be used by Particles to display themselves

    constructor(name, mass, bp, mp, centerAtom, atoms, col){
        // given the various properties of the molecule
        this.name = name
        this.mass = mass
        this.bp = bp
        this.mp = mp
        this.col = col

        // given a central atom, and a list of atoms to surround
        // only molecules with one principle component and surroudning is supported
        // eg. h2o, ch4, but not c2h6

        

        // if list of atoms has one element (eg cl2), they are 
        this.center = centerAtom
        this.radial = atoms

        if(!this.center){return}// if no center -> this is called from AdvancedMolecule()
        // meaning the following radius calculation doesnt work

        // as molecules are shown from their centers, but are approximated by Particles which are circles,
        // there will be some weird hitboxes.
        // eg h2o with its bent shape will have a circle collision radius around the oxygen
        // to make this as non-obvious as possible the radius is the average radius across the entire molecule
        this.radius = this.center.r
        let sum = 0
        for(var i = 0; i < this.radial.length; i ++){
            sum+=this.radial[i].r-2
        }
        this.radius += sum/Math.max(4, this.radial.length)
    }
    draw(x, y, rot = 0){
        if(this.radial.length == 1){// diatomic molecule

            const sep = this.center.r + this.radial[0].r - 4// separation

            const dx = Math.cos(rot)*sep/2
            const dy = Math.sin(rot)*sep/2

            canvas.drawCircle(x+dx,y+dy,this.center.r,this.center.col)
            canvas.drawCircle(x-dx,y-dy,this.radial[0].r,this.radial[0].col)

        }else{// non-diatomic molecule, meaning it has a centered
            // draw center atom
            canvas.drawCircle(x,y,this.center.r,this.center.col)

            if(this.radial.length > 1){// if has radials
                let angles = [0, 2]// bent shape for two lone pairs
                if(this.center.name == "Carbon"){angles[1]=3.1415}// doing a linear setup (no lone pairs)
                if(this.radial.length > 2){// if more than two (3, 4, etc), equally spaced angles
                    angles = []
                    for(var i = 0; i < this.radial.length; i++){
                        angles.push(6.28*i/this.radial.length)
                    }
                }
                if(this.radial.length == 4){// 'tetrahedral' rendering, for methane
                    angles = [0, 6.28/3, -6.28/3]// in thirds
                    for(var i = 0; i < 3; i ++){
                        canvas.drawCircle(
                            x + (this.center.r+this.radial[i].r - 3)*Math.cos(angles[i]+rot),
                            y + (this.center.r+this.radial[i].r - 3)*Math.sin(angles[i]+rot),
                            this.radial[i].r, this.radial[i].col
                        )
                    }
                    // atom on center
                    canvas.drawCircle(x, y, this.radial[i].r, this.radial[i].col)
                    return
                }
                for(var i = 0; i < this.radial.length; i ++){
                    canvas.drawCircle(
                        x + (this.center.r+this.radial[i].r - 4)*Math.cos(angles[i]+rot),
                        y + (this.center.r+this.radial[i].r - 4)*Math.sin(angles[i]+rot),
                        this.radial[i].r, this.radial[i].col
                    )
                }
            }
        }
    }
}


class AdvancedAtom extends Atom {
    // for use with AdvancedMolecule
    constructor(atom, x, y){
        // pass an Atom object
        // since one for each element is already stored and just used multiple times per Molecule
        // those can be used here too, to keep ie atom radius changes simple
        super(atom.name, atom.col, atom.r)

        this.x = x // position within AdvancedMolecule
        this.y = y 
    }
}

class AdvancedMolecule extends Molecule {
    // for ethane, other potential molecules?

    constructor(name, mass, bp, mp, col, atoms){
        // like above Molecule, except instead of central atom + radials,
        // a full atomic structure is made using AdvancedAtom
        // atoms is a list of all atoms within the molecule, and their positions within the molecule
        super(name, mass, bp, mp, null, null, col)

        this.atoms = atoms // list of all AdvancedAtoms which comprise this molecule

        // radius calculation
        let maxx = atoms[0].x
        let maxy = atoms[0].y
        let minx = atoms[0].x
        let miny = atoms[0].y
        atoms.forEach((v)=>{
            if(v.x+v.r>maxx){maxx=v.x+v.r}
            if(v.y+v.r>maxy){maxy=v.y+v.r}
            if(v.x-v.r<minx){minx=v.x-v.r}
            if(v.y-v.r<miny){miny=v.y-v.r}
        })
        
        // average of the halfsidelengths of the bounding rectangle
        // + 2 because 1) ethane should be bigger than methane 2) this formula tends to underestimate compared to Molecule
        this.radius = 2 + ((maxx-minx)+(maxy-miny))/4
    }
    draw(x, y, rot=0){

        const a = Math.cos(rot)
        const b = Math.sin(rot)

        // applies rot matrix:
        // cos -sin     a  -b
        // sin  cos  =  b   a
        // to do rotation of all points

        for(var i = 0; i<this.atoms.length; i ++){
            let aiq = this.atoms[i] // atom in question
            canvas.drawCircle(x + a*aiq.x - b*aiq.y, y + b*aiq.x + a*aiq.y, aiq.r, aiq.col)
        }
    }

}