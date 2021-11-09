	// check check box content
	function setCBDefaultValues(){
		document.getElementById("cb-FD-enabled").setAttribute('cb-text','VFD');
		if(airports_enabled)document.getElementById("airports-enabled").setAttribute('cb-text','RWY');
		document.getElementById("cb-filter-map").setAttribute('cb-text','MAP');
		if(openweathermap_wind_enabled)document.getElementById("owm-wind-checkbox").setAttribute('cb-text','WND');
		if(openweathermap_clouds_enabled)document.getElementById("owm-clouds-checkbox").setAttribute('cb-text','CLD');
		if(openweathermap_rain_enabled)document.getElementById("owm-rain-checkbox").setAttribute('cb-text','RAN');
	}
	var initCBtimer = setTimeout(setCBDefaultValues,1000);
	document.getElementById("ecam-display").value = "";
