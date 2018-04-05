// Scatter Plot Widget
//
// Author: Dr. Michelle M. M. Boyce
// Email: dr_smike@yahoo.ca
// Stardate: -304740.8584157788
//

function plotter(d3_AppendToElement,data) {

   this.pd = data;

   this.xAxisPixelLength = 500;
   this.yAxisPixelLength = 400;
   this.boarder = {top: 50, right: 50, bottom: 75, left: 75};

   this.xScale = d3.scaleLinear().domain([this.pd.xMin,this.pd.xMax]).range([0,this.xAxisPixelLength]).nice();
   this.yScale = d3.scaleLinear().domain([this.pd.yMin,this.pd.yMax]).range([this.yAxisPixelLength,0]).nice();

   this.svgContainer = d3_AppendToElement.append("svg")
      .attr("width",this.boarder.left+this.xAxisPixelLength+this.boarder.right)
      .attr("height",this.boarder.top+this.yAxisPixelLength+this.boarder.bottom);
   this.xAxis = d3.axisBottom(this.xScale);
   this.yAxis = d3.axisLeft(this.yScale);

   this.svgPlotContainer = this.svgContainer.append("g").attr("class","scatter-plot")
      .attr("transform","translate("+this.boarder.left+","+this.boarder.top+")");

   // add axis ticks and numbers
   this.svgPlotContainer.append("g").attr("class","x-axis")
      .attr("transform","translate(0,"+this.yAxisPixelLength+")")
      .call(this.xAxis);
   this.svgPlotContainer.append("g").attr("class","y-axis").call(this.yAxis);

   // add grid lines
   this.svgPlotContainer.append("g").attr("class","grid-lines")
      .attr("transform","translate(0,"+this.yAxisPixelLength+")")
      .call(this.xAxis.tickSize(-this.yAxisPixelLength).tickFormat(""));
   this.svgPlotContainer.append("g").attr("class","grid-lines")
      .call(this.yAxis.tickSize(-this.xAxisPixelLength).tickFormat(""));
   this.svgPlotContainer.selectAll(".grid-lines line").style("stroke","lightgrey");

   // add plot boarder (required to cover up grid line overlay)
   this.svgPlotContainer.append("rect")
      .style("fill","transparent")
      .style("stroke","black")
      .attr("width",this.xAxisPixelLength)
      .attr("height",this.yAxisPixelLength);

};
