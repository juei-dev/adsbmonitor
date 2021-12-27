	// Alti-bar
	const canvas = document.querySelector("#alti-bar");
	function drawAltiBox(){
		if(canvas.getContext){
			const ctx = canvas.getContext("2d");
			// draw altimeter box
			var line_color = "#D4D008";
			ctx.clearRect(0,0,canvas.width,canvas.height);
			drawLine(ctx,[55,0],[55,500],line_color,1);
			drawLine(ctx,[55,500],[70,500],line_color,1);
			drawLine(ctx,[70,500],[70,0],line_color,1);
			drawLine(ctx,[70,0],[55,0],line_color,1);
			ctx.fillStyle = "#303072";
			ctx.fillRect(56,474,13,24);
			ctx.font = "small-caps normal 9px sans-serif";
			ctx.fillStyle = "#E0E062";
			ctx.fillText("3000",0,474);
			ctx.fillText("FL100",0,405);
			ctx.fillText("FL200",0,304);
			ctx.fillText("FL300",0,204);
			ctx.fillText("FL400",0,104);
		}
	}

	const map_canvas = document.querySelector("#map-alti-bar");
	function refreshMapAltiBox(){
		if(mymap.isFullscreen()){	// duplicate alitbar to map display only if in full screen
			document.getElementById("map-alti-bar").style.display = "initial";
			const map_ctx = map_canvas.getContext("2d");
			map_ctx.clearRect(0,0,canvas.width,canvas.height);
			map_ctx.drawImage(canvas, 0, 0);
		} else {
			document.getElementById("map-alti-bar").style.display = "none";
		}
	}

	var refreshMapAltiBoxInterval = setInterval(refreshMapAltiBox, aircraft_refresh_rate);	

