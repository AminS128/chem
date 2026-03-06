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