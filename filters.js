	// Filters
	var filters_map_checked = false;
	var filters_map_center;
	var filters_map_distance = -1; // in meters (center to eastest part of the map)
	function checkFilters(){
		if( document.getElementById("cb-filter-map").checked ){
			filters_map_center = mymap.getCenter();
			filters_map_distance = Math.floor(filters_map_center.distanceTo(L.latLng(filters_map_center.lat, mymap.getBounds().getEast()))/1000);
			document.getElementById("cb-filter-map-distance").innerHTML = filters_map_distance; // kilometers
			document.getElementById("cb-filter-map-distance-miles").innerHTML = Math.floor(filters_map_distance * 0.539957); // nautical miles
			filters_map_checked = true; 
		} else {
			filters_map_checked = false;	
		}
	}
