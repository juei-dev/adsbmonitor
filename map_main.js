	var mymap = L.map('mapid').setView([receiver_lat, receiver_lon], 6);
	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    		maxZoom: 18,
    		id: 'mapbox/dark-v8', /* mapbox/streets-v11 */
    		tileSize: 512,
    		zoomOffset: -1,
    		accessToken: mapbox_accessToken
	}).addTo(mymap);

	mymap.on('zoomend', function() {
		filters_map_center = mymap.getCenter();
		filters_map_distance = Math.floor(filters_map_center.distanceTo(L.latLng(filters_map_center.lat, mymap.getBounds().getEast()))/1000);  
		document.getElementById("cb-filter-map-distance").innerHTML = filters_map_distance;
		document.getElementById("cb-filter-map-distance-miles").innerHTML = Math.floor(filters_map_distance * 0.539957); // nautical miles
	});

	function goToMapPoint(lat, lon, zoom){
		mymap.flyTo([lat,lon],zoom);
		window.scrollTo(0,0);
	}

	function resetMapPosition(){
		mymap.flyTo([receiver_lat, receiver_lon], 6);
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

