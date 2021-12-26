	// Fligth director
	var FDtimer;
	var FD_enabled = true;
	var FD_flight = "", FD_effective_flight = "";
	var FD_locked_flight = "";
	var FD_altitude=-1, FD_rate=0, FD_track=-1, FD_tas=-1, FD_gs=-1, FD_mach =-1;
	var FD_roll = 0, FD_yaw = 0, FD_nav_altitude = 0, FD_nav_heading = 0, FD_nav_qnh = 0;

	function switchFD(){
		if(FD_enabled) FD_enabled = false; else FD_enabled = true;
	}

	function showFD(flight){
		if(!document.getElementById("cb-FD-enabled").checked){
			return;
		}
		if(!FD_locked_flight)FD_flight = flight;		
		if(FD_flight=="")return;
		document.getElementById("fd").style.display = "block";
		document.getElementById("fd-canvas").style.display = "inline-block";
		drawFD();
		FDtimer = setInterval(drawFD, 1000);
	}

	const fd_canvas = document.querySelector("#fd-canvas");
	fd_canvas.addEventListener("click", onclickFD, false);

	function drawFD(){
		//if(FD_flight=="" && FD_locked_flight=="")return;
		// draw template
		const fd_ctx = fd_canvas.getContext("2d");
		// -- erase canvas
		fd_ctx.clearRect(0,0,fd_canvas.width,fd_canvas.height);
		// -- draw flight callsign
		fd_ctx.strokeStyle = "blue";
		fd_ctx.font = "small-caps normal 10px sans-serif";
        fd_ctx.strokeText(FD_effective_flight,1,10);

		// -- close button
		if( FD_locked_flight ){
			fd_ctx.strokeStyle = "lightgray";
			fd_ctx.rect(440,5,10,10);
			fd_ctx.stroke();
			fd_ctx.strokeStyle = "white";
			fd_ctx.beginPath();
			fd_ctx.moveTo(441,6); fd_ctx.lineTo(449,14);
			fd_ctx.moveTo(449,6); fd_ctx.lineTo(441,14);
			fd_ctx.closePath();
			fd_ctx.stroke();
		}

		// -- draw FD artificial horizon
		fd_ctx.fillStyle = "#AFAFFF";
		fd_ctx.strokeStyle = "white";
		fd_ctx.beginPath();
		fd_ctx.moveTo(60,80);
		fd_ctx.quadraticCurveTo(60,40,100,40);
		fd_ctx.lineTo(300,40);
		fd_ctx.quadraticCurveTo(340,40,340,80);
		fd_ctx.lineTo(340,320);
		fd_ctx.quadraticCurveTo(340,360,300,360);
		fd_ctx.lineTo(100,360);
		fd_ctx.quadraticCurveTo(60,360,60,320);
		fd_ctx.lineTo(60,80);
		fd_ctx.closePath();
		fd_ctx.fill();

		// -- roll & pitch
		fd_ctx.fillStyle = "#D2691E";
		fd_ctx.strokeStyle = "#A52A2A";
		fd_ctx.beginPath();
		// define x1 and x2, calc x2 and y2
		const center_x1 = 60, center_y1 = 210, center_len = (340-60);
		//var calc_x2 = center_x1 + Math.cos(Math.PI * FD_roll / 180) * center_len;
		var calc_y2 = center_y1 + Math.sin(Math.PI * FD_roll / 180) * center_len; 
		//var actual_x1 = center_x1 + ((calc_x2-center_x1)/2);
		var actual_y1 = center_y1 + ((calc_y2-center_y1)/2);
		var actual_y2 = center_y1 - ((calc_y2-center_y1)/2);

		// pitch factors to y
		// angle = rate by distance in feet / minute 
		var pitch_angle_rad = 0, pitch_angle_deg = 0, pitch_factor_y = 0;
		var distance_in_feet = -FD_gs * 101.269; // feet per minute = knots * 101.269
		if(FD_rate != "0")pitch_angle_rad = Math.atan(FD_rate/distance_in_feet);
		/*
		if(pitch_angle_rad > 0)pitch_angle_deg = 90-pitch_angle_rad * (180 / Math.PI);
		if(pitch_angle_rad < 0)pitch_angle_deg = pitch_angle_rad * (180 / Math.PI)-90;
		*/
		pitch_angle_deg = pitch_angle_rad * (180 / Math.PI);
		//console.log("pitch angle (deg): " + (-pitch_angle_deg));
		pitch_factor_y = pitch_angle_rad*20;

		fd_ctx.moveTo(center_x1,(actual_y1+pitch_factor_y));
		fd_ctx.lineTo(center_x1+center_len,(actual_y2+pitch_factor_y));

		fd_ctx.lineTo(340,320);
		fd_ctx.quadraticCurveTo(340,360,300,360);
		fd_ctx.lineTo(100,360);
		fd_ctx.quadraticCurveTo(60,360,60,320);
		fd_ctx.lineTo(60,actual_y1);

		fd_ctx.closePath();
		fd_ctx.fill();

		drawLine(fd_ctx,[center_x1,(actual_y1+pitch_factor_y)],[center_x1+center_len,(actual_y2+pitch_factor_y)],"white",1);

		// -- "crosshairs"
		fd_ctx.fillStyle = "#000000";
		fd_ctx.strokeStyle = "white";
		fd_ctx.strokeRect(center_x1+20,center_y1-5,((center_len/2)-60),10);
		fd_ctx.strokeRect((center_x1+(center_len/2)+40),center_y1-5,((center_len/2)-60),10);
		fd_ctx.strokeRect((center_x1+(center_len/2)+40),center_y1-5,10,30);
		fd_ctx.strokeRect(center_x1+20+((center_len/2)-70),center_y1-5,10,30);
		fd_ctx.fillRect(center_x1+20,center_y1-5,((center_len/2)-60),10);
		fd_ctx.fillRect((center_x1+(center_len/2)+40),center_y1-5,((center_len/2)-60),10);
		fd_ctx.fillRect((center_x1+(center_len/2)+40),center_y1-5,10,30);
		fd_ctx.fillRect(center_x1+20+((center_len/2)-70),center_y1-5,10,30);

		// -- speed indicator
		fd_ctx.fillStyle = "#303032";
		fd_ctx.fillRect(2,40,35,320);
		fd_ctx.strokeStyle = "white";
		fd_ctx.fillStyle = "white";
		fd_ctx.font = "small-caps normal 10px sans-serif";
		// scale
		for(sdown=-40; sdown<=40; sdown++){
			if((FD_tas-sdown)<0)continue;
			if(((FD_tas-sdown)%10)==0){
				fd_ctx.beginPath();
				fd_ctx.moveTo(35,center_y1+sdown*3);
				fd_ctx.lineTo(32,center_y1+sdown*3);
				fd_ctx.closePath();
				fd_ctx.stroke();
				if((sdown%2)==0) fd_ctx.fillText(FD_tas-sdown, 10,center_y1+(sdown*3)+4);
			}
		}
		fd_ctx.strokeStyle = "white";
		fd_ctx.fillStyle = "#000000";
		fd_ctx.fillRect(3,195,32,20);		
		fd_ctx.strokeRect(3,195,32,20);		
		fd_ctx.font = "small-caps normal 14px sans-serif";
		fd_ctx.strokeStyle = "white";
		fd_ctx.fillStyle = "white";
		if(FD_tas > 0)fd_ctx.fillText(FD_tas,5,210);
		//fd.ctx.rect(3,180,32,200);
		//fd.ctx.stroke();
		fd_ctx.font = "small-caps normal 12px sans-serif";

		// -- ground speed
		if(FD_gs > 0)fd_ctx.fillText("GS " + Math.floor(FD_gs),5,380);

		// -- altimeter
		fd_ctx.fillStyle = "#303032";
		fd_ctx.fillRect(360,40,45,320);
		fd_ctx.strokeStyle = "white";
		fd_ctx.fillStyle = "white";
		fd_ctx.font = "small-caps normal 10px sans-serif";
		// scale
		for(sdown=-150; sdown<=140; sdown++){
			if((Math.floor(FD_altitude/10)+sdown)<0)continue;
			if(((Math.floor(FD_altitude/10)+sdown)%20)==0){
				fd_ctx.beginPath();
				fd_ctx.moveTo(361,center_y1+sdown);
				fd_ctx.lineTo(365,center_y1+sdown);
				fd_ctx.closePath();
				fd_ctx.stroke();
			}
			if(((FD_altitude-sdown)%100)==0) fd_ctx.fillText(FD_altitude-sdown, 367,center_y1+sdown+4);
		}
		fd_ctx.strokeStyle = "white";
		fd_ctx.fillStyle = "#000000";
		fd_ctx.fillRect(355,195,55,20);		
		fd_ctx.strokeRect(355,195,55,20);		
		fd_ctx.strokeStyle = "white";
		fd_ctx.fillStyle = "white";
		fd_ctx.font = "small-caps normal 14px sans-serif";
		if(FD_altitude > 0)fd_ctx.fillText(FD_altitude,362,210);

		// -- climb / descent rate
		fd_ctx.fillStyle = "#303032";
		fd_ctx.beginPath();
		fd_ctx.moveTo(410,120);
		fd_ctx.lineTo(440,120);
		fd_ctx.quadraticCurveTo(455,120,455,140);
		fd_ctx.lineTo(455,280);
		fd_ctx.quadraticCurveTo(455,290,440,290);
		fd_ctx.lineTo(410,290);
		fd_ctx.closePath();
		fd_ctx.fill();  
		//drawLine(fd_ctx,[210,455],[210,455+(FD_rate/100)],"white",3);   
		fd_ctx.strokeStyle = "white";
		fd_ctx.lineWidth = 2;
		fd_ctx.beginPath();
		fd_ctx.moveTo(455,210);
		fd_ctx.lineTo(415,210-((FD_rate/100)*1.1)); 
		fd_ctx.closePath();
		fd_ctx.stroke();
		fd_ctx.lineWidth = 1;
		fd_ctx.strokeStyle = "white";
		fd_ctx.font = "small-caps normal 9px sans-serif";
		if(FD_rate > 0)fd_ctx.strokeText("+" + FD_rate,412,340); else fd_ctx.strokeText(FD_rate,412,340);

		// -- heading
		fd_ctx.fillStyle = "#303032";
		fd_ctx.font = "small-caps normal 16px sans-serif";
		fd_ctx.beginPath();
		fd_ctx.moveTo(60,400);
		fd_ctx.quadraticCurveTo(200,335,340,400);
		fd_ctx.closePath();
		fd_ctx.fill();

		fd_ctx.strokeStyle = "white";
		fd_ctx.fillStyle = "white";
		if(FD_track >= 0 )fd_ctx.fillText(FD_track,190,390);

		// -- mach
		fd_ctx.strokeStyle = "green";
		fd_ctx.font = "small-caps normal 14px sans-serif";
		if(FD_mach > 0.5)fd_ctx.strokeText(FD_mach,5,395);

		// -- autopilot enabled
		fd_ctx.strokeStyle = "lightgreen";
		fd_ctx.fillStyle = "lightgreen";
		fd_ctx.font = "small-caps normal 18px sans-serif";
		if(FD_nav_heading!=-1 && FD_nav_altitude >0)fd_ctx.fillText("A/P",190,30);

		// -- autopilot altitude
		fd_ctx.strokeStyle = "magenta";
		fd_ctx.fillStyle = "magenta";
		fd_ctx.font = "small-caps normal 16px sans-serif";
		if(FD_nav_altitude > 0)fd_ctx.fillText(FD_nav_altitude,362,30);

		// -- autopilot QNH
		fd_ctx.strokeStyle = "cyan";
		fd_ctx.font = "small-caps normal 10px sans-serif";
		if(FD_nav_qnh > 0)fd_ctx.strokeText("QNH " + FD_nav_qnh,362,380);

		// -- autopilot heading 
		/*
		fd_ctx.strokeStyle = "cyan";
		fd_ctx.font = "small-caps normal 14px sans-serif";
		if(FD_nav_heading > 0)fd_ctx.strokeText(FD_nav_heading,190,368);
		*/
		/*
		drawLine(fd_ctx,[55,0],[55,50],'yellow',1);
		fd_ctx.fillRect(56,474,13,24);
		*/
		return;
	}

	function hideFD(){
		if(FD_locked_flight)return;
		clearInterval(FDtimer);
		document.getElementById("fd").style.display = "none";
		document.getElementById("fd-canvas").style.display = "none";
	}

	function clickOpenFD(flight){
		// first of all, select that flight or deselect if already selected
		var clicked_icao = "";
		for(f=0; f<all_icao_flights.length; f++){
			if(all_icao_flights[f][1] == flight){ clicked_icao = all_icao_flights[f][0]; break; }
		}
		if(!selected_icao){
			selected_icao = clicked_icao;
			selected_flight = flight;
		} else if(selected_icao != clicked_icao) {
			selected_icao = clicked_icao;
			selected_flight = flight;
		} else if(selected_icao == clicked_icao) {
			selected_icao = "";
			selected_flight = "";			
		}
		updateSelectedACInfo(true);

		// handle the VFD		
		if(!document.getElementById("cb-FD-enabled").checked){
			// in case FD is disabled, focus to flight clicked
			for(i=0; i<aircrafts_positions.length; i++){
				if(aircrafts_positions[i][0]==flight){ 
					// mymap.flyTo([aircrafts_positions[i][1],aircrafts_positions[i][2]],8);
					goToMapPoint(aircrafts_positions[i][1],aircrafts_positions[i][2],8);
					break;
				}
			}
		} else {
			// if FD is enabled, remove selection
			selected_icao = ""; selected_flight = "";					
		}
		// if enabled, lock the FD to the selected flight when clicked
		if(FD_locked_flight){ FD_flight = flight; FD_locked_flight = ""; hideFD(); return; }
		FD_locked_flight = flight;
		showFD();
	}

	function clickCloseFD(){
		FD_locked_flight = "";
		hideFD();
	}

	function onclickFD(e){
		var clickX, clickY;
		if(e.pageX || e.pageY){ clickX=e.pageX; clickY=e.pageY } else {
			clickX = e.clientX + document.body.scrollLeft + ddocument.documentElement.scrollLeft;
			clickY = e.clientY + document.body.scrollTop + ddocument.documentElement.scrollTop;
		}
		clickX -= fd_canvas.offsetLeft + 110; // had to calibrate manually..
		clickY -= fd_canvas.offsetTop + 105;
 		// close button click?
		if( clickX >= 438 && clickX <= 454 && clickY >= 0 && clickY <=20 )clickCloseFD();
		//console.log("Mouse click: " + clickX + "," + clickY);
	}
