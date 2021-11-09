	// ------ second page
	var rc_canvas = document.getElementById("receiver-circular-canvas");
	var rc_ctx = rc_canvas.getContext("2d");
	var ra_canvas = document.getElementById("receiver-altitude-canvas");
	var ra_ctx = ra_canvas.getContext("2d");
	var receiver_snr_min = -99, receiver_snr_max = 0;
	const max_cs_distance = 450;
	const max_ca_altitude = 50000;

	function receiverDetailsChange(){
		if(document.getElementById("receiver-details-cb").checked){
			document.getElementById("additional-page-right-id").style.display = "table-cell";
			receiver_details_shown = true;
			var left = window.innerWidth;
			//console.log(left);
			window.scrollTo(left,0);
		} else {
			document.getElementById("additional-page-right-id").style.display = "none";
			receiver_details_shown = false;			
		}
	}

	function getAngleEndpoint(x,y,r,angle){  // in degrees
		angle = angle - 90;
		var rad_angle = (angle*Math.PI)/180;
		return [Math.floor(x+Math.cos(rad_angle)*r),Math.floor(y+Math.sin(rad_angle)*r)];
	}
	function initCircularStats(){
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
		rc_ctx.fillStyle = "#FFFFFF";
		rc_ctx.font = "normal 16px sans-serif"; // small-caps 
		rc_ctx.fillText(receiver_label,1,10);
		var receiver_snr = 0; 
		if(receiver_noise<0) receiver_snr = receiver_noise - receiver_signal;
		if(receiver_snr < receiver_snr_max && receiver_snr != 0) receiver_snr_max = receiver_snr;
		if(receiver_snr > receiver_snr_min && receiver_snr != 0) receiver_snr_min = receiver_snr;
		rc_ctx.fillStyle = "#AFAFFF";
		rc_ctx.font = "normal 10px sans-serif"; // small-caps 
		rc_ctx.fillText("SNR " + receiver_snr.toFixed(1) + " dBi",1,280);		 
		rc_ctx.font = "normal 8px sans-serif"; // small-caps 
		rc_ctx.fillText("min " + receiver_snr_min.toFixed(1) + " dBi",1,290);		 
		rc_ctx.font = "normal 8px sans-serif"; // small-caps 
		rc_ctx.fillText("max " + receiver_snr_max.toFixed(1) + " dBi",1,300);		 
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

		// approximations
		rc_ctx.fillStyle = "#5F5F9F";
		rc_ctx.strokeStyle = "#9092FF";
		ra_ctx.fillStyle = "#5F9F9F";
		ra_ctx.strokeStyle = "#90F2FF";

		rc_ctx.beginPath();
		rc_ctx.moveTo(150, 150);
		ra_ctx.beginPath();
		ra_ctx.moveTo(5,200);

		var alt_profile = [];
		for(c=0; c<400; c++)alt_profile.push(-1);
		for(i=0; i<360; i++){
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
					// console.log(receiver_circular_stats[i][1] + " dist: " + dist + " - " + next_x + "," + next_y);

					// update altitude stats per max distance
					if(receiver_circular_stats[i][6] > 50000)continue;
					if(true_dist>=400)continue;
					if( (alt_profile[Math.floor(true_dist)] > receiver_circular_stats[i][6]) || (alt_profile[Math.floor(true_dist)]==-1)  ) 
						alt_profile[Math.floor(true_dist)] = receiver_circular_stats[i][6];
				}
			}
		}
		//console.log(alt_profile);
		for(i=0; i<400; i++){
			if(alt_profile[i]<0)continue;
			next_alt_y = 200-Math.floor(200*(alt_profile[i]/max_ca_altitude));
			if(next_alt_y < 5)next_alt_y = 5; // cut over max display altitudes off
			next_alt_x = 5+i;
			ra_ctx.lineTo(next_alt_x, next_alt_y);
		}
		rc_ctx.lineTo(150, 150);
		rc_ctx.closePath();
		rc_ctx.fill();

		ra_ctx.lineTo(next_alt_x, 200);
		ra_ctx.closePath();
		ra_ctx.fill();

		// strict
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

		// cross-hairs / measurement lines for circular stats
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

	}
	var refreshCircularAndAltitudeStatsInterval = setInterval(refreshCircularAndAltitudeStats, stats_refresh_rate);
	initCircularStats();
	initAltitudeStats();
