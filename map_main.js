//	import "https://api.tiles.mapbox.com/mapbox.js/plugins/geo-viewport/v0.2.1/geo-viewport.js";

	var set_lat = receiver_lat, set_lon = receiver_lon, set_zoom = 6;

	var mapbox_map_id = "mapbox/dark-v8";
	var mapbox_map_id_sat = "mapbox/satellite-v9";
	var mapbox_map_id_street = "mapbox/satellite-streets-v11";
	var mapbox_map_id_nav = "mapbox/navigation-night-v1";
	var current_mapbox_map_id = mapbox_map_id;

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
	mymap.addControl(new L.Control.Fullscreen());

	function smallMapEvent(){
		showSmallMap();
	}
	mymap.whenReady(smallMapEvent);

	function showSmallMap(){
		var map_center = mymap.getCenter();
		//console.log(map_center);
		var preview_size = [50,50];
		if(current_mapbox_map_id == mapbox_map_id)
			document.getElementById('map-preview').src = "https://api.mapbox.com/styles/v1/" + mapbox_map_id_sat + "/static/" + map_center.lng + "," + map_center.lat + ",1,0,0/" + preview_size.join("x") + "?attribution=false&logo=false&access_token=" + mapbox_accessToken;
		else if(current_mapbox_map_id == mapbox_map_id_sat)
			document.getElementById('map-preview').src = "https://api.mapbox.com/styles/v1/" + mapbox_map_id_street + "/static/" + map_center.lng + "," + map_center.lat + ",1,0,0/" + preview_size.join("x") + "?attribution=false&logo=false&access_token=" + mapbox_accessToken;
		else if(current_mapbox_map_id == mapbox_map_id_street)
			document.getElementById('map-preview').src = "https://api.mapbox.com/styles/v1/" + mapbox_map_id_nav + "/static/" + map_center.lng + "," + map_center.lat + ",1,0,0/" + preview_size.join("x") + "?attribution=false&logo=false&access_token=" + mapbox_accessToken;
		else if(current_mapbox_map_id == mapbox_map_id_nav)
			document.getElementById('map-preview').src = "https://api.mapbox.com/styles/v1/" + mapbox_map_id + "/static/" + map_center.lng + "," + map_center.lat + ",1,0,0/" + preview_size.join("x") + "?attribution=false&logo=false&access_token=" + mapbox_accessToken;
		document.getElementById('map-preview').onclick = changeMapStyle;
		document.getElementById('map-preview').title = "Click to change the map style";
	}

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
			mymap.addLayer(tileLayer_normal);
			mymap.removeLayer(tileLayer_nav);
			current_mapbox_map_id = mapbox_map_id;
		}
		setCookie("selectedMapLayer",current_mapbox_map_id,365);
		showSmallMap();
	}

	// get previous selection from a cookie
	function initMap(){
		if(getCookie("selectedMapLayer")){
			current_mapbox_map_id = getCookie("selectedMapLayer");
			if(current_mapbox_map_id == mapbox_map_id){
				mymap.addLayer(tileLayer_normal);
			} else if (current_mapbox_map_id == mapbox_map_id_sat){
				mymap.addLayer(tileLayer_satellite);
			} else if (current_mapbox_map_id == mapbox_map_id_street){
				mymap.addLayer(tileLayer_street);
			} else if (current_mapbox_map_id == mapbox_map_id_nav){
				mymap.addLayer(tileLayer_nav);
			} else mymap.addLayer(tileLayer_normal);
			mymap.removeLayer(tileLayer_normal);
			showSmallMap();
		} else mymap.addLayer(tileLayer_normal);
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
		var circle = L.circle([second_receiver_lat, second_receiver_lon], {
			color: 'red',
			fillColor: '#f00',
			fillOpacity: 0.2,
			radius: 2002
		}).addTo(mymap);
	}

