class Scenario {
    // a list of these is all of the different reactions
    constructor(name, params, involves, loadFunction, updateFunction=()=>{}){
        // takes name, and a list of options
        // each param is a parameter (like starting temperature, amount of particles, etc)
            // of type Modifier
            // can also be a description of a graph
        // involves is a list of all particle types that are used
        // loadFunction is the default that is called on sim start -- some scenarios may override this based on
            // chosen options 
        // updateFunction is run every frame
        this.name = name
        this.params = params
        this.involves = involves
        this.values = {}// sim values are stored here in a dictionary setup
        this.loadFunc = loadFunction
        this.updateFunc = updateFunction

    }
    init(){// called when a scenario is loaded

        for(var i = 0; i < this.params.length; i ++){
            // if graph, create a graph object to put in values
            // otherwise get default
            this.values[this.params[i].options.valueName] = this.params[i].type == 'graph' ?
             new Graph(this.params[i].options.eleTag, this.params[i].options.type) :
             this.params[i].options.default
        }

        for(var i = 0; i < this.params.length; i ++){
            if(this.params[i].type == 'selection'){
                this.params[i].runDefault()
            }
        }
    }
    reset(){
        this.values = {}
    }
}