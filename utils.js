	// Utils
	function drawLine(ctx,begin,end,stroke='white',width=1){
		if(stroke) ctx.strokeStyle=stroke;
		if(width) ctx.lineWidth=width;
		ctx.beginPath();
		ctx.moveTo(...begin);
		ctx.lineTo(...end);
		ctx.closePath();
		ctx.stroke();
	}

	function deg2rad(degrees){ return( degrees * (Math.PI/180)); }

	function getDistanceFromLatLonInKm(latitude1,longitude1,latitude2,longitude2,units) {
  		var earthRadius = 6371; // Radius of the earth in km
  		var dLat = deg2rad(latitude2-latitude1);  // deg2rad below
  		var dLon = deg2rad(longitude2-longitude1); 
  		var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(latitude1)) * Math.cos(deg2rad(latitude2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  		var d = earthRadius * c; 
  		var miles = d / 1.609344; 

		if ( units == 'km' ) {  
			return d; 
		} else {
			return miles; 
		}
	}
	
	function toRad(angle) { return angle * Math.PI / 180; }
	function toDeg(angle) { return angle * 180 / Math.PI; }

	var nextpoint_lat = 0, nextpoint_lon = 0;
	function calcNextPoint(lat, lon, brng, dist){
  		dist = dist / 6371;  
   		brng = toRad(brng);  

   		var lat1 = toRad(lat), lon1 = toRad(lon);

   		var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) + Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));

   		var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *Math.cos(lat1), Math.cos(dist) - Math.sin(lat1) * Math.sin(lat2));

   		if (isNaN(lat2) || isNaN(lon2)) return false;

   		nextpoint_lat = toDeg(lat2);
   		nextpoint_lon = toDeg(lon2);
   		return true;
	}

	// Calculate angle between two positions - return (true) degrees  
	function getAngleBetweenTwoLatLon(alat,alon,blat,blon){ 
		var angle = (Math.atan2((blon-alon),(blat-alat))*180/Math.PI);
		if( angle < 0 ) angle = 360 + angle;
		return angle; 
	}

	function sortTable(tbl,col,ascending,numeric) {
		var table, rows, switching, i, x, y, shouldSwitch;
		table = document.getElementById(tbl);
		switching = true;
		while (switching) {
			switching = false;
			rows = table.rows;
			for (i = 1; i < (rows.length - 1); i++) {
				shouldSwitch = false;
				x = rows[i].getElementsByTagName("TD")[col];
				y = rows[i + 1].getElementsByTagName("TD")[col];
				if(!numeric){ // characters
					if(ascending){
						if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
							shouldSwitch = true;
							break;
						}
					} else {
						if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
							shouldSwitch = true;
							break;
						}					
					}
				} else { // numeric values
					if(ascending){
						if (parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
							shouldSwitch = true;
							break;
						}
					} else {
						if (parseInt(x.innerHTML) < parseInt(y.innerHTML)) {
							shouldSwitch = true;
							break;
						}					
					}					
				}
			}
			if (shouldSwitch) {
				if(ascending){
					rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
				} else { // descending doesn't work yet!
					rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);					
				}
				switching = true;
			}
		}
	}

	function debugTable() {
		var al = document.getElementById("aircrafts-body");
		var outHTML = "";
		for(i=0; i<60; i++) {
			// just add empty lines to aircraft list for scroll issues resolving
			outHTML += "<tr>";
			outHTML += "<td>testA." + i + "</td>" + "<td colspan='10'>T" + i + "</td>";
			outHTML += "</tr>";
		}
		al.innerHTML += outHTML;
	}

	var getJSON = function(url, callback) {
		var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.responseType='json';
			xhr.onload = function() {
				var status=xhr.status;
					if(status==200) callback(null, xhr.response);
						else callback(status, xhr.response);
			};
			xhr.send();
	}


