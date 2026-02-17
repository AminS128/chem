const scenarios = [
    new Scenario("Water in a box", [
        new Modifier("Particle Amount", 'range', {max:250,min:100,default:200,valueName:'amount'}),
        new Modifier("Energy Distribution", 'graph', {eleTag:'canvas-graph-one',valueName:'energy-graph',type:2,labelAxes:false}),
    ], [0], ()=>{
            for(var i = 0; i < currentScenario.values['amount']; i ++){
                phys.particles.push(new Particle(
                    Math.random()*config.worldWidth,
                    config.worldHeight*Math.random(),
                    10*(Math.random()-0.5),
                    10*(Math.random()-0.5),
                    0
                ))
            }
            // currentScenario.values['energy-graph'].labelAxes = false
            // // currentScenario.values['energy-graph'].render()
        }, ()=>{
            let egraph = currentScenario.values['energy-graph']
            let rawdata = phys.getEnergyDistribution(100, false)
            let datamax = getMaxOf(rawdata)
            rawdata.forEach((v, i)=>{egraph.writeData([i, v/datamax], true)}) // use smooth write data
            egraph.render()
        }),
    new Scenario("Hydrogen chloride formation", [
        new Modifier("Particle Amount", 'range', {max:250,min:50,default:200,valueName:'amount'}),
        new Modifier("Reactant Distribution", 'selection', {
            names:['Well-mixed', 'Sunny side up', 'Sunny side down', 'Half and half'],
            default:1,// default is sunny side up (the sun is made of hydrogen)
            valueName:"setup",
            fx:[()=>{
                    currentScenario.loadFunc = function(){
                        for(var i = 0; i < currentScenario.values['amount']; i ++){
                            phys.particles.push(new Particle(
                                Math.random()*config.worldWidth,
                                Math.random()*config.worldHeight,
                                5*(Math.random()-0.5),
                                5*(Math.random()-0.5),
                                i/currentScenario.values['amount'] < currentScenario.values['ratio'] ? 1:2
                            ))
                        }
                    }
                },
                ()=>{
                    currentScenario.loadFunc = function(){
                        for(var i = 0; i < currentScenario.values['amount']*currentScenario.values['ratio']; i ++){
                            phys.particles.push(new Particle(
                                Math.random()*config.worldWidth,
                                config.worldHeight/3+Math.random()*config.worldHeight/3,
                                25*(Math.random()-0.5),
                                25*(Math.random()-0.5),
                                1
                            ))
                        }
                        for(var i = 0; i < currentScenario.values['amount']*(1-currentScenario.values['ratio']); i ++){
                            phys.particles.push(new Particle(
                                Math.random()*config.worldWidth,
                                2*config.worldHeight/3+Math.random()*config.worldHeight/3,
                                5*(Math.random()-0.5),
                                5*(Math.random()-0.5),
                                2
                            ))
                        }
                    }
                },
                ()=>{
                    currentScenario.loadFunc = function(){
                        for(var i = 0; i < currentScenario.values['amount']*(1-currentScenario.values['ratio']); i ++){
                            phys.particles.push(new Particle(
                                Math.random()*config.worldWidth,
                                config.worldHeight/3+Math.random()*config.worldHeight/3,
                                2*(Math.random()-0.5),
                                2*(Math.random()-0.5),
                                2
                            ))
                        }
                        for(var i = 0; i < currentScenario.values['amount']*currentScenario.values['ratio']; i ++){
                            phys.particles.push(new Particle(
                                Math.random()*config.worldWidth,
                                2*config.worldHeight/3+Math.random()*config.worldHeight/3,
                                25*(Math.random()-0.5),
                                25*(Math.random()-0.5),
                                1
                            ))
                        }
                    }
                },
                ()=>{
                    currentScenario.loadFunc = function(){
                        for(var i = 0; i < currentScenario.values['amount']*(1-currentScenario.values['ratio']); i ++){
                            phys.particles.push(new Particle(
                                Math.random()*config.worldWidth/2,
                                config.worldHeight/3+2*Math.random()*config.worldHeight/3,
                                2*(Math.random()-0.5),
                                2*(Math.random()-0.5),
                                2
                            ))
                        }
                        for(var i = 0; i < currentScenario.values['amount']*(currentScenario.values['ratio']); i ++){
                            phys.particles.push(new Particle(
                                config.worldWidth/2+Math.random()*config.worldWidth/2,
                                config.worldHeight/3+2*Math.random()*config.worldHeight/3,
                                25*(Math.random()-0.5),
                                25*(Math.random()-0.5),
                                1
                            ))
                        }
                    }
                }
            ]
        }),
        new Modifier("Proportion Hydrogen", 'range', {max:1,min:0,default:0.5,valueName:'ratio'}),// how much hydrogen
        new Modifier("Amounts", 'graph', {eleTag:'canvas-graph-one',valueName:'amount-graph',type:1}),
        new Modifier("Reaction Progress over Time", 'graph', {eleTag:'canvas-graph-two',valueName:'progress-graph',type:2})
    ],[1,2,3],null,()=>{// updateFunc


        let agraph = currentScenario.values['amount-graph']
        let pgraph = currentScenario.values['progress-graph']
        
        if(phys.time==1){agraph.resetData();pgraph.resetData()}
        // reset on first frame
        // this isnt being run in a dedicated loadfunc because those are overridden in four diff ways
        // depending on setup selection

        let amounts = phys.countParticles()
        agraph.writeData([molecules[1].name, amounts[1]])
        agraph.writeData([molecules[2].name, amounts[2]])
        agraph.writeData([molecules[3].name, amounts[3]])
        agraph.dcol=molecules[3].col
        agraph.render()

        if(phys.time % (config.targetFPS/2) == 0 || phys.time==1){
            pgraph.writeData([Math.trunc(2*phys.time/config.targetFPS)/2, amounts[3]/(Math.min(amounts[1],amounts[2])*2+amounts[3])])
            pgraph.dcol=molecules[3].col
            pgraph.render()
        }
    }),
    new Scenario("Combustion of methane", [
        new Modifier("Particle Amount", 'range', {max:150,min:20,default:100,valueName:'amount'}),
        new Modifier("Oxygen per Methane", 'range', {max:3,min:0.5,default:2,valueName:'ratio'}),
        new Modifier("Amounts", 'graph', {eleTag:'canvas-graph-one',valueName:'amount-graph',type:1}),
        new Modifier("Carbon Products of Combustion", 'graph', {eleTag:'canvas-graph-two',valueName:'carbon-graph',type:3}),
    ], [4,5,0,7,8,6], ()=>{
        // methane + ratio * methane = amount
        // methane (1 + ratio) = amount
        // methane = amount / (1 + ratio)
        // oxygen = ratio * methane = ratio * amount / (1+ratio)
        for(var i = 0; i < currentScenario.values['amount']/(1+currentScenario.values['ratio']); i ++){
            phys.particles.push(new Particle(
                Math.random()*config.worldWidth/2,
                config.worldHeight/3+2*Math.random()*config.worldHeight/3,
                2*(Math.random()-0.5),
                2*(Math.random()-0.5),
                4
            ))
        }
        let amountMethane = phys.countParticles()[4]// bc the formula gets rounded or smt in the for loop above
        for(var i = 0; i < currentScenario.values['ratio']*amountMethane; i ++){
            phys.particles.push(new Particle(
                config.worldWidth/2+Math.random()*config.worldWidth/2,
                config.worldHeight/3+2*Math.random()*config.worldHeight/3,
                2*(Math.random()-0.5),
                2*(Math.random()-0.5),
                5
            ))
        }
    }, ()=>{
        let agraph = currentScenario.values['amount-graph']
        let cgraph = currentScenario.values['carbon-graph']
        if(phys.time==1){agraph.resetData();cgraph.resetData()}

        let amounts = phys.countParticles()
        agraph.writeData([molecules[4].name, amounts[4]])
        agraph.writeData([molecules[5].name, amounts[5]])
        agraph.writeData([molecules[0].name, amounts[0]])
        agraph.writeData([molecules[7].name, amounts[7]])
        agraph.writeData([molecules[8].name, amounts[8]])
        agraph.writeData([molecules[6].name, amounts[6]])
        agraph.dcol=molecules[0].col

        cgraph.writeData([molecules[7].name, amounts[7]])
        cgraph.writeData([molecules[8].name, amounts[8]])
        cgraph.writeData([molecules[6].name, amounts[6]])

        agraph.render()
        cgraph.render()
    }),
    new Scenario("Chlorination of methane", [
        new Modifier("Particle Amount", 'range', {max:120,min:40,default:60,valueName:'amount'}),
        new Modifier("Amounts", 'graph', {eleTag:'canvas-graph-one',valueName:'amount-graph',type:1}),
        // new Modifier("Reaction Products", 'graph', {ele:document.getElementById('canvas-graph-two'),valueName:'product-graph',type:3}),
        new Modifier('UV Intensity', 'range', {max:1,min:0,default:0,valueName:'uv'})
    ], [2,9,4,10,11,12,3], ()=>{
        for(var i = 0; i < currentScenario.values['amount']*0.5; i ++){
            phys.particles.push(new Particle(
                Math.random()*config.worldWidth,
                Math.random()*config.worldHeight,
                2*(Math.random()-0.5),
                2*(Math.random()-0.5),
                2
            ))
        }
        for(var i = 0; i < currentScenario.values['amount']*0.5; i ++){
            phys.particles.push(new Particle(
                Math.random()*config.worldWidth,
                Math.random()*config.worldHeight,
                25*(Math.random()-0.5),
                25*(Math.random()-0.5),
                4
            ))
        }
    }, ()=>{
        let agraph = currentScenario.values['amount-graph']
        if(phys.time==1){agraph.resetData()}

        if(currentScenario.values['uv']>0){
            for(var i = 0; i < phys.particles.length; i ++){
                if(phys.particles[i].type == 2){// if cl2 molecule
                    if(Math.random()<0.001*currentScenario.values['uv']){
                        // this will introduce energy into the system, heating it up slightly overall
                        // break into 2cl*
                        phys.particles[i].setType(9)
                        let np = new Particle(
                            phys.particles[i].x+20*(Math.random()-0.5),
                            phys.particles[i].y+20*(Math.random()-0.5),
                            0, 0, 9)
                        phys.particles.push(np)

                        // little circle effect for 1 frame
                        canvas.drawCircle(phys.particles[i].x,phys.particles[i].y,30,"#ffff0044")
                    }
                }else if(phys.particles[i].type == 9 || phys.particles[i].type == 10){
                    canvas.drawCircle(phys.particles[i].x,phys.particles[i].y,20,"#ffff0022")
                }
            }
        }

        let amounts = phys.countParticles()
        agraph.writeData([molecules[2].name, amounts[2]])
        agraph.writeData([molecules[4].name, amounts[4]])
        agraph.writeData([molecules[9].name, amounts[9]])
        agraph.writeData([molecules[10].name, amounts[10]])
        agraph.writeData([molecules[11].name, amounts[11]])
        agraph.writeData([molecules[12].name, amounts[12]])
        agraph.writeData([molecules[3].name, amounts[3]])
        agraph.dcol=molecules[11].col
        agraph.render()
    })
]

let currentScenario = scenarios[0]

function loadScenario(id, values = {}){
    // create a Scenario object that duplicates whatever object is passed
    // since 'scenario' can either be a Scenario or an anonymous object
    // this also means that the objects in 'scenarios' are always untouched and dont need resetting
    let scen = new Scenario(
        scenarios[id].name, scenarios[id].params, scenarios[id].involves,
        scenarios[id].loadFunc, scenarios[id].updateFunc
    )

    // for(var i = 0; i < scenarios.length; i ++){scenarios[i].reset()}// reset all scenarios and their memories

    document.getElementById('div-scenario-involves').innerHTML = ''// clear involves section
    document.getElementById('div-scenario-options').innerHTML = ''// clear options section
    
    document.getElementById('div-graph-one').className = 'hidden'// hide graphs
    document.getElementById('div-graph-two').className = 'hidden'
    document.getElementById('div-graph-three').className = 'hidden'
    
    currentScenario = scen

    document.getElementById('label-scenario').innerText = scen.name
    document.getElementById('select-scenario').value = scen.name

    scen.init()

    // copy over values from values to scen
    let valuelist = Object.keys(values)
    
    for(var i = 0; i < valuelist.length; i ++){
        
        let ogv = values[valuelist[i]] // original value
        if(typeof ogv != 'object'){
            scen.values[valuelist[i]] = ogv
        }else{ // this is a graph object, whose reference was stored in values before serialization
            scen.values[valuelist[i]] = new Graph(ogv.tag, ogv.type /*, ogv.data */) // does not use data backup
        }
    }
    
    for(var i = 0; i < scen.involves.length; i ++){
        let n = document.createElement('div')
        n.innerText = molecules[scen.involves[i]].name
        n.className = "involves-box"
        n.style.color = molecules[scen.involves[i]].col

        document.getElementById('div-scenario-involves').appendChild(n)
    }

    let graphCount = 0

    for(var i = 0; i < scen.params.length; i ++){
        let MIQ = scen.params[i] // modifier in question
        if(MIQ.type === 'range'){
            let d = document.createElement('div')//div
            d.className='container'
            let l = document.createElement('p')// label
            l.innerText = MIQ.name; l.className = 'label'
            let s = document.createElement('input')// slider
            s.className='slider'
            s.type = 'range'; s.max = 10;  s.min = 0; s.value = 10*(scen.values[MIQ.options.valueName]-MIQ.options.min)/(MIQ.options.max-MIQ.options.min)
            let n = document.createElement('input')// number input
            n.className='numin'
            n.type='number';n.min=MIQ.options.min;n.max=MIQ.options.max;n.value=scen.values[MIQ.options.valueName]

            s.addEventListener('input', (e)=>{
                canvas.stopSim()
                let value = MIQ.options.min + (MIQ.options.max-MIQ.options.min)*Number(e.target.value)/10
                currentScenario.values[MIQ.options.valueName] = value
                n.value = value
            })
            n.addEventListener('input', (e)=>{
                canvas.stopSim()
                let value = Number(e.target.value)
                if(value <= MIQ.options.max && value >= MIQ.options.min){
                    currentScenario.values[MIQ.options.valueName]=value
                }
                s.value = 10*((value-MIQ.options.min)/(MIQ.options.max-MIQ.options.min))
            })
            n.addEventListener('focusout', (e)=>{
                let value = Number(e.target.value)
                if(value>MIQ.options.max){value = MIQ.options.max;e.target.value=MIQ.options.max}
                if(value<MIQ.options.min){value = MIQ.options.min;e.target.value=MIQ.options.min}
                currentScenario.values[MIQ.options.valueName]=value
            })    
                
            d.appendChild(l);d.appendChild(s);d.appendChild(n)
            document.getElementById('div-scenario-options').appendChild(d)

        }else if(MIQ.type === 'selection'){
            let l = document.createElement('p')
            l.innerText = MIQ.name;  l.className = 'label'
            let s = document.createElement('select')
            for(var ii = 0; ii < MIQ.options.names.length; ii ++){
                let o = document.createElement('option')
                o.innerText = MIQ.options.names[ii]
                s.options.add(o)
            }
            
            s.options.selectedIndex=MIQ.options.default

            const toRun = MIQ.options.fx

            s.addEventListener('input', (e)=>{
                canvas.stopSim()
                currentScenario.values[MIQ.options.valueName]=e.target.options.selectedIndex;
                toRun[e.target.options.selectedIndex]()
            })
            
            document.getElementById('div-scenario-options').appendChild(l)
            document.getElementById('div-scenario-options').appendChild(s)
        }else if(MIQ.type === 'graph'){
            graphCount++
            let num = 'one'
            switch(graphCount){
                case 2:num='two';break
                case 3:num='three';break}
            document.getElementById('div-graph-'+num).classList.remove("hidden")
            document.getElementById('label-graph-'+num).innerText = MIQ.name
            scen.values[MIQ.options.valueName].labelAxes = !(MIQ.options.labelAxes === false) // if not specified, true, otherwise according to value given
            scen.values[MIQ.options.valueName].render()
        }
    }

    canvas.stopSim()
}

document.addEventListener('DOMContentLoaded',()=>{
    const selector = document.getElementById('select-scenario')
    for(var i = 0; i < scenarios.length; i ++){
        let o = new Option()
        o.innerText = scenarios[i].name
        selector.options.add(o)
    }
    selector.addEventListener('input', (e)=>{
        // console.log(e)
        loadScenario(e.target.options.selectedIndex)
    })
})