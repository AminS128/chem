function selectionSort(list){
    // sorts a list into increasing order
    let output = []; list.forEach((v)=>{output.push(v)}) // copy contents

    for(var i = 0; i < output.length-1; i ++){
        // find minimum
        let min = output[i]
        let minin = i // minimum index
        for(var ii = i+1; ii < output.length; ii ++){
            if(output[ii]<min){
                min=output[ii]
                minin=ii
            }
        }
        //swap w/ min
        let temp = output[i]
        output[i] = output[minin]
        output[minin] = temp
    }

    return output
}

function shuffle(list){
    let input = []; list.forEach((v)=>{input.push(v)})// copy contents, not reference

    let output = []
    while(input.length > 0){
        output.push(input.splice(Math.random()*input.length,1)[0])
    }
    
    return output
}

function getMaxOf(list){
    let max = list[0]
    list.forEach((v)=>{if(v>max){max=v}})
    return max
}