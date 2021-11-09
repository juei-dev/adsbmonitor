	// Alti-bar
	const canvas = document.querySelector("#alti-bar");
	function drawAltiBox(){
		if(canvas.getContext){
			const ctx = canvas.getContext("2d");
			// draw altimeter box
			ctx.clearRect(0,0,canvas.width,canvas.height);
			drawLine(ctx,[55,0],[55,500],'yellow',1);
			drawLine(ctx,[55,500],[70,500],'yellow',1);
			drawLine(ctx,[70,500],[70,0],'yellow',1);
			drawLine(ctx,[70,0],[55,0],'yellow',1);
			ctx.fillStyle = "#303072";
			ctx.font = "small-caps normal 9px sans-serif";
			ctx.fillRect(56,474,13,24);
			ctx.strokeText("3000",0,474);
			ctx.strokeText("FL100",0,405);
			ctx.strokeText("FL200",0,304);
			ctx.strokeText("FL300",0,204);
			ctx.strokeText("FL400",0,104);
		}
	}
