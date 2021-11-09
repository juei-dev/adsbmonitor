	// Open weather layers to the map
	if(openweathermap_wind_enabled){
		var layer_wind = L.tileLayer("https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=" + openweathermap_apikey);
		//layer_wind.addTo(mymap);
		document.getElementById("filter-checkboxes").innerHTML += "<label class='form-control'><input type='checkbox' id='owm-wind-checkbox' onclick='owmChange()'> Winds</label>";
	} else { 
		document.getElementById("ecam-display").value += "  WX WIND INOP"; 
		document.getElementById("filter-checkboxes").innerHTML += "<label class='form-control'><input type='checkbox' id='owm-wind-checkbox' disabled> Winds</label>";
		document.getElementById("owm-wind-checkbox").setAttribute('cb-text','');
	}
	if(openweathermap_clouds_enabled){
		var layer_clouds = L.tileLayer("https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=" + openweathermap_apikey);
		//layer_clouds.addTo(mymap);
		document.getElementById("filter-checkboxes").innerHTML += "<label class='form-control'><input type='checkbox' id='owm-clouds-checkbox' onclick='owmChange()'> Clouds</label>";
	} else { 
		document.getElementById("ecam-display").value += "  WX CLOUDS INOP"; 
		document.getElementById("filter-checkboxes").innerHTML += "<label class='form-control'><input type='checkbox' id='owm-clouds-checkbox' disabled> Clouds</label>";
		document.getElementById("owm-clouds-checkbox").setAttribute('cb-text','');
	}
	if(openweathermap_rain_enabled){
		var layer_rain = L.tileLayer("https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=" + openweathermap_apikey);
		//layer_rain.addTo(mymap);
		document.getElementById("filter-checkboxes").innerHTML += "<label class='form-control'><input type='checkbox' id='owm-rain-checkbox' onclick='owmChange()'> Rain</label>";		
	} else { 
		document.getElementById("ecam-display").value += "  WX RAIN INOP"; 
		document.getElementById("filter-checkboxes").innerHTML += "<label class='form-control'><input type='checkbox' id='owm-rain-checkbox' disabled> Rain</label>";		
		document.getElementById("owm-rain-checkbox").setAttribute('cb-text','');
	}
	if(openweathermap_rain_enabled || openweathermap_clouds_enabled || openweathermap_wind_enabled){
			document.getElementById("filter-checkboxes").innerHTML += "<label class='form-control'><input type='range' min='1' max='100' value='100' step='1' id='owm-opacity-slider' class='owm-opacity' onclick='owmOpacityChange()'></label>";
			owmOpacityChange(); 
	} else {
			document.getElementById("filter-checkboxes").innerHTML += "<label class='form-control'><input type='range' min='1' max='100' value='100' step='1' id='owm-opacity-slider' class='owm-opacity' disabled></label>";		
	}
	if(layer_wind){
		layer_wind.on('tileerror', function() {
			document.getElementById("ecam-display").value += "  WX WIND FAIL"; 			
		});
		layer_wind.on('load', function() {
			document.getElementById("ecam-display").value.replace("  WX WIND FAIL",""); 
		});
	}
	if(layer_clouds){
		layer_clouds.on('tileerror', function() {
			document.getElementById("ecam-display").value += "  WX CLOUDS FAIL"; 			
		});
		layer_clouds.on('load', function() {
			document.getElementById("ecam-display").value.replace("  WX CLOUDS FAIL",""); 
		});
	}
	if(layer_rain){
		layer_rain.on('tileerror', function() {
			document.getElementById("ecam-display").value += "  WX RAIN FAIL"; 			
		});
		layer_rain.on('load', function() {
			document.getElementById("ecam-display").value.replace("  WX RAIN FAIL",""); 
		});
	}
	function owmChange(){
		if(!document.getElementById("owm-wind-checkbox").checked){
			layer_wind.removeFrom(mymap); 
		} else { 
			layer_wind.addTo(mymap);
		} 
		if(!document.getElementById("owm-clouds-checkbox").checked){
			layer_clouds.removeFrom(mymap); 
		} else { 
			layer_clouds.addTo(mymap);
		} 
		if(!document.getElementById("owm-rain-checkbox").checked){
			layer_rain.removeFrom(mymap); 
		} else { 
			layer_rain.addTo(mymap);
		} 
	}
	var owm_selected_opacity = 1;
	function owmOpacityChange(){
		owm_selected_opacity = (document.getElementById("owm-opacity-slider").value / 100);
		if(openweathermap_wind_enabled)layer_wind.setOpacity(owm_selected_opacity);
		if(openweathermap_rain_enabled)layer_rain.setOpacity(owm_selected_opacity);
		if(openweathermap_clouds_enabled)layer_clouds.setOpacity(owm_selected_opacity);
	}
