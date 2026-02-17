

const config = {
    targetFPS:30,
    worldWidth:512, // bounding box on all particles
    worldHeight:512,
    boltzmann:0.5, // not physically accurate, but used for fine-tuning when molecules phase transition
    // higher boltzmann -> lower temps
    gravity:0.06, // in pixels/s/s (not physically accurate)
    // stepping:false,
    energyThreshold:20, // per particle, how much energy can be off of conservation before correction
    energyCorrection:true,
    enthalpyMult:1,// multiplier on enthalpy, because particles have a different energy scale in sim than in real life
    drawMolecules:false// whether to draw molecules or just circles
}

document.addEventListener('DOMContentLoaded', ()=>{
    c.width=config.worldWidth;c.height=config.worldHeight
    config.drawMolecules = !document.getElementById('checkbox-particle-view').checked
    canvas.clearScreen()
})