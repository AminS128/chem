

const config = {
    // sim settings
    targetFPS:30,
    worldWidth:512, // bounding box on all particles
    worldHeight:512,
    drawMolecules:false, // whether to draw molecules or just circles

    // physics
    boltzmann:0.5, // not physically accurate, but used for fine-tuning when molecules phase transition; higher boltzmann -> lower temps
    gravity:0.06, // in pixels/s/s
    enthalpyMult:1,// multiplier on enthalpy, because particles have a different energy scale in sim than in real life
    energyThreshold:20, // per particle, how much energy can be off of conservation before correction
    energyCorrection:true
}

document.addEventListener('DOMContentLoaded', ()=>{
    c.width=config.worldWidth;c.height=config.worldHeight
    config.drawMolecules = !document.getElementById('checkbox-particle-view').checked
    canvas.clearScreen()
})