class Graph {
    // class for graphs - each graph displayed will have a Graph object which holds data and manages updates,
    // modifications, rendering, etc
    // should adapt to css and changes dynamically, for ease of use w/ html
    constructor(canvasElementTag, type, data = []){
        // canvasElementTag - tag of element to which this object corresponds
        // type -  0 = point graph, 1 = bar graph, 2 = line graph, 3 = pie chart
        // bar graph supports non-number x (for labels, etc)
        this.canvas = document.getElementById(canvasElementTag)
        this.ctx = this.canvas.getContext('2d')
        this.type = type
        this.bcol = "#ffffff"// background color
        this.dcol = "#ff0000"// data color
        this.lcol = "#888888" // label color, used by axes, labels, text, etc
        this.data = data // empty, pushed to by addData, modified by writeData

        this.dataLimit = null // if a number, data added beyond this limit will erase the lowest-index data point

        this.labelAxes = true
    
        this.tag = canvasElementTag // saved in the object because html elements are not serialized
    
    }
    addData(point){
        // point is of form [x, y]
        this.data.push(point)

        if(this.dataLimit && this.data.length > this.dataLimit){
            this.data.splice(0, 1)
        }

        // ensure that data is always in increasing order by x (if applicable)
        // selection sort, re-done because of type check necessity
        for(var i = 0; i < this.data.length-1; i ++){
            // find minimum
            let min = this.data[i][0]
            if(typeof min != "number"){return}// type checks so that bar graphs w/ text labels dont get sorted
            let minin = i
            for(var ii = i+1; ii < this.data.length; ii ++){
                if(typeof this.data[ii][0] != "number"){return}
                if(this.data[ii][0]<min){min=this.data[ii][0];minin=ii}
            }
            //swap w/ min
            let temp = this.data[i]
            this.data[i] = this.data[minin]
            this.data[minin] = temp
        }
    }
    writeData(point, smooth = false){
        // smooth: false if the new data y should overwrite, true if it should coerce the existing value towards itself smoothly
        const sF = 0.3 // smoothFactor: how much the new value should coerce the old


        // if the data y is nan, or if the data x (if its a number) is nan
        // accounts for data x being a string sometimes
        if(isNaN(point[1]) || (typeof point[0] == 'number' ? isNaN(point[0]) : false)){return}

        // point is of form [x, y]
        // finds existing data point w/ x of point and changes its y to new point's y
        for(var i = 0; i < this.data.length;i++){
            if(this.data[i][0] == point[0]){
                this.data[i][1] = smooth ? (sF * point[1] + (1-sF) * this.data[i][1]) : point[1]
                return
            }
        }

        // if no existing data point w/ x, make a new one
        this.addData(point)
    }
    render(){
        if(!this.canvas||!this.ctx){return}// if canvas not set yet
        if(this.canvas.style.display=="none"){return}// if canvas hidden

        this.canvas.width = this.canvas.clientWidth // width is internal, client width is width on page
        this.canvas.height = this.canvas.clientHeight // this keeps canvas at good resolution after scaling/whatever css

        let w = this.canvas.width // shorthand for ease
        let h = this.canvas.height

        // set label text type, for use everywhere
        let fontsize = Math.trunc(Math.min(18, Math.max(8, w/20)))
        this.ctx.font = `${fontsize}px monospace`
        this.ctx.textAlign = 'center'

        this.ctx.fillStyle = this.bcol // background fill
        this.ctx.fillRect(0, 0, w, h)

        // no data check
        if(this.data.length == 0){
            this.ctx.textAlign = "center"
            let noDataFontsize = Math.trunc(Math.min(30, w/10)) // dynamic font size, max 30
            this.ctx.font = `${noDataFontsize}px monospace`
            this.ctx.fillStyle = this.lcol
            this.ctx.fillText("No Data", w/2, h/2 + noDataFontsize/2)
            return // no other rendering, since no data anyway
        }

        let numericaldata = true // whether this graph represents numerical data

        // axes
            // find bounds
        let max = {x:this.data[0][0],y:this.data[0][1]} // sampled from first data point, which must exist at this point
        let min = {x:this.data[0][0],y:this.data[0][1]}
        for(var i = 0; i < this.data.length; i ++){
            if(typeof this.data[i][0] != 'number'){numericaldata = false;break}
            // set maxes and mins accordingly
            if(this.data[i][0]>max.x){max.x=this.data[i][0]}
            if(this.data[i][0]<min.x){min.x=this.data[i][0]}
            
            if(this.data[i][1]>max.y){max.y=this.data[i][1]}
            if(this.data[i][1]<min.y){min.y=this.data[i][1]}
        }

        const margin = fontsize+6

        if(this.type != 3){// if not pie chart
                // draw axes
            this.ctx.fillStyle = this.lcol
            this.ctx.fillRect(margin, margin, 5, h - 2*margin)
            this.ctx.fillRect(margin, h-margin, w - 2*margin, 5)
        }

        if(numericaldata){
            

                // to avoid bottom left point being always at origin, push minimum a little further
            // min.x -= Math.max(1, 0.05*(max.x-min.x))// at least 1 unit room, or 5% of the total range
            // min.y -= Math.max(1, 0.05*(max.y-min.y))

            max.x=Math.ceil(max.x);max.y=Math.ceil(max.y)       // round up and down to integers for bounds
            min.x=Math.trunc(min.x);min.y=Math.trunc(min.y)

            if(this.type != 3 && this.labelAxes){// if not pie chart
                    // axis labels
                        // minimums
                this.ctx.fillText(Math.trunc(min.x), margin, h-margin + fontsize + 3)
                this.ctx.fillText(Math.trunc(min.y), margin - 3 - (fontsize*0.2*String(Math.trunc(min.y)).length), h-margin)
                        // maximums
                this.ctx.fillText(Math.trunc(max.x), w-margin, h-margin + fontsize + 3)
                this.ctx.fillText(Math.trunc(max.y), margin - (fontsize*0.2*String(Math.trunc(max.y)).length)+3, margin-3)
            }
        }else{// non-numerical data
            min.y = 0 // since this is pretty much always needed
            let sum = 0
            for(var i = 0; i < this.data.length; i ++){// still need to find max, min of y
                if(this.data[i][1]<min.y){min.y=this.data[i][1]}
                if(this.data[i][1]>max.y){max.y=this.data[i][1]}
                sum+=this.data[i][1]
            }
            max[1]=Math.ceil(max[1])
            min[1]=Math.floor(min[1])

            if(this.type != 3 && this.labelAxes){// if not pie chart
                //minimum
                max.y = Math.max(max.y, sum/2)
                this.ctx.fillText(Math.trunc(min.y), margin - 3 - (fontsize*0.2*String(Math.trunc(min.y)).length), h-margin)
                // maximum
                this.ctx.fillText(Math.trunc(max.y), margin- (fontsize*0.2*String(Math.trunc(max.y)).length)+3, margin-3)
            }
        }

        // data rendering
        switch(this.type){
            case 0: // scatter plot
            
                this.ctx.fillStyle=this.dcol
                for(var i = 0; i < this.data.length; i ++){
                    let apparent = [] // apparent position on canvas
                    apparent[0] = (this.data[i][0]-min.x)/(max.x-min.x)// apparent now holds two nums from 0-1
                    apparent[1] = (this.data[i][1]-min.y)/(max.y-min.y)// like a reverse lerp?

                    apparent[0] = ((w - 2*margin - 5) * apparent[0])+margin+5 // apparent now gives pixel coords
                    apparent[1] = ((h - 2*margin - 5) * (1-apparent[1]))+margin+5 // the 1- is because 0,0 pixel is in top left, 0,0 graph is in bottom left
                    this.ctx.fillRect(apparent[0]-5,apparent[1]-5,10,10)
                }
                break
            case 1: // bar graph
                this.ctx.fillStyle=this.dcol
                this.ctx.textAlign = 'center'
                let columnwidth = (w - margin*3)/this.data.length
                for(var i = 0; i < this.data.length; i ++){
                    let x = 1.5*margin + i*columnwidth
                    let barheight = ((this.data[i][1]-min.y)/(max.y-min.y))*(h-2*margin)
                    this.ctx.fillRect(x, h-margin, columnwidth-4, -barheight) 
                    if(this.data.length < 10){
                        this.ctx.fillText(Math.trunc(10*this.data[i][1])/10,x + columnwidth/2 - 2, h-margin-barheight-2)
                    } 
                }
                this.ctx.fillStyle=this.lcol// column names
                if(this.data.length>5){fontsize-=3}// shrink if lots of names
                for(var i = 0; i < this.data.length; i ++){
                    let x = 1.5*margin + i*columnwidth
                    this.ctx.font=`${fontsize}px monospace`
                    this.ctx.fillText(this.data[i][0], x+columnwidth/2, h-margin+fontsize+4)
                }
                break
            case 2: // line graph
            
                this.ctx.strokeStyle=this.dcol
                this.ctx.beginPath()
                this.ctx.lineWidth = 2
                for(var i = 0; i < this.data.length; i ++){// pretty much the same as scatterplot
                    let apparent = [] // apparent position on canvas
                    apparent[0] = (this.data[i][0]-min.x)/(max.x-min.x)// apparent now holds two nums from 0-1
                    apparent[1] = (this.data[i][1]-min.y)/(max.y-min.y)// like a reverse lerp?

                    apparent[0] = ((w - 2*margin-5) * apparent[0])+margin+5 // apparent now gives pixel coords
                    apparent[1] = ((h - 2*margin-5) * (1-apparent[1]))+margin+5 // the 1- is because 0,0 pixel is in top left, 0,0 graph is in bottom left
                    if(i == 0){this.ctx.moveTo(apparent[0],apparent[1])}else{
                        this.ctx.lineTo(apparent[0],apparent[1])
                    }
                }
                this.ctx.stroke()
                this.ctx.closePath()
                break
            case 3:// pie chart
                const colors = ["#dd4444", "#44dd44", "#4444dd", "#dddd44", "#dd44dd", "#44dddd"]
                this.ctx.textAlign = 'left'
                let sum = 0
                for(var i = 0; i < this.data.length; i ++){sum+=this.data[i][1]}
                let startAt = 0//angle to start drawing arc at
                const rad = Math.min((w-margin*2)/2,(h-margin*2)/2)
                for(var i = 0; i < this.data.length; i ++){
                    this.ctx.beginPath()
                    const angle = 6.283 * this.data[i][1] / sum
                    this.ctx.moveTo(w/2, h/2)
                    this.ctx.lineTo(w/2+rad*Math.cos(startAt),h/2+rad*Math.sin(startAt))
                    this.ctx.arc(w/2,h/2,rad,startAt,startAt+angle+0.01, false)
                    
                    this.ctx.lineTo(w/2, h/2)
                    this.ctx.fillStyle = colors[i] || this.dcol
                    this.ctx.fill()
                    // this.ctx.textAlign = (Math.cos(startAt+angle/2) < 0 ? 'right':'left')
                    // if(this.data[i][1]!=0){
                    //     this.ctx.fillText(this.data[i][0] + ": " + Math.round(100*this.data[i][1]/sum)+"%", 
                    //         w/2 + (rad+8)*Math.cos(startAt+angle/2),
                    //         h/2 + (rad+8)*Math.sin(startAt+angle/2)+fontsize/2
                    //     )
                    // }
                    startAt += angle
                    this.ctx.closePath()
                    if(this.data[i][1]!=0){
                        this.ctx.fillText(this.data[i][0] + ": " + Math.round(100*this.data[i][1]/sum)+"%",
                        3,i*(fontsize+2)+fontsize+3)
                    }
                }
                break
        }

    }

    resetData(){
        this.data = []
        this.render()
    }
}
