//	import "https://api.tiles.mapbox.com/mapbox.js/plugins/geo-viewport/v0.2.1/geo-viewport.js";

	var set_lat = receiver_lat, set_lon = receiver_lon, set_zoom = 6;

	var mapbox_map_id = "mapbox/dark-v8";
	var mapbox_map_id_sat = "mapbox/satellite-v9";
	var mapbox_map_id_street = "mapbox/satellite-streets-v11";
	var mapbox_map_id_nav = "mapbox/navigation-night-v1";
	var mapbox_map_id_blank = "blank";
	var current_mapbox_map_id = mapbox_map_id;

	const click_min_distance = 10; // 10 km radius for "missed" click to select aircraft 

	var show_radius_circle = false; // show radius circles

	// get map position and zoom from the cookies, if those are set
	if(getCookie("set_lat")){
		set_lat = getCookie("set_lat");
		set_lon = getCookie("set_lon");
		set_zoom = getCookie("set_zoom");
	}

	var mymap = L.map('mapid').setView([set_lat, set_lon], set_zoom);
	var tileLayer_normal = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			maxZoom: 18,
			id: mapbox_map_id, /* mapbox/streets-v11 mapbox/dark-v8 */
			tileSize: 512,
			zoomOffset: -1,
			accessToken: mapbox_accessToken
	}).addTo(mymap);

	var tileLayer_satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			maxZoom: 18,
			id: mapbox_map_id_sat,
			tileSize: 512,
			zoomOffset: -1,
			accessToken: mapbox_accessToken
	});

	var tileLayer_street = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			maxZoom: 18,
			id: mapbox_map_id_street,
			tileSize: 512,
			zoomOffset: -1,
			accessToken: mapbox_accessToken
	});

	var tileLayer_nav = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			maxZoom: 18,
			id: mapbox_map_id_nav,
			tileSize: 512,
			zoomOffset: -1,
			accessToken: mapbox_accessToken
	});

	var tileLayer_blank = L.tileLayer('', {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			maxZoom: 18,
			id: mapbox_map_id_blank,
			tileSize: 512,
			zoomOffset: -1,
			accessToken: mapbox_accessToken
	});


	mymap.on('zoomend', function() {
		filters_map_center = mymap.getCenter();
		filters_map_distance = Math.floor(filters_map_center.distanceTo(L.latLng(filters_map_center.lat, mymap.getBounds().getEast()))/1000);  
		document.getElementById("cb-filter-map-distance").innerHTML = filters_map_distance;
		document.getElementById("cb-filter-map-distance-miles").innerHTML = Math.floor(filters_map_distance * 0.539957); // nautical miles
		setCookie("set_lat",filters_map_center.lat);
		setCookie("set_lon",filters_map_center.lng);
		setCookie("set_zoom",mymap.getZoom());
	});
	mymap.on('moveend', function() {
		filters_map_center = mymap.getCenter();
		setCookie("set_lat",filters_map_center.lat);
		setCookie("set_lon",filters_map_center.lng);
		setCookie("set_zoom",mymap.getZoom());
		// update preview / view setting box
		showSmallMap();		
	});
	mymap.on('click', function(e) { 
		// Handle "missed" clicks to select aircraft
		var clicked_pos = e.latlng;
		var closest_ac_distance = 999999, closest_ac_icao = "", closest_ac_flight = ""; 
		for(i=0; i<aircrafts_positions.length; i++){
			var dist = getDistanceFromLatLonInKm(clicked_pos.lat,clicked_pos.lng,aircrafts_positions[i][1],aircrafts_positions[i][2],"km");
			if(dist<closest_ac_distance){
				closest_ac_distance = dist;
				closest_ac_icao = aircrafts_positions[i][3];
				closest_ac_flight = aircrafts_positions[i][0];
			}
		}
		if(closest_ac_distance<=click_min_distance){
			if(!selected_clicked){
				if(selected_icao == closest_ac_icao){
					selected_icao = ""; selected_flight = "";
				} else {
					selectAircraft(closest_ac_icao, closest_ac_flight);
				}
			} else
			// remove the click selection - that was to prevent deselection after marker on click handled
			selected_clicked = false;
		}
	});
	mymap.addControl(new L.Control.Fullscreen());
	mymap.zoomSnap = 0.25;
	mymap.zoomDelta = 0.5;
	mymap.wheelPxPerZoomLevel = 240;
	//mymap.preferCanvas = true;

	function smallMapEvent(){
		showSmallMap();
	}
	mymap.whenReady(smallMapEvent);

	function showSmallMap(){
		var map_center = mymap.getCenter();
		//console.log(map_center);
		var preview_size = [50,50];
		var next_image_name = "-";
		if(current_mapbox_map_id == mapbox_map_id){
			document.getElementById('map-preview').src = "https://api.mapbox.com/styles/v1/" + mapbox_map_id_sat + "/static/" + map_center.lng + "," + map_center.lat + ",1,0,0/" + preview_size.join("x") + "?attribution=false&logo=false&access_token=" + mapbox_accessToken;
			next_image_name = "satellite";
		}
		else if(current_mapbox_map_id == mapbox_map_id_sat){
			document.getElementById('map-preview').src = "https://api.mapbox.com/styles/v1/" + mapbox_map_id_street + "/static/" + map_center.lng + "," + map_center.lat + ",1,0,0/" + preview_size.join("x") + "?attribution=false&logo=false&access_token=" + mapbox_accessToken;
			next_image_name = "satellite with streets";
		}
		else if(current_mapbox_map_id == mapbox_map_id_street){
			document.getElementById('map-preview').src = "https://api.mapbox.com/styles/v1/" + mapbox_map_id_nav + "/static/" + map_center.lng + "," + map_center.lat + ",1,0,0/" + preview_size.join("x") + "?attribution=false&logo=false&access_token=" + mapbox_accessToken;
			next_image_name = "dark navigation";
		}
		else if(current_mapbox_map_id == mapbox_map_id_nav){
			document.getElementById('map-preview').src = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAyADIDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+H+v0g/PwoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgD/9k=";
			next_image_name = "completely blank";
		}
		else if(current_mapbox_map_id == mapbox_map_id_blank){
			document.getElementById('map-preview').src = "https://api.mapbox.com/styles/v1/" + mapbox_map_id + "/static/" + map_center.lng + "," + map_center.lat + ",1,0,0/" + preview_size.join("x") + "?attribution=false&logo=false&access_token=" + mapbox_accessToken;
			next_image_name = "normal dark";
		} 
		document.getElementById('map-preview').onclick = changeMapStyle;
		document.getElementById('map-preview').title = "Click to change the map style to " + next_image_name;
	}

	var circleLayerGroup = L.layerGroup().addTo(mymap);

	function changeMapStyle(){
		if(current_mapbox_map_id == mapbox_map_id){
			mymap.addLayer(tileLayer_satellite);
			mymap.removeLayer(tileLayer_normal);
			current_mapbox_map_id = mapbox_map_id_sat;
		} else if (current_mapbox_map_id == mapbox_map_id_sat){
			mymap.addLayer(tileLayer_street);
			mymap.removeLayer(tileLayer_satellite);
			current_mapbox_map_id = mapbox_map_id_street;
		} else if (current_mapbox_map_id == mapbox_map_id_street){
			mymap.addLayer(tileLayer_nav);
			mymap.removeLayer(tileLayer_street);
			current_mapbox_map_id = mapbox_map_id_nav;
		} else if (current_mapbox_map_id == mapbox_map_id_nav){
			mymap.removeLayer(tileLayer_nav);
			current_mapbox_map_id = mapbox_map_id_blank;
			// add radius circles for blank map - deprecated on Jan 1st 2022 - added a separate button for that to map for all maps
			// showRadiusCircles(); 
		} else if (current_mapbox_map_id == mapbox_map_id_blank){
			// if(!show_radius_circle) circleLayerGroup.clearLayers();
			mymap.addLayer(tileLayer_normal);
			current_mapbox_map_id = mapbox_map_id;
		}
		setCookie("selectedMapLayer",current_mapbox_map_id,365);
		showSmallMap();
	}

	function showRadiusCircles(){
		var radius_circle_100km = L.circle([receiver_lat, receiver_lon], 100000, {
				color: '#30315F',
				weight: 1,
				fillColor: '#005',
				fillOpacity: 0.1,
				radius: 100000
		}).addTo(circleLayerGroup);
		var radius_circle_200km = L.circle([receiver_lat, receiver_lon], 200000, {
				color: '#30315F',
				weight: 1,
				fillColor: '#004',
				fillOpacity: 0.1,
				radius: 200000
		}).addTo(circleLayerGroup);
		var radius_circle_300km = L.circle([receiver_lat, receiver_lon], 300000, {
				color: '#30315F',
				weight: 1,
				fillColor: '#003',
				fillOpacity: 0.1,
				radius: 300000
		}).addTo(circleLayerGroup);
		var radius_circle_400km = L.circle([receiver_lat, receiver_lon], 400000, {
				color: '#30315F',
				weight: 1,
				fillColor: '#002',
				fillOpacity: 0.1,
				radius: 400000
		}).addTo(circleLayerGroup);
		if(airports_enabled) {
			if(document.getElementById("airports-enabled")) {
				if(document.getElementById("airports-enabled").checked){ layerGroupRunways.clearLayers(); findNearestRunways(); }
			} else { // layerGroupRunways.clearLayers(); findNearestRunways(); 
			}
		}
	}

	// get previous selection from a cookie
	function initMap(){
		if(getCookie("selectedMapLayer")){
			mymap.removeLayer(tileLayer_normal);
			current_mapbox_map_id = getCookie("selectedMapLayer");
			if(current_mapbox_map_id == mapbox_map_id){
				mymap.addLayer(tileLayer_normal);
			} else if (current_mapbox_map_id == mapbox_map_id_sat){
				mymap.addLayer(tileLayer_satellite);
			} else if (current_mapbox_map_id == mapbox_map_id_street){
				mymap.addLayer(tileLayer_street);
			} else if (current_mapbox_map_id == mapbox_map_id_nav){
				mymap.addLayer(tileLayer_nav);
			} else if (current_mapbox_map_id == mapbox_map_id_blank){
				showRadiusCircles(); // Show radius circles (in 100 km steps to 400km)
			} else {
				mymap.addLayer(tileLayer_normal);
				current_mapbox_map_id = mapbox_map_id;
			}
		} else {
			mymap.addLayer(tileLayer_normal);
			current_mapbox_map_id = mapbox_map_id;
		}
		showSmallMap();
	}
	initMap();

	function goToMapPoint(lat, lon, zoom){
		mymap.flyTo([lat,lon],zoom);
		window.scrollTo(0,0);
	}

	function resetMapPosition(){
		mymap.flyTo([receiver_lat, receiver_lon], 6);
		setCookie("set_lat",receiver_lat);
		setCookie("set_lon",receiver_lon);
		setCookie("set_zoom",6);
	}

	function refreshMap(){
		// In order to refresh OWM layers, the whole map should be refreshed. This, of course, will generate more calls to both OSM and OWM.
		// Also, it might cause sort of a flickering (due to redraw). So this should not be called too often. Once in 15 minutes or so?
		mymap._onResize();
		//console.log("Map refreshed");
	}
	var mapRefreshTimer = setInterval(refreshMap, map_complete_refresh_rate);

	/* Mark main receiver location */
	var circle = L.circle([receiver_lat, receiver_lon], {
			color: 'blue',
			fillColor: '#00f',
			fillOpacity: 0.5,
			radius: 2000
	}).addTo(mymap);

	/* Mark supplementary receiver location, if enabled */
	if( second_receiver_enabled ){
		var second_circle = L.circle([second_receiver_lat, second_receiver_lon], {
			color: 'red',
			fillColor: '#f00',
			fillOpacity: 0.2,
			radius: 2002
		}).addTo(mymap);
	}


	// Custom buttons to map
	//var button_background_color = "202023";
	//var button_background_color_hover = "404043";
	//var button_background_color_enabled = "202043";
	var mapButton_TraceAll = L.Control.extend({
		options: {
			position: "bottomright"
		},

		onAdd: function (map){
			var cont = L.DomUtil.create("input");
			cont.type = "checkbox";
			cont.className = "map-btn-trace-all";
			cont.title = "Leave trace after all aircarfts";
			cont.value = "TRC";
			//cont.style.backgroundColor = button_background_color;
			cont.style.width = "30px";
			cont.style.height = "30px";

			cont.onmouseover = function(){
				// if(cont.style.backgroundColor!=button_background_color_enabled) cont.style.backgroundColor = button_background_color_hover;
			} 
			cont.onmouseout = function(){
				// if(cont.style.backgroundColor!=button_background_color_enabled) cont.style.backgroundColor = button_background_color;
			}
			cont.onclick = function(){
				if(!ac_trace_all){
					ac_trace_all = true;
					//cont.style.backgroundColor = button_background_color_enabled;
				} else {
					ac_trace_all = false;	
					//cont.style.backgroundColor = button_background_color_hover;
				} 
			}

			return cont;
		}
	});
	mymap.addControl(new mapButton_TraceAll());

	var mapButton_TraceSelected = L.Control.extend({
		options: {
			position: "bottomright"
		},

		onAdd: function (map){
			var cont = L.DomUtil.create("input");
			cont.type = "checkbox";
			cont.className = "map-btn-trace-selected";
			cont.style.fillOpacity = 0.5;
			cont.title = "Leave trace after selected aircarft";
			cont.value = "TRCS";
			//cont.style.backgroundColor = button_background_color;
			cont.style.width = "30px";
			cont.style.height = "30px";
			cont.checked = true;

			cont.onmouseover = function(){
				// if(cont.style.backgroundColor!=button_background_color_enabled) cont.style.backgroundColor = button_background_color_hover;
			} 
			cont.onmouseout = function(){
				// if(cont.style.backgroundColor!=button_background_color_enabled) cont.style.backgroundColor = button_background_color;
			}
			cont.onclick = function(){
				if(cont.checked){
					ac_trace_selected = true;
					//cont.style.backgroundColor = button_background_color_enabled;
				} else {
					ac_trace_selected = false;	
					//cont.style.backgroundColor = button_background_color_hover;
				} 
			}

			return cont;
		}
	});
	mymap.addControl(new mapButton_TraceSelected());

	var mapButton_SelectExtraInfo = L.Control.extend({
		options: {
			position: "bottomright"
		},

		onAdd: function (map){
			var cont = L.DomUtil.create("input");
			cont.type = "checkbox";
			cont.className = "map-btn-select-extra-info";
			cont.title = "Fetch extra information when selecting an aircraft";
			cont.value = "INFO";
			//cont.style.backgroundColor = button_background_color;
			cont.style.width = "30px";
			cont.style.height = "30px";
			cont.checked = true;

			cont.onmouseover = function(){
				// if(cont.style.backgroundColor!=button_background_color_enabled) cont.style.backgroundColor = button_background_color_hover;
			} 
			cont.onmouseout = function(){
				// if(cont.style.backgroundColor!=button_background_color_enabled) cont.style.backgroundColor = button_background_color;
			}
			cont.onclick = function(){
				if(cont.checked){
					selected_ac_extra_info = true;
					//cont.style.backgroundColor = button_background_color_enabled;
				} else {
					selected_ac_extra_info = false;	
					//cont.style.backgroundColor = button_background_color_hover;
				} 
			}

			return cont;
		}
	});
	mymap.addControl(new mapButton_SelectExtraInfo());

	var mapButton_ShowRadiusCircle = L.Control.extend({
		options: {
			position: "bottomleft"
		},

		onAdd: function (map){
			var cont = L.DomUtil.create("input");
			cont.type = "checkbox";
			cont.className = "map-btn-show-radius-circle";
			cont.title = "Show radius circles from main receiver (each circle per 100km)";
			cont.value = "RADS";
			//cont.style.backgroundColor = button_background_color;
			cont.style.width = "30px";
			cont.style.height = "30px";

			cont.onmouseover = function(){
				// if(cont.style.backgroundColor!=button_background_color_enabled) cont.style.backgroundColor = button_background_color_hover;
			} 
			cont.onmouseout = function(){
				// if(cont.style.backgroundColor!=button_background_color_enabled) cont.style.backgroundColor = button_background_color;
			}
			cont.onclick = function(){
				if(cont.checked){
					showRadiusCircles();
					show_radius_circle = true;
					//cont.style.backgroundColor = button_background_color_enabled;
				} else {
					circleLayerGroup.clearLayers();
					show_radius_circle = false;
					//cont.style.backgroundColor = button_background_color_hover;
				} 
			}

			return cont;
		}
	});
	mymap.addControl(new mapButton_ShowRadiusCircle());

