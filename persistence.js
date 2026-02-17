const defaultState = {
    currentScenario:scenarios[0],
    scenarioID:0,
    simpleMolecules:false
}

function getPreviousState(){
    // returns object representing the state that was last saved to localstorage
    let savedState = localStorage.getItem('state')
    if(savedState){return JSON.parse(savedState)}
    return defaultState
}

function clearPreviousState(){
    // clears the localstorage state
    localStorage.setItem('state', JSON.stringify(defaultState))
}

function saveState(){
    // constructs a state object from current state and stores it in localstorage
    let state = {
        currentScenario:currentScenario,
        scenarioID:0,
        simpleMolecules:!config.drawMolecules
    }
    for(var i = 0; i < scenarios.length; i ++){
        // assumes that all scenarios have unique names, which they should
        if(currentScenario.name == scenarios[i].name){state.scenarioID=i}
    }

    localStorage.setItem('state', JSON.stringify(state))
}

function loadState(state){
    loadScenario(state.scenarioID, state.currentScenario.values)

    document.getElementById('checkbox-particle-view').checked = state.simpleMolecules
}

document.addEventListener("DOMContentLoaded", ()=>{

    loadState(getPreviousState())

})

window.addEventListener('unload', saveState)