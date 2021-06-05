//Global variables that store the unique values of each data attribute
var jurisdictions = [];
var years = [];
var types = [];
var streams = [];
var fates = [];

//define the width and height of the SVG for Graph1
const w = 1200;
const h = 700;

//Global varable that stores the data filtered by jurisdiction, year, type, stream and then fate
//Used when the filter attributes changes
var tonnes_by_state_year_type_stream_fate;


//global filter variable
//used for Graph 1, this stores the filter tag based on the user interaction
//When the page is first loaded 'All' is selected for each attribute
var filter_variables = {
						year:"All", 
						fate:"All", 
						type:"All", 
						stream:"All"
						};
			
//Globle variable used to store all the specific tags (factors in 'All' as a selection)
//Populated in the toggle_dropdown function
//Used in the get_value5 function to filter values based on the selected tags
var filter_tags = [];
					
//Global variable that stores the Plastic Waste By Jurisdiction 					
var global_jurisdiction_values = {};

//Colour Scale Function 
//Global since it needs to be called onload and also when filter attributes change
var colours1 = ['#b2e2e2','#66c2a4','#2ca25f','#006d2c']
var colour_scale1 = d3.scaleQuantize()
				.range(colours1)
						

function init() {
	
						
	var dataset = [];

	//Load in the data
	d3.csv('data/plastic2.csv', function(d) {
		
		return{
			Year: parseInt(d.Year),
			Jurisdiction: d.Jurisdiction,
			Type: d.Type,
			Stream: d.Stream,
			Fate: d.Fate,
			Tonnes: parseInt(d.Tonnes)
		}
		
	}).then(function(data, error){
		
		if(error){
			console.log(error);
			console.log("An error has occured");
		}
		else{			
			
			//add complete dataset to variable
			dataset = data
			
			console.log("Dataset:");
			console.log(dataset);
			
			//Get unique years to variable
			years = data.map(function(d) { return parseInt(d.Year); } );
			years = unique(years);
			years.sort(function(a,b){return a-b});                           //Sort in ascending order
			console.log("Years:   ");
			console.log(years);
			
			//Get Unique Juristiction
			jurisdictions = data.map(function(d) { return d.Jurisdiction; } )		//Map all the types
			jurisdictions = unique(jurisdictions);									//Get the unique types
			jurisdictions = jurisdictions.sort();  	
			//console.log(jurisdiction);
			
			//Get unique types
			types = data.map(function(d) { return d.Type; } )		//Map all the types
			types = unique(types);									//Get the unique types
			types = types.sort();  									//Sort Alphabetically
			//console.log(types);
			
			//Get unique fate
			fates = data.map(function(d) { return d.Fate; } )		//Map all the types
			fates = unique(fates);									//Get the unique types
			fates = fates.sort();  									//Sort Alphabetically
			//console.log(fate);
			
			//Get unique Streams
			streams = data.map(function(d) { return d.Stream; } )		//Map all the types
			streams = unique(streams);									//Get the unique types
			streams = streams.sort();  									//Sort Alphabetically
			//console.log(fate);

			
			
			//var filters = [jurisdictions, types, streams, fates, years]
			var filters = [{jurisdictions:jurisdictions}, {types:types}, {streams:streams}, {fates:fates}, {years:years}]
		
		}	
		 

		
		//Graph 1 - GeoPath 
		generate_graph1(dataset);
		
		//Graph 2 - Line Chart - Recycled vs Landfill vs Energy 
		generate_graph2(dataset);
		
		//Graph 3 - Animated Bar Chart Plastic Type
		generate_graph3(dataset);
	
	});

	
	
		
}

window.onload = init;

//Function to leave just the unique items.
function unique(a) {
	var seen = {};
	return a.filter(function(item) {
		return seen.hasOwnProperty(item) ? false : (seen[item] = true);
	});	
}




function generate_graph1(dataset){
	

					
	//initialize the svg				
	var svg1 = d3.select("#chart1")
				.append("svg")
				.attr("id","svg1")  //Give an ID so can be refered to for updating the graphs
				.attr("width",w)
				.attr("height",h)
				.attr("fill", "grey");

					
	//Create a local variable Tonnes_By_State to store the tonnes by state
	var tonnes_by_state = [];
	
	//Function to strip out the value associated with the state
	function get_value(state_id, object){
		var value = 0;
		object.forEach(function(key_value){
			
			if(key_value.key == state_id){
				value = key_value.value;
			};
		
		});
		
		
		return value;
	};
	
	//Funcion that will separate the value from the state given a filter tag
	function get_value2(state_id, objects, filter){

		var object2 = {};
		var value = 0;
		objects.forEach(function(object){
		
			if(object.key == state_id){
				object2 =  object.values;
			};
		
		});
		
		
		object2.forEach(function(key_value_pair){

			if(key_value_pair.key == filter){
				value = key_value_pair.value;
			};
		});
		
		return value;
	};
	
	//Define Tonnes per state
	tonnes_by_state = d3.nest()
							.key(function(d) { return d.Jurisdiction; })
							.rollup(function(value) { return d3.sum(value, function(d) { return +d.Tonnes;} ) } )
							.entries(dataset);
	
	//Create global for Total Plastic Waster Tonnage 
	jurisdictions.forEach(function(jurisdiction){
			global_jurisdiction_values[jurisdiction] = get_value(jurisdiction,tonnes_by_state);
		});
		
	console.log("Global_Jurisdiction_Values: ");
	console.log(global_jurisdiction_values);
	console.log(Object.values(global_jurisdiction_values));
	
	// variable that filter by state and the fate of the plastic waste
	// When the page is loaded the Map is based off these values
	var tonnes_by_state_fate = d3.nest()
							.key(function(d) { return d.Jurisdiction; })
							.key(function(d) { return d.Fate; })
							.rollup(function(value) { return d3.sum(value, function(d) { return +d.Tonnes;} ) } )
							.entries(dataset);
	

	//Global variable that stores the data filtered by Jurisdiction, then Year, then Type, then stream, then Fate								
	tonnes_by_state_year_type_stream_fate = d3.nest()
									.key(function(d) { return d.Jurisdiction; })
									.key(function(d) { return d.Year; })
									.key(function(d) { return d.Type; })
									.key(function(d) { return d.Stream; })
									.key(function(d) { return d.Fate; })
									.rollup(function(value) { return d3.sum(value, function(d) { return +d.Tonnes;} ) } )
									.entries(dataset);
	
	
	
	//Define the Domain for the Colour Quantizer Scaller based on the max value of the colour domain
	//Object.values turns the global_jurisdiction_values key value pairs into an array of just the values
	colour_scale1.domain([0, d3.max(Object.values(global_jurisdiction_values), function(d) {return d;} ) 
				] );

	
		
	//Graph 1 - Australia GeoPath Projection
	var projection = d3.geoMercator()
						.center([135,-28.5])
						.translate([800,h/2])
						.scale(1000);
	
	//Create a path based on the projection
	var path = d3.geoPath()
					.projection(projection)
	
	
	//Create a projection for blowing up the size of ACT for clarity purposes
	var projection_act = d3.geoMercator()
							.center([135,-28.5])
							.translate([200,0])
							.scale(3700);
	
	//Create path based on the act projection 
	var path_act = d3.geoPath()
						.projection(projection_act)
	
	//Pull in the australia map geopath data file 
	d3.json("data/australia_map2.json").then(function(json_aus) {
	

			//Draw the Australia Map
			svg1.selectAll("path")
				.data(json_aus.features)
				.enter()
				.append("path")
				.attr("d",path)
				.attr("stroke","white")
				.attr("stroke-width","1px")
				.attr("id",function(d){return d.properties.STATE_CODE; })
				//Create Hover Over Functionality for each state
				.on('mouseover',function(d){
					

					
					//Raise the state/territory and colour stroke red
					d3.select(this)
						.attr("stroke","red")
						.attr("stroke-width","2px")
						.raise();
	
					
										
					//1st Line of text
					svg1.append("text")
						.attr("id","tooltip1")
						.attr("x",function(){
							
							
							return 50;
						})
						.attr("font-family","sans-serif")
						.attr("font-size","20px")
						.attr("text-anchor", "start")  //<!-- VERY IMPORTANT FOR ALLIGNMENT --!>
						.attr("y",function(){
								
								
								return 25;
						})
						.attr("fill","black")
						.text(d.properties.STATE_NAME);
						
					
					
					//
					add_filter_tags();
					
					console.log("Filter Tags 1");
					console.log(filter_tags);
					
					//Add the jurisdiction tag to the start of the array
					filter_tags.unshift(this.id);
					
					console.log("Filter Tags 2");
					console.log(filter_tags);
					
					var landfill; 
					var recycling; 
		
					
					//There are four options for the Fate Dropdown
					if(filter_variables.fate == 'All'){
					//if 'All' is selected: Energy from waste facility, Landfill and Recycling will be included 
						
						filter_tags.length = (filter_tags.length - 3);  				//These tags are added last so reducing the length by 3 will remove them all
						

						
						filter_tags.push("Landfill");									//Add back the Landfill tag
						

						
						landfill = get_value5(tonnes_by_state_year_type_stream_fate);	//Get the value associated with this combination of tags (Landfill)
						

						
						filter_tags.length = (filter_tags.length - 1);					//Remove the Landfill tag
						

						filter_tags.push("Recycling");									//Add in the recycling tag
						

						
						recycling =  get_value5(tonnes_by_state_year_type_stream_fate); //Get the value associated with this combination of tags (Recycling)
						

						
						
					}else if(filter_variables.fate == 'Landfill'){
					//If the Landfill tag is selected, recycling will be 0 and can get the value of Landfill
					
						recycling = 0;
						landfill = get_value5(tonnes_by_state_year_type_stream_fate);
						
						console.log("landfill");
						console.log(landfill);
						
						
					}else if(filter_variables.fate == 'Recycling'){
						
						landfill  = 0;
						recycling = get_value5(tonnes_by_state_year_type_stream_fate);
						
						console.log("Recycling");
						console.log(recycling);
						
					}else{
					//Energy from waste facility is selected therefore recycling and landfill both == 0
					
						recycling = 0;
						landfill =  0;
						
					}
		
					//Add the landfill and recycling values to an array to pass into the d3 function as data 
					var landfill_recycling  = [landfill,recycling]
					
					console.log(landfill_recycling);

					var width1 = w*0.2;
					
					var xScale = d3.scaleBand()
									.domain(d3.range(landfill_recycling.length))
									.rangeRound([0,width1]) //<-- enables rounding
									.paddingInner(0.20)
									.paddingOuter(0.20)
									; // 5% padding of the
									
					var xScale_Ordinal = d3.scaleBand()
									.domain(["Landfill (" + ((landfill/(landfill+recycling))*100).toFixed(0) + "%)" ,"Recycling (" + ((recycling/(landfill+recycling))*100).toFixed(0) + "%)"  ])
									.rangeRound([0,width1]) //<-- enables rounding
									.paddingInner(0.20) // 5% padding of the
									.paddingOuter(0.20); // 5% padding of the
								
					var height1 = h*0.5;  
					//Create Y Scale based on the max number of the landfill/recycling data
					var	yScale = d3.scaleLinear()
									.domain( [0, d3.max(landfill_recycling, function(d) { return d; } )*1.2 ] ) //Multiply max by 1.1 to extend the y axis
									.range( [height1,0] )
									
									
					var xAxis = d3.axisBottom()
								.ticks(2)
								.scale(xScale_Ordinal);
								
					var margin_top = 100;
					var margin_right = 80;
								
					//Generate the x Axis
					svg1.append("g")
						.attr("class","axis")
						.attr("transform", "translate(" + margin_right + ", "+ (height1 + margin_top) + ")")
						.call(xAxis)
						.style("font-size", "14px")
						;
						
								
					var yAxis = d3.axisLeft()
									.scale(yScale)
									.ticks(5)
									
					
					//<!-- Y Axis -->
					svg1.append("g")
						.attr("class", "axis")
						.attr("transform","translate(" + margin_right + ","+ margin_top +")")
						.call(yAxis)
						.style("font-size", "12px")
						;
				
					svg1.selectAll(".bar")
						.data(landfill_recycling)
						.enter()
						.append("rect")
						.attr("class","bar")
						.attr("x", function(d,i){
							return margin_right + xScale(i);
						})
						.attr("y",function(d){
							return margin_top + yScale(d);
						}) 
						.attr("width", xScale.bandwidth())
						.attr("height", function(d) {
							return height1 - yScale(d);
						})
						.attr("fill","slategrey");
						
		
					svg1.selectAll("#landfill_recycling1")
						.data(landfill_recycling)
						.enter()
						.append("text")
						.attr("id","landfill_recycling1")
						.attr("x", function(d,i){
							return margin_right + xScale(i) + xScale.bandwidth()/2;
						})
						.attr("y",function(d){
							return margin_top + yScale(d);
						}) 
						.attr("font-family","sans-serif")
						.attr("font-size","15px")
						.attr("text-anchor", "middle")  //<!-- VERY IMPORTANT FOR ALLIGNMENT --!>
						.attr("fill","black")
						.text(function(d){
							return d.toLocaleString('en')
						});
								
					//Second Line - Total Plastic Waste
					svg1.append("text")
						.attr("id","tooltip2")
						.attr("x",function(){
							
							
							return 50;
						})
						.attr("font-family","sans-serif")
						.attr("font-size","18px")
						.attr("text-anchor", "start")  //<!-- VERY IMPORTANT FOR ALLIGNMENT --!>
						.attr("y",function(){
								
								
								return 70;
						})
						.attr("fill","black")
						.text("Total Plastic (Tonnes): " + global_jurisdiction_values[this.id].toLocaleString('en') );  //.toLocaleString('en') converts a number to a 1000 comma separeted number as a string
					
					//third Line - Recycling
					// svg1.append("text")
						// .attr("id","tooltip3")
						// .attr("x",function(){
							
							
							// return 50;
						// })
						// .attr("font-family","sans-serif")
						// .attr("font-size","20px")
						// .attr("text-anchor", "start")  //<!-- VERY IMPORTANT FOR ALLIGNMENT --!>
						// .attr("y",function(){
								
								
								// return 90;
						// })
						// .attr("fill","black")
						// .text("Recycling: " + get_value2(this.id,tonnes_by_state_fate, 'Recycling'));
						
						
					
					
				
					
				})
				.on('mouseout', function(d){
					d3.select(this)
					.attr("stroke","white")
					.attr("stroke-width","1px");
					
					//If ACT is mouseout, de-pop ACT2 
					if(this.id == 'ACT'){
						d3.select('#ACT2')
							.attr("stroke","white")
							.attr("stroke-width","1px")
							.raise();
					};
					
					//Remove the tool tip
					d3.select("#tooltip1").remove();
					d3.select("#tooltip2").remove();
					//d3.select("#tooltip3").remove();
					
					//Remove Rectangles and axis
					d3.selectAll(".bar").remove();
					d3.selectAll(".axis").remove();
					d3.selectAll("#landfill_recycling1").remove();
					
					
				});
			
		
		console.log('Printed Aust map');
		
								
		
		
		//jquery to Colour each state by the scale of their plastic waste
		jurisdictions.forEach(function(jurisdiction){
			
			var id = '#' + jurisdiction;
			var fill = colour_scale1( global_jurisdiction_values[jurisdiction] );
		
			$(id).css('fill',fill);
			
			
		});
		
		
		//Create Colour Scale
		// var max_value = d3.max(Object.values(global_jurisdiction_values), function(d) {return d;});
		// var bin = max_value/colours1.length;
		
		// colours1.forEach(function(colour, index){
			// svg1.append("circle").attr("cx",w/4+80).attr("cy",h/10 + (30*index) ).attr("r", 12).style("fill", colour);
			// svg1.append("text").attr("class","colour_scale1_label").attr("x", w/4+100).attr("y", h/10 + (30*index) ).text( (Math.round(index*bin)).toLocaleString('en') + " - " + Math.round(((index+1)*bin)).toLocaleString('en') ).style("font-size", "15px").attr("alignment-baseline","middle").style("font-weight",1000);
		// });
		
		// svg1.append("text").attr("x",  w/4+100 ).attr("y", h/10 -30).text("Colour Scale").style("font-size", "20px").attr("alignment-baseline","middle").style("font-weight",1000).style("text-decoration","underline");
		
		//Create Bar Chart to demonstrate difference between states
		generate_graph1_bar_chart();

		
	});	
	

	//Create Dropdown menu
	set_dropdown_menus(years,'year');
	set_dropdown_menus(jurisdictions,'jurisdiction');
	set_dropdown_menus(streams,'stream');
	set_dropdown_menus(types,'type');
	set_dropdown_menus(fates,'fate');

	
	//Function to set the dropdown menus
	function set_dropdown_menus(object, id){
	
	
	
		var menu = {values:[{
				name:"All",
				value:"All",
				text:"All",
			}]
		};
		
		object.forEach(function(item)
		{	
			
			menu.values.push(
			{
				name:item,
				value:item,
				text:item,
			})
			
		});
			  
		
		$("#chart1_" + id )
		  .dropdown('setup menu',menu)
		;
		
		$("#chart1_" + id )
		  .dropdown('set selected',"All")
		;
		

	
	
	}
	
}

function generate_graph1_bar_chart(){
	
	//Remove all the Labels
	d3.selectAll('.yAxis1').remove();
	d3.selectAll('.xAxis1').remove();
	d3.selectAll('.graph1_bar').remove();

	
	var width = w*0.3;
	var height = h*0.2;


	const margin1 = { left: 80, top: 20, right: 150, bottom: 30 } //Margin for the svg
	

	var xScale1_axis = d3.scaleBand()
						.domain(jurisdictions)
						.range([0, width ])
						.paddingInner(0.50)
						.paddingOuter(0.50);
					
	var xScale1 = d3.scaleBand()
					.domain(d3.range(jurisdictions.length))
					.rangeRound([0,width]) //<-- enables rounding
					.paddingInner(0.50) 
					.paddingOuter(0.50); 
					
	var yScale1 = d3.scaleLinear()
					.range([height,0])
	
	
	//Create yScale range based on the max value of the current global_jurisdiction_values (which are based on the filter.)
	yScale1.domain([margin1.top,d3.max(Object.values(global_jurisdiction_values), function(d){ return d;})*1.05]);  //Multiplied by 1.05 to extend the yaxis limit for aesthetic reasons

	
	//Create the xAxis based on the xScale		
	var xAxis1 = d3.axisBottom()
					.ticks(7)
					.scale(xScale1_axis);
			
	//Create the yScale based on the y scale 	
	var yAxis1 = d3.axisLeft()
					.ticks(6)
					.scale(yScale1)
					
	//Generate the xAxis
	d3.select("#svg1")
		.append("g")
		.attr("class","xAxis1")
		.attr("transform", "translate(" + margin1.left + ", "+ h*0.95 + ")")
		.call(xAxis1)
		.style("font-size", "13px")
		.style("font-wieght","bold")
		;
	
	//Generate Label for X-Axis
	// d3.select("#svg1")
		// .append("text")             
		// .attr("transform",
				// "translate(" +  + " ," + 
							   // (h*0.95 + margin1.bottom) + ")")
		// .style("text-anchor", "middle")
		// .text("State or Territory")
		// .style("font-size", "15px")
	  // ;
		  

	
	//Generate the yAxis
	d3.select("#svg1")
		.append("g")
		.attr("class", "yAxis1")
		.attr("transform","translate(" + margin1.left + ","+ h*0.75 +")")     //h*0.75 as x axis is pushed h*0.95 and the height of the axis is h*0.2 
		.call(yAxis1)
		.style("font-size", "10px")
		;
	
	//Generate Label for yAxis
	d3.select("#svg1")
		.append("text")
		.attr("class","yAxis1_label")
        .attr("transform", "rotate(-90)")
        .attr("y",0)
        .attr("x",(0-h*0.85) )
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Plastic (Tonnes)")
	    .style("font-size", "15px")
	    .style("font-wieght","bold")
	    ;

		
	function draw_rectangles(data){
			
		d3.select("#svg1")
			.selectAll(".graph1_bar")
			.data(data)
			.enter()
			.append("rect")
			.attr("class","graph1_bar")
			.attr("x",function(d,i){
				return xScale1(i) + margin1.left ;
			})
			.attr("y",function(d){
				return yScale1(d) + 0.75*h;
			})
			.attr("width", xScale1.bandwidth())
			.attr("height", function(d) {
				

				return height - yScale1(d);
			})
			.attr("fill",function(d,i){
				return colour_scale1(d);
			})
			.on("mouseover", function(d,i){
				
				var xPosition = parseFloat(d3.select(this).attr("x"));
				var yPosition = parseFloat(d3.select(this).attr("y"));
				console.log("X pos: " + xPosition + ", Y Pos: " + yPosition)
				
				d3.select("#svg1")
					.append("text")
					.attr("id","waste_value1")
					.attr("x",xPosition + xScale1.bandwidth()/2)
					.attr("font-family","sans-serif")
					.attr("font-size","12px")
					.attr("text-anchor", "middle")  //<!-- VERY IMPORTANT FOR ALLIGNMENT --!>
					.attr("y",yPosition)
					.attr("fill","black")
					.text(d);
					
				
			})
			.on("mouseout", function(){
				d3.select("#svg1").select("#waste_value1").remove();
				
			});
			
		//create a heading for the graph	
		d3.select("#svg1")
			.append("text")
			.attr("class","bar_chart1_heading")
			.attr("x", margin1.left + (width / 2))             
			.attr("y", h*0.73)
			.attr("class","heading")
			.attr("text-anchor", "middle")  
			.style("font-size", "17px") 
			.style("text-decoration", "underline")  
			.style("font-weight", "bold")  
			.text("Juristiction Bar Chart Comparison"); //Starting/Default graph is 2018 so have hardcoded it
	};

	//Draw Rectangle with global duristiction data
	draw_rectangles(Object.values(global_jurisdiction_values) );
	
}

function reset_filters(){
	
	//Convert filter_variables into an array of just the values
	//Send them through the unique function to return only unique values
	var all = unique(Object.values(filter_variables));

	if(all.length == 1){
	//if the array length is 1 it means "All" was already selected by all the dropdown menus
		console.log("Filters were already reset");
	}
	else{
	//Otherwise
	
		//Reset Filter variables to "All" selections
		filter_variables = {
						year:"All", 
						fate:"All", 
						type:"All", 
						stream:"All"
						};
		
		
		//Reset each dropdown menu to display All
		//Object.keys creates array of just the keys from the filter_variables
		Object.keys(filter_variables).forEach(function(filter_variable){
			
		
			$("#chart1_" + filter_variable )
			  .dropdown('set selected',"All")
			;
		
		});
		
		//Update the map
		update_australia_map();
	}
	
}

//When a dropdown menu is clicked this funciton is run
function toggle_dropdown(id){
	
	//Id is "chart1_ + filter name (according to filter variables (year, fate, type, stream)
	//Splitting the id at the underscore will return the filter name (#1 index position)
	var filter = id.split("_")
	filter = filter[1];
	
	//Use jquery to get the value of the dropdown 
	var item = $('#' + id).dropdown('get value');
	
	console.log("Global_Jurisdiction_Values: before the filter was changed:");
	console.log(global_jurisdiction_values);
	
	if(item != filter_variables[filter]){
	//Only if the filter variable changes will this code be run
		
		//Update the filter_variable
		filter_variables[filter] = item;
		
		//Call Update Map Function
		update_australia_map();
		
		//Update the total mass comparisson table
		
			
		
		
	}
}

function add_filter_tags(){
	
	//Clear the filter variables and add them based on the current selections factoring in "All" selections
	filter_tags = [];
	
	//If All selected for years, add all the years to the filter_tags array
	if(filter_variables.year == "All"){
		years.forEach(function(year){
			
			//Convert years into a string as key will be in string format
			filter_tags.push( String(year) );
		})
	}else{
		filter_tags.push(filter_variables.year );
	};
	
	//If All selected for Type, add all the types to the filter_tags array
	if(filter_variables.type == "All"){
		types.forEach(function(type){
			filter_tags.push(type);
		})
	}else{
		filter_tags.push(filter_variables.type	);
	};
	
	//If All selected for Stream, add all the streams to the filter_tags array
	if(filter_variables.stream == "All"){
		streams.forEach(function(stream){
			filter_tags.push(stream);
		})
	}else{
		filter_tags.push(filter_variables.stream	);
	};
	
	//If All selected for Fate, add all the fates to the filter_tags array
	if(filter_variables.fate == "All"){
		fates.forEach(function(fate){
			filter_tags.push(fate);
		})
	}else{
		filter_tags.push(filter_variables.fate	);
	};
}

function update_australia_map(){
	
	
	
	//Add filter tags depending on dropdown selections
	add_filter_tags();
	
	console.log("Filter Tags: ");
	console.log(filter_tags);
	
	//Cycle through each state and grab the new value based on the filters
	jurisdictions.forEach(function(jurisdiction, index) {
		
		var new_value = 0;
		
		var jurisdiction_object;
		
		console.log((index+1) + " - " + jurisdiction + ": ");
		tonnes_by_state_year_type_stream_fate.forEach(function(object){
			
			if(object.key == jurisdiction){
			
				jurisdiction_object = object.values;
			}
			
			
		});
		
		//run the get_value function with the state specific object to grab the plastic tonnes value
		//based on the global filter variables
		new_value = get_value5(jurisdiction_object);
			
		
		console.log("The returned value for " + jurisdiction + " was: " + new_value );
		
		
		//update the global_jurisdiction_values with the new value
		global_jurisdiction_values[jurisdiction] = new_value;
	})
	
	//console.log("Global_Jurisdiction_Values: after the filter was changed:");
	//console.log(global_jurisdiction_values);
	
	//Update the colours of the map
	jurisdictions.forEach(function(jurisdiction){
		
		//Re-define the Domain for the Colour Quantizer Scalle
		//Object.values turns the global_jurisdiction_values key value pairs into an array of just the values
		colour_scale1.domain([0, d3.max(Object.values(global_jurisdiction_values), function(d) {return d;} ) 
					] );
		
		//The ID of the geopath drawn state is based on the jurisdictions names
		var id = '#' + jurisdiction;
		var fill = colour_scale1( global_jurisdiction_values[jurisdiction] );
	

		//Use Jquery to change the colour of the specific state
		$(id).css({fill: fill, transition: "2.0s"});
		
			
	});
	
	////Update the colour scale legend 
	// var max_value = d3.max(Object.values(global_jurisdiction_values), function(d) {return d;});
	// var bin = max_value/colours1.length;
	
	//Remove the current Colour Scale Labels
	// d3.selectAll(".colour_scale1_label").remove();
	//Insert the new labels based on the updated data
	// colours1.forEach(function(colour, index){
		
		// d3.select("#svg1").append("text").attr("class","colour_scale1_label").attr("x", w/4+100).attr("y", h/10 + (30*index) ).text( (Math.round(index*bin)).toLocaleString('en') + " - " + Math.round(((index+1)*bin)).toLocaleString('en') ).style("font-size", "15px").attr("alignment-baseline","middle").style("font-weight",1000);
	// });
	
	// d3.select("#svg1").append("text").attr("x",  w/4+100 ).attr("y", h/10 -30).text("Colour Scale (Tonnes)").style("font-size", "20px").attr("alignment-baseline","middle").style("font-weight",1000).style("text-decoration","underline");
	
	//Generate the bar chart
	generate_graph1_bar_chart();
	
}

function get_value5(objects){

	
	//Local sum will store the value for that level of the object	
	var local_sum = 0;
		
	objects.forEach(function(object){
	//Cycle through each object within the object passed in
		
		
		if(filter_tags.includes(object.key)){
		//if object key matches with filter tags - tag: " + object.key);
			
			if(object.values){
			//Not at the lowest level 
			
				//use recursion to get the summed value for the lower level object.values
				var value = get_value5(object.values);
				
				//Store that value in the local sum as we cycle through the other objects
				local_sum = local_sum + value; 
			
			}else{
			//AT the Value level (the lowest level of the object"
				
				//At this value to the local_sum variable 
				local_sum = local_sum + object.value;
		
				
			};
		}

	});
	
	//Return the local sum either to the level above or the calling function
	return local_sum;
}


function generate_graph2(dataset){
		const w = 1200;
		const h = 720;

	
		const margin2 = { left: 100, top: 100, right: 140, bottom: 30 } //Margin for the svg
	
		var xScale2 = d3.scaleBand()
						.domain(years)
						.range([0, w - margin2.right]);
		
		//Y scale has midpoints a quarter of the way up the axis as creating a discontinuous y-axis graph
		var yScale2 = d3.scaleLinear()
						.range([h,650,550,margin2.top])
		
		var tonnes_by_year_fate = d3.nest()
						.key(function(d) {return d.Year;})
						.key(function(d) {return d.Fate;})
						.rollup(function(value){return d3.sum(value, function(d) {return +d.Tonnes;} ) } )
						.entries(dataset);
								
		
		//this variable will store all the tonnes by year and by fate for the yScale function
		var tonnes_by_year_fate_range = [];
		
		tonnes_by_year_fate.forEach(function(object){
			
			years.forEach(function(year){
				if(object.key == year){
					
					object.values.forEach(function(object_fate){
						
						fates.forEach(function(fate){
							if(object_fate.key == fate){
								tonnes_by_year_fate_range.push(object_fate.value);
							};
						});
						
					});
					
					
				};
			});
		});
		
		//Update the y-scale domain based on the range of tonnes for landfill/recycling each year
		//Domain specifies points that help to create a discontinuous axis
		yScale2.domain( [0,200000,300000 ,d3.max(tonnes_by_year_fate_range, function(d) { return d; } ) + 200000 ] );
		
		
		var svg2 = d3.select("#chart2")
				.append("svg")
				.attr("width", w + margin2.right + margin2.left)
				.attr("height",h + margin2.bottom + margin2.top)
				
		//Create the xAxis based on the xScale		
		var xAxis2 = d3.axisBottom()
						.ticks(10)
						.scale(xScale2)
						;
				
		//Create the yScale based on the y scale values, specify the exact ticks due to discontinuous axis	
		var yAxis2 = d3.axisLeft()
						.tickValues([0,50000,100000,150000,500000,1000000,2000000,3000000,4000000,5000000])
						.scale(yScale2)
						;
						
		//Generate the xAxis
		svg2.append("g")
			.attr("class","Axis")
			.attr("transform", "translate(" + margin2.left + ", "+ h + ")")
			.call(xAxis2)
			.style("font-size", "18px")
			;
			
		//Generate Label for X-Axis
		svg2.append("text")             
		  .attr("transform",
				"translate(" + (w/2) + " ," + 
							   (h + margin2.top/2) + ")")
		  .style("text-anchor", "middle")
		  .text("Year")
		  .style("font-size", "20px")
		  .style("font-wieght","bold")
		  ;
			
		
		//Generate the yAxis
		svg2.append("g")
			.attr("class", "Axis")
			.attr("transform","translate(" + margin2.left + ","+ 0 +")")
			.call(yAxis2)
			.style("font-size", "15px")
			;
			
		//Generate Label for yAxis
		svg2.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y",0)
		  .attr("x",(0-h/2) )
		  .attr("dy", "1em")
		  .style("text-anchor", "middle")
		  .text("Plastic (Tonnes)")
		  .style("font-size", "20px")
		  .style("font-wieght","bold")
		  ;

		//Append rectangles over the Y-axis to create a break in the axis scale
		svg2.append("rect")
		  .attr("x", margin2.left- 10)
		  .attr("y", yScale2(275000))
		  .attr("height", 60)
		  .attr("width", 20)

		  ; 
		svg2.append("rect")
		  .attr("x", margin2.left - 11)
		  .attr("y", yScale2(270000))
		  .attr("height", 50)
		  .attr("width", 22)
		  .style("fill", "white")
		  ;
		
		//Add line to hammer home a break in the scale
		svg2.append('line')
			.style("stroke", "black")
			.style("stroke-width", 1)
			.style("stroke-dasharray", ("10, 10"))
			.attr("x1", margin2.left)
			.attr("y1", yScale2(245000))
			.attr("x2", margin2.left + w)
			.attr("y2",  yScale2(245000)); 
		 
		
		//Function that takes in the dataset and returns an object with the year and value 
		function get_fate_tonnage_by_year(tonnes_by_year_fate_object, fate_tag){
			
			var object_key_year_value_tonnage = [];
			
			tonnes_by_year_fate_object.forEach(function(object_key_is_year, index){
				
				years.forEach(function(year){
					if(object_key_is_year.key == year)
					{
						object_key_is_year.values.forEach(function(object_key_is_fate){
							
							if(object_key_is_fate.key == fate_tag){
								
								object_key_year_value_tonnage[index] = {Year:year, Tonnes:object_key_is_fate.value};
							};
						});
					};
					
				});
				
			});
			
			return object_key_year_value_tonnage;
		};
		
		//Create Variable to store year and landfill data
		var tonnes_year_landfill = get_fate_tonnage_by_year(tonnes_by_year_fate, "Landfill");
		var tonnes_year_recycling = get_fate_tonnage_by_year(tonnes_by_year_fate, "Recycling");
		var tonnes_year_energy = get_fate_tonnage_by_year(tonnes_by_year_fate, "Energy from waste facility");
		
		//Add in 2006 as 0 Tonnes to tonnes_year_energy
		tonnes_year_energy.push({Year:2006,Tonnes:0});
		
		
		line = d3.line()
				.x(function(d,i) { return xScale2(d.Year) + margin2.left + 54; } )
				.y(function(d) { return yScale2(d.Tonnes); } );
			
		//Create are for colouring in the chart
		// area = d3.area()
					// .x(function(d) { return xScale2(d.Year) + margin2.left + 54; } )
					// .y0(function() { return yScale2.range()[0] } )
					// .y1(function(d) { return yScale2(d.Tonnes) } )
					
		//Append path based on landfill data
		svg2.append("path")
			.datum(tonnes_year_landfill)			//Since one line use datum (singular) of data
			.attr("class","line")
			.attr("d",line)
			.attr("stroke", "#8da0cb") 	
			.attr("stroke-width","4px")
			.attr("fill","none")
			.style("stroke-dasharray", ("5, 5"))
			;
			
		
		//Append path based on landfill data
		svg2.append("path")
			.datum(tonnes_year_recycling)			//Since one line use datum (singular) of data
			.attr("class","line")
			.attr("d",line)
			.attr("stroke", "#66c2a5")
			.attr("stroke-width","4px")
			.attr("fill","none")
			.style("stroke-dasharray", ("3, 3"))
			;
		
		//Append path based on landfill data
		svg2.append("path")
			.datum(tonnes_year_energy)			//Since one line use datum (singular) of data
			.attr("class","line")
			.attr("d",line)
			.attr("stroke", "#fc8d62")
			.attr("stroke-width","4px")
			.attr("fill","none")
			.style("stroke-dasharray", ("1, 1"))
			;
			
		
		//create a heading for the graph
		// svg2.append("text")
			// .attr("x", (w / 2))             
			// .attr("y", 0 + (margin2.top/4))
			// .attr("class","heading")
			// .attr("text-anchor", "middle")  
			// .style("font-size", "30px") 
			// .style("text-decoration", "underline")  
			// .style("font-weight", "bold")  
			// .text("Graph 2 - Plastic Waste Fate");	
			
		//Create a legend for the graph
		svg2.append("circle").attr("cx",900).attr("cy",40).attr("r", 6).style("fill", "#8da0cb")
		svg2.append("circle").attr("cx",900).attr("cy",70).attr("r", 6).style("fill", "#66c2a5")
		svg2.append("circle").attr("cx",900).attr("cy",100).attr("r", 6).style("fill", "#fc8d62")
		svg2.append("text").attr("x", 920).attr("y", 40).text("Landfill").style("font-size", "15px").attr("alignment-baseline","middle")
		svg2.append("text").attr("x", 920).attr("y", 70).text("Recycling").style("font-size", "15px").attr("alignment-baseline","middle")
		svg2.append("text").attr("x", 920).attr("y", 100).text("Energy from waste facility").style("font-size", "15px").attr("alignment-baseline","middle")
		svg2.append("text").attr("x", 960).attr("y", 10).text("Legend").style("font-size", "20px").attr("alignment-baseline","middle").style("font-weight",1000)
		svg2.append("rect").attr("x",890).attr("y",25).attr("height", 90).attr("width", 210).style("fill", "none").style("stroke", "black")

		//Mouse Over events for the lines:
		var mouseG = svg2.append("g")
						.attr("class", "mouse-over-effects");

		mouseG.append("path") // this is the black vertical line to follow mouse
			  .attr("class", "mouse-line-horizontal")
			  .style("stroke", "black")
			  .style("stroke-width", "1px")
			  .style("opacity", "0");
		
		mouseG.append("path") // this is the black vertical line to follow mouse
			  .attr("class", "mouse-line-vertical")
			  .style("stroke", "black")
			  .style("stroke-width", "1px")
			  .style("opacity", "0");
		  
		var lines = document.getElementsByClassName('line');
		
		
		//Create Mouse over effects for Landfill data/line
		var mousePerLineLandfill = mouseG.selectAll('.mouse-per-line-landfill')
								  .data(tonnes_year_landfill)
								  .enter()
								  .append("g")
								  .attr("class", "mouse-per-line-landfill");

		mousePerLineLandfill.append("circle")
					  .attr("r", 7)
					  .style("stroke", "#8da0cb")
					  .style("fill", "none")
					  .style("stroke-width", "1px")
					  .style("opacity", "0");

		mousePerLineLandfill.append("text")
					.attr("transform", "translate(10,-20)")
					.style("font-weight","bold");
		
		
		//Create Mouse over effects for Recyling data/line
		var mousePerLineRecycling = mouseG.selectAll('.mouse-per-line-recycling')
								  .data(tonnes_year_recycling)
								  .enter()
								  .append("g")
								  .attr("class", "mouse-per-line-recycling");

		mousePerLineRecycling.append("circle")
					  .attr("r", 7)
					  .style("stroke", "#66c2a5")
					  .style("fill", "none")
					  .style("stroke-width", "1px")
					  .style("opacity", "0");

		mousePerLineRecycling.append("text")
					.attr("transform", "translate(10,-20)")
					.style("font-weight","bold");
		
		
		//Create Mouse over effects for Energy Waste data/line
		var mousePerLineEnergy = mouseG.selectAll('.mouse-per-line-energy')
								  .data(tonnes_year_energy)
								  .enter()
								  .append("g")
								  .attr("class", "mouse-per-line-energy");

		mousePerLineEnergy.append("circle")
					  .attr("r", 7)
					  .style("stroke", "#fc8d62")
					  .style("fill", "none")
					  .style("stroke-width", "1px")
					  .style("opacity", "0");

		mousePerLineEnergy.append("text")
					.attr("transform", "translate(10,-20)")
					.style("font-weight","bold");

		mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
		  .attr('x',margin2.left)
		  .attr('y',margin2.top)
		  .attr('width', w) // can't catch mouse events on a g element
		  .attr('height', h - margin2.top)
		  .attr('fill', 'none')
		  .attr('pointer-events', 'all')
		  .on('mouseout', function() { // on mouse out hide line, circles and text
			d3.select(".mouse-line-horizontal")
			  .style("opacity", "0");			
			d3.select(".mouse-line-vertical")
			  .style("opacity", "0");
			d3.selectAll(".mouse-per-line-landfill circle")
			  .style("opacity", "0");
			d3.selectAll(".mouse-per-line-landfill text")
			  .style("opacity", "0");
			d3.selectAll(".mouse-per-line-recycling circle")
			  .style("opacity", "0");
			d3.selectAll(".mouse-per-line-recycling text")
			  .style("opacity", "0");
			d3.selectAll(".mouse-per-line-energy circle")
			  .style("opacity", "0");
			d3.selectAll(".mouse-per-line-energy text")
			  .style("opacity", "0");
		  })
		  .on('mouseover', function() { // on mouse in show line, circles and text
			d3.select(".mouse-line-horizontal")
			  .style("opacity", "1");			
			d3.select(".mouse-line-vertical")
			  .style("opacity", "1");
			d3.selectAll(".mouse-per-line-landfill circle")
			  .style("opacity", "1");
			d3.selectAll(".mouse-per-line-landfill text")
			  .style("opacity", "1");
			d3.selectAll(".mouse-per-line-recycling circle")
			  .style("opacity", "1");
			d3.selectAll(".mouse-per-line-recycling text")
			  .style("opacity", "1");
			d3.selectAll(".mouse-per-line-energy circle")
			  .style("opacity", "1");
			d3.selectAll(".mouse-per-line-energy text")
			  .style("opacity", "1");
		  })
		  .on('mousemove', function() { // mouse moving over canvas
			var mouse = d3.mouse(this);
					  
			var x_array = [];
			
			years.forEach(function(year){
				x_array.push(Math.abs(xScale2(year) + margin2.left + 54 - mouse[0]));
			});
			
			var index = d3.scan(x_array,function(a,b){
				return a-b;
			});
			
			var closest_year = years[index];  
			
			console.log("The closest year is: " + closest_year);
			
			var closest_year = years[index];
			
			
						//set the path of the vertical line based on the current position
			d3.select(".mouse-line-vertical")
			  .attr("d", function() {
				var d = "M" + (xScale2(closest_year)+ margin2.left + 53) + "," + h ;
				d += " " + (xScale2(closest_year)+ margin2.left + 53) + "," + margin2.top;
				return d;
			  });
			
			
			var adjust_x = 0;
			//adjust_x is used to push text to the left when approaching the right margin of the graph
1			
			if(index>8){
				adjust_x = 120;
			}	
			
			d3.select(".mouse-per-line-landfill circle")
				.attr("cx", xScale2(closest_year)+ margin2.left + 53)
				.attr("cy", yScale2(tonnes_year_landfill[9-index].Tonnes) ) //9 - index because years goes from 2006 - 2018 but the object goes 2018 - 2006
				;
				
			d3.select(".mouse-per-line-landfill text")
				.attr("x", xScale2(closest_year)+ margin2.left + 53 - adjust_x)
				.attr("y", yScale2(tonnes_year_landfill[9-index].Tonnes) ) //9 - index because years goes from 2006 - 2018 but the object goes 2018 - 2006
				.text("Tonnes:" + tonnes_year_landfill[9-index].Tonnes )
			;
			
			d3.select(".mouse-per-line-recycling circle")
				.attr("cx", xScale2(closest_year)+ margin2.left + 53)
				.attr("cy", yScale2(tonnes_year_recycling[9-index].Tonnes) ) //9 - index because years goes from 2006 - 2018 but the object goes 2018 - 2006
				;
				
			d3.select(".mouse-per-line-recycling text")
				.attr("x", xScale2(closest_year)+ margin2.left + 53 - adjust_x)
				.attr("y", yScale2(tonnes_year_recycling[9-index].Tonnes) ) //9 - index because years goes from 2006 - 2018 but the object goes 2018 - 2006
				.text("Tonnes:" + tonnes_year_recycling[9-index].Tonnes )
			;
			d3.select(".mouse-per-line-energy circle")
				.attr("cx", xScale2(closest_year)+ margin2.left + 53)
				.attr("cy", yScale2(tonnes_year_energy[9-index].Tonnes) ) //9 - index because years goes from 2006 - 2018 but the object goes 2018 - 2006
				;
				
			d3.select(".mouse-per-line-energy text")
				.attr("x", xScale2(closest_year)+ margin2.left + 53 - adjust_x)
				.attr("y", yScale2(tonnes_year_energy[9-index].Tonnes) ) //9 - index because years goes from 2006 - 2018 but the object goes 2018 - 2006
				.text("Tonnes:" + tonnes_year_energy[9-index].Tonnes )
			;
			
			
		  });
		
}

function generate_graph3(dataset){
	
	const w = 1550;
	const h = 670;


	const margin3 = { left: 80, top: 20, right: 150, bottom: 45 } //Margin for the svg
	
	var svg3 = d3.select("#chart3")
			.attr("id","svg3")
			.append("svg")
			.attr("width", w + margin3.left + margin3.right)
			.attr("height",h + margin3.top + margin3.bottom)
	
	console.log("types");
	console.log(types);
	var types_specific = [];
	types.forEach(function(type){
		types_specific.push(type);
	});
	
	//Setting length to 7 removes the Undefined Plastic Types
	types_specific.length = 7;
	


	
	var xScale3_axis = d3.scaleBand()
					.domain(types_specific)
					.range([0, w - margin3.right])
					.paddingInner(0.30)
					.paddingOuter(0.20);
					
	var xScale3 = d3.scaleBand()
					.domain(d3.range(types_specific.length))
					.rangeRound([0,w - margin3.right]) //<-- enables rounding
					.paddingInner(0.30) 
					.paddingOuter(0.20); 
					



	var yScale3 = d3.scaleLinear()
					.range([h,0])
	
	//Create object based on the year and type of plastic
	var tonnes_by_year_type = d3.nest()
						.key(function(d) { return d.Year; })
						.key(function(d) { return d.Type; })
						.rollup(function(value) { return d3.sum(value, function(d) { return +d.Tonnes;} ) } )
						.entries(dataset);
						
	console.log("tonnes_by_year_type: ");
	console.log(tonnes_by_year_type);
	

	
	//this variable will store all the tonnes by year and by type for the yScale function
	var tonnes_by_year_type_range = [];
	
	tonnes_by_year_type.forEach(function(object){
		
		years.forEach(function(year){
			if(object.key == year){
				
				object.values.forEach(function(object_type){
					
					types_specific.forEach(function(type){
						if(object_type.key == type){
							tonnes_by_year_type_range.push(object_type.value);
						};
					});
					
				});
				
				
			};
		});
	});
	
	
	//Create yScale range based on the max value of all the plastic type Tonnes from each year.
	yScale3.domain([margin3.top,d3.max(tonnes_by_year_type_range, function(d){ return d;})*1.05]);  //Multiplied by 1.05 to extend the yaxis limit for aesthetic reasons

	
	//Create the xAxis based on the xScale		
	var xAxis3 = d3.axisBottom()
					.ticks(7)
					.scale(xScale3_axis);
			
	//Create the yScale based on the y scale 	
	var yAxis3 = d3.axisLeft()
					.ticks(6)
					.scale(yScale3)
					
	//Generate the xAxis
	svg3.append("g")
		.attr("class","xAxis")
		.attr("transform", "translate(" + margin3.left + ", "+ h + ")")
		.call(xAxis3)
		.style("font-size", "12px")
		.style("font-wieght","bold")
		;
	
	//Generate Label for X-Axis
	svg3.append("text")             
		  .attr("transform",
				"translate(" + (w/2) + " ," + 
							   (h + margin3.bottom) + ")")
		  .style("text-anchor", "middle")
		  .text("Plastic Type")
		  .style("font-size", "20px")
		  
		  ;
		  
	var plastic_description = ["HDPE Decomposes in Just Under 100 Years\nTypical HDPE items: bleach bottles and milk cartons",
							  "LDPE Decomposes in 500-1000 Years (if exposed to UV light, indefinite otherwise)\nTypical LDPE items: grocery bags",
							  "Other Plastics Deomposition Time is Indefinite",
							  "PET Decomposes in 5-10 years\nTypical PET items: water bottles and potatoe chip bags",
							  "PP Decomposition Time is a Millena\nTypical PP items: rope and clothing",
							  "PS Decomposes in 50 Years (less time with more exposure to sunlight\nTypical PS items: styrofoam cups and packing peanuts",
							  "PVC Decomposition Time is Indefinite (toxins released when degrades)\nTypical PVC items: childrens toys and pipes"];
							  
	
	
	//Generate Tooltip for x axis plastic type labels
	// Specifically the time it takes for the plastic to degrade 	
	svg3.select(".xAxis")
		.selectAll(".tick")
		.append("svg:title")
		.text(function(d, i) {
			return plastic_description[i]; 
		});
	
	//Generate the yAxis
	svg3.append("g")
		.attr("class", "yAxis")
		.attr("transform","translate(" + margin3.left + ","+ 0 +")")
		.call(yAxis3)
		.style("font-size", "15px")
		;
	
	//Generate Label for yAxis
	svg3.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y",0)
      .attr("x",(0-h/2) )
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Plastic (Tonnes)")
	  .style("font-size", "20px")
	  .style("font-wieght","bold")
	  ;



	//Colour Scale is based on decomposition time	
	var colour_scale3 = ["#fa9fb5","#f768a1","#7a0177","#feebe2","#c51b8a","#fcc5c0","#7a0177"];
	
	//Create a legend for the graph
	svg3.append('rect').attr('x', 1175).attr('y', 80).attr('width', 20).attr('height', 20).attr('stroke', 'black').attr('fill', '#feebe2');
	svg3.append('rect').attr('x', 1175).attr('y', 100).attr('width', 20).attr('height', 20).attr('stroke', 'black').attr('fill', '#fcc5c0');
	svg3.append('rect').attr('x', 1175).attr('y', 120).attr('width', 20).attr('height', 20).attr('stroke', 'black').attr('fill', '#fa9fb5');
	svg3.append('rect').attr('x', 1175).attr('y', 140).attr('width', 20).attr('height', 20).attr('stroke', 'black').attr('fill', '#f768a1');
	svg3.append('rect').attr('x', 1175).attr('y', 160).attr('width', 20).attr('height', 20).attr('stroke', 'black').attr('fill', '#c51b8a');
	svg3.append('rect').attr('x', 1175).attr('y', 180).attr('width', 20).attr('height', 20).attr('stroke', 'black').attr('fill', '#7a0177');
	svg3.append("text").attr("x", 1197).attr("y", 90).text("5-10 years").style("font-size", "15px").attr("alignment-baseline","middle");
	svg3.append("text").attr("x", 1197).attr("y", 110).text("50 years").style("font-size", "15px").attr("alignment-baseline","middle");
	svg3.append("text").attr("x", 1197).attr("y", 130).text("100 years").style("font-size", "15px").attr("alignment-baseline","middle");
	svg3.append("text").attr("x", 1197).attr("y", 150).text("500-1000 years").style("font-size", "15px").attr("alignment-baseline","middle");
	svg3.append("text").attr("x", 1197).attr("y", 170).text("1000 years").style("font-size", "15px").attr("alignment-baseline","middle");
	svg3.append("text").attr("x", 1197).attr("y", 190).text("indefinite").style("font-size", "15px").attr("alignment-baseline","middle");
	svg3.append("text").attr("x", 1175).attr("y", 55).text("Decomposition Time").style("font-size", "20px").attr("alignment-baseline","middle").style("font-weight",1000);
	svg3.append("rect").attr("x",1165).attr("y",65).attr("height", 140).attr("width", 210).style("fill", "none").style("stroke", "black");
	
	//Function that takes in the dataset and returns an object with the year and value 
	function get_type_tonnage_by_year(tonnes_by_year_type_object, type_tag){
		
		var object_key_year_value_tonnage = [];
		
		tonnes_by_year_type_object.forEach(function(object_key_is_year, index){
			
			years.forEach(function(year){
				if(object_key_is_year.key == year)
				{
					object_key_is_year.values.forEach(function(object_key_is_type){
						
						if(object_key_is_type.key == type_tag){
							
							object_key_year_value_tonnage[index] = {Year:year, Tonnes:object_key_is_type.value};
						};
					});
				};
				
			});
			
		});
		
		return object_key_year_value_tonnage;
	};
	
	function get_type_per_year(tonnes_by_year_type_object, year){
		
		var object_key_by_type = [];
		
		tonnes_by_year_type_object.forEach(function(object_key_is_year){
			if(object_key_is_year.key == year){
				object_key_is_year.values.forEach(function(object_key_is_type){
					
					types_specific.forEach(function(type_specific){
						
						if(object_key_is_type.key == type_specific){
							object_key_by_type.push(object_key_is_type);
						}
					});
					
					
				});
			}
		});
		
		return object_key_by_type;
	}
	
	var types_2018 = get_type_per_year(tonnes_by_year_type, "2018");
	var types_2017 = get_type_per_year(tonnes_by_year_type, "2017");
	var types_2016 = get_type_per_year(tonnes_by_year_type, "2016");
	var types_2015 = get_type_per_year(tonnes_by_year_type, "2015");
	var types_2014 = get_type_per_year(tonnes_by_year_type, "2014");
	var types_2013 = get_type_per_year(tonnes_by_year_type, "2013");
	var types_2010 = get_type_per_year(tonnes_by_year_type, "2010");
	var types_2009 = get_type_per_year(tonnes_by_year_type, "2009");
	var types_2008 = get_type_per_year(tonnes_by_year_type, "2008");
	var types_2006 = get_type_per_year(tonnes_by_year_type, "2006");
	
	//Store values in an object to be used for dropdown menu function
	var types_object = {};
	
	types_object['2018'] = types_2018;
	types_object['2017'] = types_2017;
	types_object['2016'] = types_2016;
	types_object['2015'] = types_2015;
	types_object['2014'] = types_2014;
	types_object['2013'] = types_2013;
	types_object['2010'] = types_2010;
	types_object['2009'] = types_2009;
	types_object['2008'] = types_2008;
	types_object['2006'] = types_2006;
										
			
	console.log("types_object");
	console.log(types_object);
	console.log(Object.values(types_object) );
	
			
	function draw_rectangles(data){
			
		svg3.selectAll(".bar3")
			.data(data)
			.enter()
			.append("rect")
			.attr("class","bar3")
			.attr('stroke', 'black')
			.attr("stroke-width","2px")
			.attr("x",function(d,i){
				return xScale3(i) + margin3.left;
			})
			.attr("y",function(d){
				return yScale3(d.value);
			})
			.attr("width", xScale3.bandwidth())
			.attr("height", function(d) {
				

				return h - yScale3(d.value);
			})
			.attr("fill",function(d,i){
				return colour_scale3[i];
			})

			.on("mouseover", function(d,i){
				
				var xPosition = parseFloat(d3.select(this).attr("x"));
				var yPosition = parseFloat(d3.select(this).attr("y"));
				
				
				svg3.append("text")
					.attr("id","waste_value")
					.attr("x",xPosition + xScale3.bandwidth()/2)
					.attr("font-family","sans-serif")
					.attr("font-size","20px")
					.attr("text-anchor", "middle")  //<!-- VERY IMPORTANT FOR ALLIGNMENT --!>
					.attr("y",yPosition - 2)   //take away 2 since increased the stroke width of the rectangle
					.attr("fill","blue")
					.text(d.value.toLocaleString('en'));

									
				d3.select(this)
					.attr("stroke","blue")
					//.attr("stroke-width","3px")
					.append("svg:title")
					.text(function(d,i){
						return plastic_description[i];
					})
					
				

				
				
			})
			.on("mouseout", function(){
				svg3.select("#waste_value").remove();
				d3.select(this).attr("stroke","black").attr("stroke-width","2px");
			})
			
			
		
			
		//create a heading for the graph	
		svg3.append("text")
        .attr("x", (w / 2))             
        .attr("y", 0 + (1.2*margin3.top))
		.attr("class","heading")
        .attr("text-anchor", "middle")  
        .style("font-size", "30px") 
        .style("text-decoration", "underline")  
        .style("font-weight", "bold")  
        .text("2018"); //Starting/Default graph is 2018 so have hardcoded it
	};

	//Draw Rectangle with 2018 data
	draw_rectangles(types_2018);


	
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	var duration = 2000;
	
	function transition_rectangles(data, year){
		
		
		
		svg3.selectAll(".bar3")
			.data(data)
			.transition()
			.duration(duration)
			.ease(d3.easeExpOut)
			.attr("x",function(d,i){
				
		
				return xScale3(i) + margin3.left;
			})
			.attr("y",function(d){
				return yScale3(d.value);
			})
			.attr("width", xScale3.bandwidth())
			.attr("height", function(d) {
				

				return h - yScale3(d.value);
			})
			.attr("fill",function(d,i){
				return colour_scale3[i];
			})
			
		//Change the heading to the year
		svg3.selectAll(".heading")
			.attr("x", (w / 2))             
			.attr("y", 0 + (1.2*margin3.top))
			.attr("text-anchor", "middle")  
			.style("font-size", "30px") 
			.style("text-decoration", "underline")  
			.style("font-weight", "bold")  
			.text(year);
				
		
		//Change the dropdown selection to the year input		
		
		$("#chart3_year" ).dropdown('set selected',year); 
	}
	

	

	//When the Run Animation button is clicked
	d3.select("#run_animation")
		.on("click", async function(){         //IMPORTANT - NEED TO MAKE FUNCTION ASYNC SO CAN USE await KEYWORD
			
			for(var i = 0; i<years.length;i++)
			{
				transition_rectangles(Object.values(types_object)[i], Object.keys(types_object)[i]);
			
				await sleep(duration);
			}
		
					
		});
		
		
	//Create Filter Dropdown Values
	set_dropdown_menu(years,"year");	
	
	//Function to initialize the dropdown menu with the year values	
	function set_dropdown_menu(object, id){
	
		var menu = {values:[]}
		
		object.forEach(function(item, index)
		{	
			
				menu.values.push(
				{
					name:item,
					value:item,
					text:item,
				})	

			
	});
		  
	
	//Set the menu
	$("#chart3_year")
	  .dropdown('setup menu',menu)
	;
	
	//Select 2018 as the default year
	$("#chart3_year")
	  .dropdown('set selected','2018')
	;
	


	
	}
	
	d3.select("#chart3_year")
		.on("click", function(){
			
			var year = $('#chart3_year').dropdown('get value');
			
			console.log(year);
			console.log(types_object[year]);
			
			transition_rectangles(types_object[year], year);
			
		});
	
}




//Appendix -- Iterations of the get_value function to solve the problem of getting the correct values when there are multiple filters
// A reminder of how much time/thought I had to put into this


// function get_value4(objects, level, sum){
		// console.log("******get_value4 called")
		// console.log("Level: " + level);
		// console.log("object passed in: " + object.key);
		// console.log(objects);
		
		// console.log("Call Objects FOR EACH function: ");
		
		// var local_sum = 0;
		
	// objects.forEach(function(object, index){
		// console.log(level + " - " + (index+1) + " - Current Object: " + object.key);
		// console.log(object);
		// console.log("Local Sum: " + local_sum);
		
		
		// if(filter_tags.includes(object.key)){
			// console.log("Match with filter tags - tag: " + object.key);
			
			// if(object.values){
				// console.log("Not at the Value level of the object");
				// console.log("Use recursion to pass the Values object back into this function");
				// console.log("CALL: get_value4(object.values, level+1: *"+ (level + 1) + "* , sum: *"+ sum + "* );");
				// var value = get_value4(object.values, level+1, sum);
				// console.log("Value returned from the get_value function: " + value);
				// console.log("Add value: " + value + " to current local_sum: + " + local_sum );
				// local_sum = local_sum + value; 
				// console.log("Local sum is now: " + local_sum);
				
				
				// console.log("Current Level: " + level +"Current Sum: " + sum + "for object.key: " + object.key);
			
				
			// }else{
				// console.log("AT the Value level of the object");
				// console.log("return value here");
				// console.log("Key: " + object.key + ", Value " +object.value);
				// console.log("Add object.value: *" + object.value + "* to current local_sum: *"+ local_sum + "* " ); 
				// local_sum = local_sum + object.value;
				// console.log("local_sum is now: *"+ local_sum + "* ");
				
			// };
		// }
		// else{
			// console.log("Does not match filter tags");
		// };
		
	// });
	
	// console.log("return local_sum: *" + local_sum + "*");
	// return local_sum;

// };

// function get_value3b(objects, value, sum){

	// console.log("******get_value3b called")
	// console.log(objects);
	// console.log("Value for this call:" + value);
	// console.log("Sum for this call: " + sum);
	// console.log("Add value to sum: ");
	// sum = sum + value;
	// console.log("Sum is now: " + sum);
	
	// if(!$.isEmptyObject(objects)){
	//if objects is empty will just return the value
	
		// objects.forEach(function(object){
		//cycle through each object within the passed in objects and check key 
			// console.log("Current object is: ");
			// console.log(object);
			
			// filter_tags.forEach(function(filter_tag){
			//filter tags is global variable that includes all tags for given filter variables set up
			
				// if(filter_tag == object.key){
				//if the filter tag matches the key try to send the objects.values into the function again 
				
					// console.log("Filter Tag: " + filter_tag + " Matched with object.key: " + object.key); 

						
					// if(object.values){
						// console.log("Before Calling get_value: Value = " + value);
						
						// console.log("if(object.values) -- value = get_value3b(object.values, value, sum);: ");
						
						// value = get_value3b(object.values, value, sum);
						
						// console.log("Value after get_value3b called is: " + value);
					// }
					// else if(object.value){
						// console.log("Else if  return value = get_value3b(object.values, value, sum);");
						// return value = value + get_value3b({}, object.value, sum);
						// console.log("Value is: " + value);
					// }


				// }
			// })
			
			// console.log("End current object loop:");
			// console.log(object);
			// console.log("Value is: " + value);
		// })
			
	// }
	// else{
		// console.log("Object was empty");

	// };		

	// console.log("return value:" + value);
	// return value;

// };

// function get_value3a(objects, value){

	// console.log("******get_value3a called")
	// console.log(objects);
	// console.log(value);
	// console.log(filter_variables.year);
	// console.log(filter_variables.fate);

		// try{
			// objects.forEach(function(object){
				// switch(object.key){
					
					// case filter_variables.year:
						// console.log("Year filter matched");
						// value = value + get_value3a(object.values, value);
						// break;
						
					// case filter_variables.fate:
						// console.log("Fate filter matched");
						// value = value + object.value;
						// console.log("Fate match value was: " + value);
						
						// break;

				// }
			// })
			
			
		// }
		// catch(err){
			// console.log("Error: " + err);
			// console.log("Value: " + value);
			
		// }
	

	// return value;

// };

// function get_value3(state_id, objects) {
		// var objects2 = {};
		// var objects3 = {};
		// var value = 0;
		// console.log("Filter Variables: ") 
		// console.log(filter_variables);
		// var filter_year = filter_variables.year;
		// var filter_fate = filter_variables.fate;
		// console.log("Filter_year: " + filter_year);
		// console.log("Filter_fate: " + filter_fate);
		// console.log(filter_year);
		// console.log(filter_fate);
		
		// objects.forEach(function(object){
			
			// if(object.key == state_id){
				// objects2 = object.values;
			// }
		// });
		// console.log("__Objects 2: ");
		// console.log(objects2);
		// console.log("Get Value Variables Year:" + filter_year);
		
		// objects2.forEach(function(object2){
			// console.log("Object 2: ");
			// console.log(object2);
			
			// if(object2.key == filter_year){
				// objects3 = object2.values;
			// }
			
		// });
		// console.log("__Objects 3: ")
		// console.log(objects3);
		
		// objects3.forEach(function(object3){
			// console.log("Object 3: ")
			// console.log(object3);
			// if(object3.key == filter_fate){
				// value = object3.value;
			// }
		// });
		// console.log("State: " + state_id + " Year: " + filter_year + " Fate: " + filter_fate + " is = " + value) ;
		// return value;
		
		
	// }



