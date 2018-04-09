// Scatter Plot Widget
//
// Author: Dr. Michelle M. M. Boyce
// Email: dr_smike@yahoo.ca
// Stardate: -304740.8584157788
//

// Notes: http://bl.ocks.org/peterssonjonas/4a0e7cb8d23231243e0e
function plotter(element_id,data) {

   this.pd = data;

   // define plot layout
   this.axesLength = 400;
   this.dx= Math.abs(this.pd.xMax-this.pd.xMin);
   this.dy= Math.abs(this.pd.yMax-this.pd.yMin);
   if (this.dx == this.dy) {
      this.xAxisPixelLength = this.axesLength;
      this.yAxisPixelLength = this.axesLength;
   } else if (this.dx > this.dy) {
      this.yAxisPixelLength = this.axesLength;
      this.xAxisPixelLength = this.yAxisPixelLength * this.dx/this.dy;
   } else {
      this.xAxisPixelLength = this.axesLength;
      this.yAxisPixelLength = this.xAxisPixelLength * this.dy/this.dx;
   }
   this.border = {top: 50, right: 50, bottom: 75, left: 75};

   // define axes
   this.xScale = d3.scaleLinear().domain([this.pd.xMin,this.pd.xMax]).range([0,this.xAxisPixelLength]).nice();
   this.yScale = d3.scaleLinear().domain([this.pd.yMin,this.pd.yMax]).range([this.yAxisPixelLength,0]).nice();
   this.xAxis = d3.axisBottom(this.xScale);
   this.yAxis = d3.axisLeft(this.yScale);

   // create svg container
   this.svgContainer = d3.select("#"+element_id).append("svg")
      .attr("width",this.border.left+this.xAxisPixelLength+this.border.right)
      .attr("height",this.border.top+this.yAxisPixelLength+this.border.bottom);

   // create plot container
   this.gPlotContainer = this.svgContainer.append("g").attr("class","scatter-plot")
      .attr("transform","translate("+this.border.left+","+this.border.top+")");

   // add axis ticks and numbers
   this.gPlotContainer.append("g").attr("class","x-axis")
      .attr("transform","translate(0,"+this.yAxisPixelLength+")")
      .call(this.xAxis);
   this.gPlotContainer.append("g").attr("class","y-axis").call(this.yAxis);

   // add grid lines
   this.gPlotContainer.append("g").attr("class","grid-lines")
      .attr("transform","translate(0,"+this.yAxisPixelLength+")")
      .call(this.xAxis.tickSize(-this.yAxisPixelLength).tickFormat(""));
   this.gPlotContainer.append("g").attr("class","grid-lines")
      .call(this.yAxis.tickSize(-this.xAxisPixelLength).tickFormat(""));
   this.gPlotContainer.selectAll(".grid-lines line").style("stroke","lightgrey");

   // add plot border (required to cover up grid line overlay)
   this.gPlotContainer.append("rect")
      .style("fill","none")
      .style("stroke","black")
      .attr("width",this.xAxisPixelLength)
      .attr("height",this.yAxisPixelLength);

   // axis labels
   this.svgContainer.append("text")
      .attr("x",this.border.left+this.xAxisPixelLength-5*this.pd.xLabel.length)
      .attr("y",this.border.top+this.yAxisPixelLength+this.border.bottom/2)
      .text(this.pd.xLabel);
   this.svgContainer.append("text")
      .attr("transform","translate("+this.border.left/2+","+(this.border.top)+") rotate(90)")
      .text(this.pd.yLabel);

   // plot title
   this.svgContainer.append("text")
      .attr("x",this.border.left+(this.xAxisPixelLength-5*this.pd.title.length)/2)
      .attr("y",3*this.border.top/4)
      .text(this.pd.title);

   // plot the data
   this.idClibPath = "plot-boundary-"+element_id;
   this.gPlotContainer.append("clipPath")
      .attr("id",this.idClibPath)
      .append("rect")
      .attr("width",this.xAxisPixelLength)
      .attr("height",this.yAxisPixelLength);
   (function(element,datum,idClibPath,xScale,yScale){
      element.selectAll(".point").data(datum).enter()
         .append("circle").attr("class","point")
         .attr("r",3).attr("stroke","black").attr("stroke-width",1.25).attr("fill","none")
         .attr("clip-path","url(#"+idClibPath+")")
         .attr("cx",function(d){return xScale(d.x)})
         .attr("cy",function(d){return yScale(d.y)});
   })(this.gPlotContainer,this.pd.datum,this.idClibPath,this.xScale,this.yScale);

   // add x-hairs region
   this.ordinats = (function(xScale,yScale){ 
      return function(xPixels,yPixels) {
         return "("
            +(Number(xScale.invert(xPixels)).toFixed(1))+", "
            +(Number(yScale.invert(yPixels)).toFixed(1))+
         ")";
      };
   })(this.xScale,this.yScale);
   this.gPlotContainer.append("line").attr("class","x-xhair")
      .attr("x1",this.xAxisPixelLength/2).attr("y1",0)
      .attr("x2",this.xAxisPixelLength/2).attr("y2",this.yAxisPixelLength)
      .attr("stroke","blue")
      .style("display","none");
   this.gPlotContainer.append("line").attr("class","y-xhair")
      .attr("x1",0).attr("y1",this.yAxisPixelLength/2)
      .attr("x2",this.xAxisPixelLength).attr("y2",this.yAxisPixelLength/2)
      .attr("stroke","blue")
      .style("display","none");
   this.gPlotContainer.append("text").attr("class","xhair-annotation")
      .attr("x",this.xAxisPixelLength/2+5).attr("y",this.yAxisPixelLength/2-5)
      .text(this.ordinats(this.xAxisPixelLength/2,this.yAxisPixelLength/2))
      .attr("fill","blue")
      .style("display","none");
   (function(element,oridnates,xAxisPixelLength,yAxisPixelLength){
      element
         .append("rect")
         .style("fill","none")
         .attr("x",0).attr("y",0)
         .attr("width",xAxisPixelLength)
         .attr("height",yAxisPixelLength)
         .style("pointer-events","all")
         .on("mouseover",function(){
            element.selectAll(".x-xhair, .y-xhair, .xhair-annotation").style("display",null);
         })
         .on("mouseout", function(){
            element.selectAll(".x-xhair, .y-xhair, .xhair-annotation").style("display","none");
         })
         .on("mousemove",function(){
            var coords = d3.mouse(this);
            var xPixels = coords[0];
            var yPixels = coords[1];
            var annotation = oridnates(xPixels,yPixels)
            element.select("line.x-xhair").attr("x1",xPixels).attr("x2",xPixels);
            element.select("line.y-xhair").attr("y1",yPixels).attr("y2",yPixels);
            element.select("text.xhair-annotation")
               .attr("x",xPixels-((xPixels<xAxisPixelLength/2)?-5:6.25*annotation.length+5))
               .attr("y",yPixels-((yPixels<yAxisPixelLength/2)?-15:5))
               .attr("clip-path","url(#plot-boundary)")
               .text(annotation);
         });
   })(this.gPlotContainer,this.ordinats,this.xAxisPixelLength,this.yAxisPixelLength);
};
