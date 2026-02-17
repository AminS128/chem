class Modifier{
    constructor(name, type, options){
        // name of this parameter
        // type: 'range', 'selection', 'graph', etc
        // options: specifics (anonymous object)

            // type range: options should be {max:num, min:num, default:num, valueName:str}
                // valueName is the name with which it is accessed
            // type selection: options should be {names:str[], fx:func[], default:num, valueName:str}
                // where a func is run when option selected
                // default is then the index of the option that starts as selected
                // valueName is where selection is stored
            // type graph: options should be {eleTag:tag, valueName:str, type:num}
                // where valueName is how the graph is accessed by the updateFrame func or similar, ie a reference to a Graph object
                // tag is the tag of the graph element - canvas
                // type is the type of graph, 0,1,2 => scatter, bar, line
    
        this.name = name
        this.type = type
        this.options = options
    }
    runDefault(){// only works for selection type parameters - runs the effect of the default option
        if(this.type != 'selection'){return}

        if(this.options.fx[this.options.default]){
            this.options.fx[this.options.default]()
        }
    }
}