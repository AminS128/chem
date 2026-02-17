
/* types of particles
    0 -> H2O, water
    1 -> H2, hydrogen
    2 -> Cl2, chlorine
    3 -> HCl, hydrogen chloride
    4 -> CH4, methane
    5 -> O2, oxygen
    6 -> CO2, carbon dioxide
    7 -> C, carbon
    8 -> CO, carbon monoxide
    9 -> Cl*, chlorine radical
    10 -> CH3*, methyl radical
    11 -> Ch3Cl, chloromethane
    12 -> C2H6, ethane
*/


const atoms = {

    // pixels radius =/= actual physical radius in real life
    // hydrogen => 53 picometers, carbon => ~70 (very little difference, not visually good)

    empty:new Atom("Emptium", "#00000000", 0),// for a slot which is empty (ch3*)
    oxygen:new Atom("Oxygen", "#ff0000", 7),
    hydrogen:new Atom("Hydrogen", "#dddddd", 4),
    chlorine:new Atom("Chlorine", "#55ee55", 6),
    carbon:new Atom("Carbon", "#666666", 9)// cant be black because background is black
}

const molecules = [// all the properties of each particle type
    // 0
    new Molecule("H2O", 18, 373, 273, atoms.oxygen, [atoms.hydrogen, atoms.hydrogen], "#7777dd"),
    //1-3
    new Molecule("H2", 2, 20.28, 14.01, atoms.hydrogen, [atoms.hydrogen], "#dddddd"),
    new Molecule("Cl2", 70, 332, 266, atoms.chlorine, [atoms.chlorine], "#55ee55"),
    new Molecule("HCl", 36, 373, 273, atoms.chlorine, [atoms.hydrogen], "#669966"),
    //4-8
    new Molecule("CH4", 16, 200, 100, atoms.carbon, [atoms.hydrogen,atoms.hydrogen,atoms.hydrogen,atoms.hydrogen], "#ffbb55"),
    new Molecule("O2", 32, 130, 70, atoms.oxygen, [atoms.oxygen], "#88ffff"),
    new Molecule("CO2", 44, 260, 250, atoms.carbon, [atoms.oxygen, atoms.oxygen], "#aaaaaa"),
    new Molecule("C", 12, 2000, 1000, atoms.carbon, [], "#666666"),
    new Molecule("CO", 28, 100, 50, atoms.carbon, [atoms.oxygen], "#888888"),
    // 9-10 - radicals (bp, mp = 10,5 because they should basically never condense etc)
    new Molecule("Cl*", 35, 10, 5, atoms.chlorine, [], "#aaff00"),// electric yellow green
    new Molecule("CH3*", 15, 10, 5, atoms.carbon, [atoms.empty, atoms.hydrogen, atoms.hydrogen, atoms.hydrogen], "#ffff00"), // electric yellow
    // 11-12 final products of chlorination
    new Molecule("CH3Cl", 50, 300, 250, atoms.carbon, [atoms.chlorine, atoms.hydrogen, atoms.hydrogen, atoms.hydrogen], "#88aa44"),
    // ethane, id 12, AdvancedMolecule
    new AdvancedMolecule("C2H6", 30, 280, 250, "#ff4400", [
        new AdvancedAtom(atoms.hydrogen, 9.5, 0),// this hydrogen is not visible but kept in structure for completeness
        new AdvancedAtom(atoms.carbon, 6.5, 0),
        new AdvancedAtom(atoms.hydrogen, 9.7, 7.8),
        new AdvancedAtom(atoms.hydrogen, 9.7, -7.8),
        new AdvancedAtom(atoms.hydrogen, -9.7, 7.8),// this hydrogen and those below are behind their carbon
        new AdvancedAtom(atoms.hydrogen, -9.7, -7.8),
        new AdvancedAtom(atoms.carbon, -6.5, 0),
        new AdvancedAtom(atoms.hydrogen, -9.5, 0),
    ])
]

const reactions = [// list of all reactions which are supported, to be checked against on particle collision
    // hydrogen chloride formation
    new Reaction([1,2], [3,3], -184, 0.1), //H2+Cl2->2HCl
    
    // combustion of methane
    new Reaction([4,5], [0,0,7], -497, 0.5),// ch4 + o2 -> 2h2o + c
    new Reaction([7,5], [6], -393, 0.3),//c + o2 -> co2
    new Reaction([4,6], [0,0,7,7], -104, 0.03),//ch4 + co2 -> 2h2o + 2c: not sure if realistic, included for practical reasons, enthalpy from hess' law
    new Reaction([6,7], [8,8], -173, 0.1),// c + co2 -> 2co
    new Reaction([8,8], [6,7], 173, 0.3),// reverse reaction also, so that oxygen doesnt get locked in co instead of going to better places

    // chlorination of methane (radicals)
    // Cl2 -> 2Cl* is not a Reaction, since it happens '''spontaneously''' with one molecule rather than between two
    new Reaction([9,4],  [3,10], -104, 0.6),// cl* + ch4 -> hcl + ch3*
    new Reaction([2,10], [9,11], -107, 0.3),// cl2 + ch3* -> cl* + ch3cl
    new Reaction([9,9],  [2], -242, 0.3),// 2cl* -> cl2
    new Reaction([9,10], [11], -116, 0.3),// cl* + ch3* -> ch3cl
    new Reaction([10,10],[12], -55.3, 0.6) // 2ch3* -> c2h6, enthalpy from https://www.sciencedirect.com/science/article/pii/S2667312623000226
]