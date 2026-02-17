// c.addEventListener('mousedown', (e)=>{
//     // console.log(e)
//     if(e.button == 0){
//         phys.energy *= 0.9
//         for(var i = 0; i < phys.particles.length; i ++){
//             phys.particles[i].vx*=0.5
//             phys.particles[i].vy*=0.5
//         }
//     }else if(
//         e.button == 1
//     ){
//         e.preventDefault()
//         phys.energy *= 1.1
//     }
// })

// window.addEventListener('keydown', ()=>{
//     for(var i = 0; i < phys.particles.length; i ++){
//         phys.particles[i].vx*=1.5
//         phys.particles[i].vy*=1.5
//     }
// })