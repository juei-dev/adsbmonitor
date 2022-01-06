	// ------ second page
	var rc_canvas = document.getElementById("receiver-circular-canvas");
	var rc_ctx = rc_canvas.getContext("2d");
	var ra_canvas = document.getElementById("receiver-altitude-canvas");
	var ra_ctx = ra_canvas.getContext("2d");
	var receiver_snr_min = -99, receiver_snr_max = 0;
	var receiver_noise_min = 0, receiver_noise_max = -99;
	const max_cs_distance = 450;
	const max_ca_altitude = 50000;

	var started_timestamp = new Date();

	var receiver_details_RSSI_shown = true;
	var receiver_details_main_shown = true;
	var receiver_details_supplementary_shown = true;

	if(!second_receiver_enabled){
		document.getElementById("receiver-details-supplementary-cb").checked = false;
		document.getElementById("receiver-details-supplementary-cb").enabled = false;
	}

	function receiverDetailsChange(){
		if(document.getElementById("receiver-details-cb").checked){
			document.getElementById("additional-page-right-id").style.display = "table-cell";
			receiver_details_shown = true;
			var left = window.innerWidth;
			//console.log(left);
			window.scrollTo(left,0);
			if(!second_receiver_enabled){
				receiver_details_supplementary_shown = false;
			}
		} else {
			document.getElementById("additional-page-right-id").style.display = "none";
			receiver_details_shown = false;			
		}
	}

	function initCircularStats(){
		// check the cookie - this solution is not ok - length of base64 str would be at minimum around 28k bytes and cookie is only allowing 4k  
		// var tmp_str = getCookie("circular_stats");
		// if(tmp_str) receiver_circular_stats = base64ToArray(tmp_str);

		// init canvas
		rc_ctx.clearRect(0,0,rc_canvas.width,rc_canvas.height);
		rc_ctx.beginPath();
		rc_ctx.fillStyle = "#AFAFFF";
		rc_ctx.strokeStyle = "white";
		rc_ctx.arc(150,150,140,0,2*Math.PI);
		rc_ctx.closePath();
		rc_ctx.stroke();
		rc_ctx.fillStyle = "#FFFFFF";
		rc_ctx.beginPath();
		rc_ctx.arc(150,150,5,0,2*Math.PI);
		rc_ctx.closePath();
		rc_ctx.fill();
		rc_ctx.beginPath();
		if(receiver_details_main_shown){
			rc_ctx.fillStyle = "#FFFFFF";
			rc_ctx.font = "normal 16px sans-serif"; // small-caps 
			rc_ctx.fillText(receiver_label,1,12);
			rc_ctx.fillStyle = "#5F5F9F";
			rc_ctx.arc(7,20,4,0,2*Math.PI);
		}
		rc_ctx.closePath();
		rc_ctx.fill();
		rc_ctx.beginPath();
		if(receiver_details_supplementary_shown && second_receiver_enabled){
			rc_ctx.fillStyle = "#FFFFFF";
			rc_ctx.font = "normal 16px sans-serif"; // small-caps 
			rc_ctx.fillText(second_receiver_label[0],288,12);
			rc_ctx.fillStyle = "#3F9F9F";
			rc_ctx.arc(293,20,4,0,2*Math.PI);
		}
		rc_ctx.closePath();
		rc_ctx.fill();
		var receiver_snr = 0; 
		if(receiver_noise<0) receiver_snr = receiver_noise - receiver_signal;
		if(receiver_snr < receiver_snr_max && receiver_snr != 0) receiver_snr_max = receiver_snr;
		if(receiver_snr > receiver_snr_min && receiver_snr != 0) receiver_snr_min = receiver_snr;
		if(receiver_noise > receiver_noise_max && receiver_noise != 0) receiver_noise_max = receiver_noise;
		if(receiver_noise < receiver_noise_min && receiver_noise != 0) receiver_noise_min = receiver_noise;

		// show session duration
		rc_ctx.beginPath();
		if(receiver_details_main_shown){
			rc_ctx.fillStyle = "#AFAFFF";
			rc_ctx.font = "normal 10px sans-serif"; // small-caps 
			rc_ctx.fillText("SNR", 1,299);
			rc_ctx.fillText(receiver_snr.toFixed(1) + " dBi",30,299);		 
			rc_ctx.font = "normal 8px sans-serif"; // small-caps 
			rc_ctx.fillText("min", 6,310);
			rc_ctx.fillText(receiver_snr_min.toFixed(1) + " dBi",30,310);		 
			rc_ctx.font = "normal 8px sans-serif"; // small-caps 
			rc_ctx.fillText("max", 6,320);
			rc_ctx.fillText(receiver_snr_max.toFixed(1) + " dBi",30,320);		 
			rc_ctx.font = "normal 10px sans-serif"; // small-caps 
			rc_ctx.fillText("Noise", 215,299);
			rc_ctx.fillText(receiver_noise.toFixed(1) + " dBi",250,299);		 
			rc_ctx.font = "normal 8px sans-serif"; // small-caps 
			rc_ctx.fillText("min", 220,310);
			rc_ctx.fillText(receiver_noise_min.toFixed(1) + " dBi",250,310);		 
			rc_ctx.font = "normal 8px sans-serif"; // small-caps 
			rc_ctx.fillText("max", 220,320);
			rc_ctx.fillText(receiver_noise_max.toFixed(1) + " dBi",250,320);		 
		}
		var current_timestamp = new Date();
		var timespan = 0; // milliseconds from session start
		timespan = current_timestamp - started_timestamp;
		var timespan_date = new Date(timespan);
		rc_ctx.fillStyle = "#CFCF0F";
		rc_ctx.font = "normal 8px sans-serif"; // small-caps
		var current_timestamp_text = current_timestamp.getFullYear() + "-" + (current_timestamp.getUTCMonth()+1).toFixed(0).padStart(2,"0") + "-" + current_timestamp.getUTCDate().toFixed(0).padStart(2,"0");
		current_timestamp_text += " " + current_timestamp.getUTCHours().toFixed(0).padStart(2,"0") + ":" + current_timestamp.getUTCMinutes().toFixed(0).padStart(2,"0") + "Z";
		var timestamp_center_x = 150-Math.floor(rc_ctx.measureText(current_timestamp_text).width/2);
		rc_ctx.fillText(current_timestamp_text,timestamp_center_x,308);		 
		rc_ctx.fillStyle = "#FFFF0F";
		rc_ctx.font = "normal 10px sans-serif"; // small-caps
		var timespan_text = "";
		if(timespan_date.getUTCMonth()>0)
			timespan_text += (timespan_date.getUTCMonth()).toFixed(0).padStart(2) + "m ";
		if(timespan_date.getUTCDate()>1)
			timespan_text += (timespan_date.getUTCDate()-1).toFixed(0).padStart(2) + "d " + timespan_date.getUTCHours().toFixed(0).padStart(2,"0") + ":" + timespan_date.getUTCMinutes().toFixed(0).padStart(2,"0") + ":" + timespan_date.getUTCSeconds().toFixed(0).padStart(2,"0");
		else
			timespan_text += timespan_date.getUTCHours().toFixed(0).padStart(2,"0") + ":" + timespan_date.getUTCMinutes().toFixed(0).padStart(2,"0") + ":" + timespan_date.getUTCSeconds().toFixed(0).padStart(2,"0");
		var timespan_center_x = 150-Math.floor(rc_ctx.measureText(timespan_text).width/2);
		rc_ctx.fillText(timespan_text,timespan_center_x,320);		 
		rc_ctx.closePath();
		rc_ctx.fill();

	}
	function initAltitudeStats(){
		ra_ctx.clearRect(0,0,ra_canvas.width,ra_canvas.height);
		ra_ctx.beginPath();
		ra_ctx.fillStyle = "#AFAFFF";
		ra_ctx.strokeStyle = "white";
		ra_ctx.moveTo(5,0);
		ra_ctx.lineTo(405,0);
		ra_ctx.lineTo(405,200);
		ra_ctx.lineTo(5,200);
		ra_ctx.lineTo(5,0);
		ra_ctx.closePath();
		ra_ctx.stroke();
		ra_ctx.beginPath();
		ra_ctx.arc(5,200,5,0,2*Math.PI);
		ra_ctx.closePath();
		ra_ctx.fill();
	}
	function refreshCircularAndAltitudeStats() {
		if(!receiver_details_shown){
			return;
		}
		initCircularStats();
		initAltitudeStats();
		var next_x = -1, next_y = -1;
		var next_alt_x = -1, next_alt_y = -1;

		var q1_max_dist = 0, q2_max_dist = 0, q3_max_dist = 0, q4_max_dist = 0;
		var q1_x = 150, q1_y = 150, q2_x = 150, q2_y = 150, q3_x = 150, q3_y = 150, q4_x = 150, q4_y = 150;

		// approximations
		rc_ctx.fillStyle = "#5F5F9F";
		rc_ctx.strokeStyle = "#9092FF";
		rc_ctx.font = "normal 8px sans-serif"; // small-caps 

		var alt_profile = [], max_dist = 0, max_dist_bearing = -1;
		for(c=0; c<400; c++)alt_profile.push(-1);

		// Secondary receiver only as a bit different color beneath the main receiver figure, if main receiver didn't reach as much distance and if it's enabled to be shown
		if(second_receiver_enabled){
			rc_ctx.beginPath();
			rc_ctx.moveTo(150, 150);
			rc_ctx.fillStyle = "#3F9F9F";
			rc_ctx.strokeStyle = "#40B2CF";
			if(receiver_details_supplementary_shown){
				//console.log(receiver_circular_stats);
				for(i=360; i<receiver_circular_stats.length; i++){
					if(receiver_circular_stats[i][0]==second_receiver_label){
						if(receiver_circular_stats[i][4]!=99){
							// update circular stats 
							var true_dist = receiver_circular_stats[i][3];
							var dist = (true_dist/max_cs_distance)*(140);
							if(dist>140)dist=140;
							var next_pos = getAngleEndpoint(150,150,dist,receiver_circular_stats[i][1]);
							next_x = next_pos[0]; next_y = next_pos[1];
							rc_ctx.lineTo(next_x, next_y);
						}
					}			
				}
			}
			rc_ctx.lineTo(150, 150);
			rc_ctx.closePath();
			rc_ctx.fill();
		}

		// MAIN RECEIVER figure
		next_x = -1, next_y = -1;
		rc_ctx.beginPath();
		rc_ctx.moveTo(150, 150);
		rc_ctx.fillStyle = "#5F5F9F";
		rc_ctx.strokeStyle = "#9092FF";
		if(receiver_details_supplementary_shown){
			rc_ctx.globalAlpha = 0.8;
		}
		if(receiver_details_main_shown)
		for(i=0; i<360; i++){ // 360 for main only
			// [receiver_label, angle (in int 0-359), min_distance, max_distance, max_distance_rssi, min_alt, max_alt]
			if(receiver_circular_stats[i][0]==receiver_label){
				if(receiver_circular_stats[i][4]!=99){
					// update circular stats 
					var true_dist = receiver_circular_stats[i][3];
					var dist = (true_dist/max_cs_distance)*(140);
					if(dist>140)dist=140;
					var next_pos = getAngleEndpoint(150,150,dist,receiver_circular_stats[i][1]);
					next_x = next_pos[0]; next_y = next_pos[1];
					rc_ctx.lineTo(next_x, next_y);
					// also mark the point if the angle is dividable by 18 and add rssi information (only if distance is more tha 100km)
					if(((receiver_circular_stats[i][1]%18)==0) && true_dist >= 100 && receiver_details_RSSI_shown){
						rc_ctx.fillStyle = "#FF5FFF";
						rc_ctx.arc(next_x,next_y,3,0,2*Math.PI);
						if(receiver_circular_stats[i][1]<=90){
							rc_ctx.fillText(receiver_circular_stats[i][4].toFixed(1)+" dBi",next_x+10,next_y-10);
						}
						else if(receiver_circular_stats[i][1]<=180){
							rc_ctx.fillText(receiver_circular_stats[i][4].toFixed(1)+" dBi",next_x+10,next_y+10);		 						
						}
						else if(receiver_circular_stats[i][1]<=270){
							rc_ctx.fillText(receiver_circular_stats[i][4].toFixed(1)+" dBi",next_x-10,next_y+10);		 						
						}
						else {
							rc_ctx.fillText(receiver_circular_stats[i][4].toFixed(1)+" dBi",next_x-10,next_y-10);		 						
						}
						rc_ctx.fillStyle = "#5F5F9F";
					}
					// record maximums per quadrant
					if(receiver_circular_stats[i][1]<=90){
						if(true_dist>q1_max_dist){
							q1_max_dist = true_dist;
							q1_x = next_x; q1_y = next_y;
						}
					}
					else if(receiver_circular_stats[i][1]<=180){
						if(true_dist>q2_max_dist){
							q2_max_dist = true_dist;
							q2_x = next_x; q2_y = next_y;
						}
					}
					else if(receiver_circular_stats[i][1]<=270){
						if(true_dist>q3_max_dist){
							q3_max_dist = true_dist;
							q3_x = next_x; q3_y = next_y;
						}
					}
					else {
						if(true_dist>q4_max_dist){
							q4_max_dist = true_dist;
							q4_x = next_x; q4_y = next_y;
						}
					}
					// update altitude stats per max distance
					if(receiver_circular_stats[i][5] > 50000)continue;
					if(true_dist>=400)continue;
					if( (alt_profile[Math.floor(true_dist)] > receiver_circular_stats[i][5]) || (alt_profile[Math.floor(true_dist)]==-1)  ){ 
						alt_profile[Math.floor(true_dist)] = receiver_circular_stats[i][5];
						if(max_dist < true_dist){
							max_dist=true_dist;
							max_dist_bearing = receiver_circular_stats[i][1];
						} 
					}
				}
			}
		}

		// finish distance circle main distance image
		rc_ctx.fillStyle = "#5F5F9F";
		rc_ctx.lineTo(150, 150);
		rc_ctx.closePath();
		rc_ctx.fill();
		if(receiver_details_supplementary_shown){
			rc_ctx.globalAlpha = 1;
		}

		// draw red max lines for quardrants in distance circle
		rc_ctx.beginPath();
		rc_ctx.fillStyle = "#FF0002";
		rc_ctx.strokeStyle = "#FF0002";
		rc_ctx.moveTo(150,150); rc_ctx.lineTo(q1_x,q1_y);	
		rc_ctx.moveTo(150,150); rc_ctx.lineTo(q2_x,q2_y);	
		rc_ctx.moveTo(150,150); rc_ctx.lineTo(q3_x,q3_y);	
		rc_ctx.moveTo(150,150); rc_ctx.lineTo(q4_x,q4_y);	
		rc_ctx.moveTo(150,150);
		rc_ctx.closePath();
		rc_ctx.stroke();

		// strict lines to distance circle for main receiver
		if(receiver_details_main_shown){
			rc_ctx.fillStyle = "#EF8FFF";
			rc_ctx.strokeStyle = "#9092FF";
			rc_ctx.beginPath();
			rc_ctx.moveTo(150, 150);
			for(i=0; i<360; i++){
				// [receiver_label, angle (in int 0-359), min_distance, max_distance, max_distance_rssi, min_alt, max_alt]
				if(receiver_circular_stats[i][0]==receiver_label){
					var dist = (receiver_circular_stats[i][3]/max_cs_distance)*(140);
					if(dist>140)dist=140;
					var next_pos = getAngleEndpoint(150,150,dist,receiver_circular_stats[i][1]);
					next_x = next_pos[0]; next_y = next_pos[1];
					rc_ctx.lineTo(next_x, next_y);
				}
			}
			rc_ctx.lineTo(150, 150);
			rc_ctx.closePath();
			rc_ctx.stroke();
			rc_ctx.fillStyle = "#FFFFFF";
			rc_ctx.strokeStyle = "white";
			rc_ctx.beginPath();
			rc_ctx.arc(150,150,5,0,2*Math.PI);
			rc_ctx.closePath();
			rc_ctx.fill();
			//console.log(receiver_circular_stats);
		}

		// draw altitude profile
		ra_ctx.fillStyle = "#5F9F9F";
		ra_ctx.strokeStyle = "#90F2FF";

		ra_ctx.beginPath();
		ra_ctx.moveTo(5,200);
		var max_x = 0, min_y = 300;
		for(i=0; i<400; i++){
			if(alt_profile[i]<0)continue;
			next_alt_y = 200-Math.floor(200*(alt_profile[i]/max_ca_altitude));
			if(next_alt_y < 5)next_alt_y = 5; // cut over max display altitudes off
			next_alt_x = 5+i;
			ra_ctx.lineTo(next_alt_x, next_alt_y);
			if(max_x<next_alt_x){ 
				max_x=next_alt_x;
				min_y=next_alt_y;
			}
		}

		if(receiver_details_main_shown){
			// finish altitude profile
			ra_ctx.lineTo(next_alt_x, 200);
			ra_ctx.closePath();
			ra_ctx.fill();

			// from receiver to max distance altitude red line, bearing and altitude of max distance and angle to max distance altitude
			ra_ctx.strokeStyle = "#FF0002";
			ra_ctx.beginPath();
			ra_ctx.moveTo(5,200);
			ra_ctx.lineTo(max_x, min_y);
			ra_ctx.closePath();
			ra_ctx.stroke();
			ra_ctx.fillStyle = "#E0E052";
			ra_ctx.font = "normal 8px sans-serif"; // small-caps 
			ra_ctx.beginPath();
			ra_ctx.fillText("B:" + max_dist_bearing + "° ", max_x-20, min_y-6);		 
			if(max_dist>=100)
				ra_ctx.fillText(max_dist.toFixed(0), max_x-10, 220);		 
			else
				ra_ctx.fillText(max_dist.toFixed(0), max_x-5, 220);		 
			ra_ctx.fillStyle = "#F00002";
			var angle_md = Math.abs(Math.floor(Math.atan2((min_y-200),(max_x-5))*180/Math.PI));
			ra_ctx.fillText(angle_md + "° ", 35, 198);		 		
			ra_ctx.closePath();
			ra_ctx.fill();
		}


		// cross-hairs / measurement lines for circular stats
		rc_ctx.fillStyle = "#FFFFFF";
		rc_ctx.strokeStyle = "#505052";
		rc_ctx.beginPath();
		rc_ctx.moveTo(10, 150);
		rc_ctx.lineTo(290, 150);
		rc_ctx.moveTo(150, 10);
		rc_ctx.lineTo(150, 290);
		rc_ctx.moveTo(10, 150);
		rc_ctx.closePath();
		rc_ctx.stroke();
		rc_ctx.beginPath();
		rc_ctx.strokeStyle = "#505072";
		rc_ctx.arc(150,150,(100/max_cs_distance)*140,0,2*Math.PI);
		rc_ctx.font = "normal 8px sans-serif"; // small-caps 
		rc_ctx.fillText("100",140,123);		 
		rc_ctx.arc(150,150,(200/max_cs_distance)*140,0,2*Math.PI);
		rc_ctx.fillText("200",140,92);		 
		rc_ctx.arc(150,150,(300/max_cs_distance)*140,0,2*Math.PI);
		rc_ctx.fillText("300",140,60);		 
		rc_ctx.arc(150,150,(400/max_cs_distance)*140,0,2*Math.PI);
		rc_ctx.fillText("400",140,30);		 
		rc_ctx.closePath();
		rc_ctx.stroke();
		rc_ctx.beginPath();
		rc_ctx.font = "normal 10px sans-serif"; // small-caps 
		rc_ctx.fillStyle = "#40F042";
		rc_ctx.fillText("0",147,13);		 
		rc_ctx.fillText("180",140,295);		 
		rc_ctx.fillText("90",283,152);		 
		rc_ctx.fillText("270",3,152);		 
		rc_ctx.closePath();

		// cross-hairs / measurement lines for altitude stats
		ra_ctx.strokeStyle = "#505052";
		ra_ctx.beginPath();
		ra_ctx.moveTo(5, (10000/max_ca_altitude)*200);
		ra_ctx.lineTo(405, (10000/max_ca_altitude)*200);
		ra_ctx.moveTo(5, (20000/max_ca_altitude)*200);
		ra_ctx.lineTo(405, (20000/max_ca_altitude)*200);
		ra_ctx.moveTo(5, (30000/max_ca_altitude)*200);
		ra_ctx.lineTo(405, (30000/max_ca_altitude)*200);
		ra_ctx.moveTo(5, (40000/max_ca_altitude)*200);
		ra_ctx.lineTo(405, (40000/max_ca_altitude)*200);
		ra_ctx.closePath();
		ra_ctx.stroke();
		ra_ctx.beginPath();
		ra_ctx.font = "normal 10px sans-serif"; // small-caps 
		ra_ctx.fillStyle = "#F0F0F2";
		ra_ctx.fillText("0",5,210);		 
		ra_ctx.fillText("100",95,210);		 
		ra_ctx.fillText("200",195,210);		 
		ra_ctx.fillText("250",245,210);		 
		ra_ctx.fillText("300",295,210);		 
		ra_ctx.fillText("350",345,210);		 
		ra_ctx.fillText("400",390,210);		 
		ra_ctx.fillStyle = "#40F042";
		ra_ctx.fillText("FL100",5,200-(10000/max_ca_altitude)*200);		 
		ra_ctx.fillText("FL200",5,200-(20000/max_ca_altitude)*200);		 
		ra_ctx.fillText("FL300",5,200-(30000/max_ca_altitude)*200);		 
		ra_ctx.fillText("FL400",5,200-(40000/max_ca_altitude)*200);		 
		ra_ctx.closePath();

		// finally set the current array to cookie to preserve the stats for about the next 6 months --> not going to work, too big for cookie
		// setCookie("circular_stats", arrayToBase64(receiver_circular_stats), (6*30));

	}
	var refreshCircularAndAltitudeStatsInterval = setInterval(refreshCircularAndAltitudeStats, stats_refresh_rate);
	initCircularStats();
	initAltitudeStats();
	if(document.getElementById("receiver-details-cb").checked){
		document.getElementById("additional-page-right-id").style.display = "table-cell";
		receiver_details_shown=true; 
	} else receiver_details_shown=false;

	function downloadReceiverChart(){
		var dataUrl = rc_canvas.toDataURL("image/jpeg", 1.0);
		document.getElementById("download-chart-url").setAttribute("download", "circular_chart.jpg");
		document.getElementById("download-chart-url").setAttribute("href", dataUrl.replace("image/jpeg","image/octet-stream"));
		document.getElementById("download-chart-url").click();
	}
	function downloadReceiverChartPNG(){
		var dataUrl = rc_canvas.toDataURL("image/png", 1.0);
		document.getElementById("download-chart-url").setAttribute("download", "circular_chart.png");
		document.getElementById("download-chart-url").setAttribute("href", dataUrl.replace("image/png","image/octet-stream"));
		document.getElementById("download-chart-url").click();
	}

	document.getElementById("receiver-details-RSSI-cb").checked = true;
	function receiverDetailsRSSIChange(){
		if( !document.getElementById("receiver-details-RSSI-cb").checked ) receiver_details_RSSI_shown = false; else receiver_details_RSSI_shown = true;
		refreshCircularAndAltitudeStats();
	}

	function receiverDetailsMainChange(){
		if( !document.getElementById("receiver-details-main-cb").checked ) receiver_details_main_shown = false; else receiver_details_main_shown = true;
		refreshCircularAndAltitudeStats();
	}	
	function receiverDetailsSuppChange(){
		if(second_receiver_enabled){
			if( !document.getElementById("receiver-details-supplementary-cb").checked ) receiver_details_supplementary_shown = false; else receiver_details_supplementary_shown = true;
			refreshCircularAndAltitudeStats();
		} else document.getElementById("receiver-details-supplementary-cb").checked = false;
	}		

	var receiver_coverage_points = [];
	var second_receiver_coverage_points = [];
	var layerGroupCoverage = L.layerGroup().addTo(mymap);

	function drawCircularStatsToMap(){
		if(!receiver_coverage_shown)return;

		var main_circular_stats = [];
		for(i=0; i<360; i++){ if(receiver_circular_stats[i][0]==receiver_label) if(receiver_circular_stats[i][4]!=99) main_circular_stats.push(receiver_circular_stats[i]) };

		main_circular_stats.sort(function (a,b){return (a[1] - b[1])}); // sort by degree

		var second_circular_stats = [];
		for(i=360; i<receiver_circular_stats.length; i++){ if(receiver_circular_stats[i][0]==second_receiver_label) if(receiver_circular_stats[i][4]!=99) second_circular_stats.push(receiver_circular_stats[i]) };
		second_circular_stats.sort(function (a,b){return (a[1] - b[1])}); // sort by degree
	
		for(c=0; c<receiver_coverage_points.length; c++) receiver_coverage_points.pop(); // clear polygon first
		//receiver_coverage_points.push([receiver_lat, receiver_lon]);
		var first_lat = 0, first_lon = 0;
		var last_lat = 0, last_lon = 0;
		//var tmp_point_count = 0;
		layerGroupCoverage.clearLayers();
		receiver_coverage_points.push([receiver_lat, receiver_lon]);					
		for(i=0; i<main_circular_stats.length; i++){ // main only
			// [receiver_label, angle (in int 0-359), min_distance, max_distance, max_distance_rssi, min_alt, max_alt, max_lat, max_lon]
			if(main_circular_stats[i][0]==receiver_label){
				if(main_circular_stats[i][7]!=0 && main_circular_stats[i][8]!=0){
					// next point for coverage polygon
					var next_lat = main_circular_stats[i][7];
					var next_lon = main_circular_stats[i][8];
					if(next_lat && next_lon){ 
						receiver_coverage_points.push([next_lat,next_lon]);
						receiver_coverage_points.push([receiver_lat, receiver_lon]);					
					}
					if(first_lat==0 && first_lon==0){ first_lat = next_lat; first_lon = next_lon; }
					if(last_lat != 0 && last_lon != 0){
						var coverageLine = L.polyline([ [last_lat,last_lon],[next_lat,next_lon] ], { color: "#3F9F9F", weight: 1, opacity: 0.5, smoothfactor: 1 }).addTo(layerGroupCoverage);					
						//coverageLine.bindTooltip("#:" + tmp_point_count++, { permanent: true, direction: 'center', offset: [0,0] });
					}
					last_lat = next_lat; last_lon = next_lon;
				} else {
					//receiver_coverage_points.push([receiver_lat, receiver_lon]);					
				}
			}
		}
		if(first_lat!=0 && first_lon!=0) var coverageLine = L.polyline([ [last_lat,last_lon],[first_lat,first_lon] ], { color: "#3F9F9F", weight: 1, opacity: 0.5, smoothfactor: 1 }).addTo(layerGroupCoverage);					
		//coverageLine.bindTooltip("#:" + tmp_point_count++, { permanent: true, direction: 'center', offset: [0,0] });
		//receiver_coverage_points.push([receiver_lat, receiver_lon]);
		if(first_lat!=0 && first_lon!=0)receiver_coverage_points.push([first_lat, first_lon]);

		if(second_receiver_enabled){
			for(c=0; c<second_receiver_coverage_points.length; c++) second_receiver_coverage_points.pop(); // clear polygon first
			first_lat = 0; first_lon = 0;
			last_lat = 0, last_lon = 0;
			//second_receiver_coverage_points.push([second_receiver_lat, second_receiver_lon]);
			for(i=0; i<second_circular_stats.length; i++){
				if(second_circular_stats[i][0]==second_receiver_label){
					if(second_circular_stats[i][7]!=0 && second_circular_stats[i][8]!=0){
						// next point for coverage polygon
						var next_lat = second_circular_stats[i][7];
						var next_lon = second_circular_stats[i][8];
						// calcNextPoint(receiver_lat, receiver_lon, brng, dist); // returns in global var: nextpoint_lat, nextpoint_lon
						if(next_lat && next_lon){ 
							second_receiver_coverage_points.push([next_lat,next_lon]);
							second_receiver_coverage_points.push([second_receiver_lat, second_receiver_lon]);
						}					
						if(first_lat==0 && first_lon==0){ first_lat = next_lat; first_lon = next_lon; }
						if(last_lat != 0 && last_lon != 0)
							var coverageLineSecond = L.polyline([ [last_lat,last_lon],[next_lat,next_lon] ], { color: "#5F5F9F", weight: 1, opacity: 0.5, smoothfactor: 1 }).addTo(layerGroupCoverage);					
						last_lat = next_lat; last_lon = next_lon;
					} else {
						//second_receiver_coverage_points.push([second_receiver_lat, second_receiver_lon]);					
					}
				}
			}
			if(first_lat!=0 && first_lon!=0) var coverageLineSecond = L.polyline([ [last_lat,last_lon],[first_lat,first_lon] ], { color: "#5F5F9F", weight: 2, opacity: 0.7, smoothfactor: 1 }).addTo(layerGroupCoverage);					
			//second_receiver_coverage_points.push([second_receiver_lat, second_receiver_lon]);
			if(first_lat!=0 && first_lon!=0)receiver_coverage_points.push([first_lat, first_lon]);
			// Draw seconday coverage
			var coveragePolygonOptionsSecond = { color: "#3F9F9F", weight: 0.5, opacity: 0.5, smoothfactor: 1 }; // { color: 'red', weight: 1, opacity: 0.5, smoothfactor: 1 }
			var coveragePolygonSecond = L.polygon(second_receiver_coverage_points, coveragePolygonOptionsSecond).addTo(layerGroupCoverage);
		}
		// Draw main coverage (over secodary)
		var coveragePolygonOptions = { color: "#5F5F9F", weight: 0.5, opacity: 0.5, smoothfactor: 1 }; // { color: 'red', weight: 1, opacity: 0.5, smoothfactor: 1 }
		var coveragePolygon = L.polygon(receiver_coverage_points, coveragePolygonOptions).addTo(layerGroupCoverage);
	}

	var refreshCoverageInterval = setInterval(drawCircularStatsToMap, stats_refresh_rate*2); // refrech twice long as stats update (6s) 

