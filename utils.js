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
		
		/*
		var dLon = (blon - alon);
		var y = Math.sin(dLon) * Math.cos(blat);
		var x = Math.cos(alat) * Math.sin(blat) - Math.sin(alat) * Math.cos(blat) * Math.cos(dLon);
		var angle = Math.atan2(y,x);
		angle = toDeg(angle);
		angle = (angle+360) % 360;
		angle = 360-angle;
		//angle+=180;
		console.log(angle);
		return angle;
		*/
	}

	function getAngleEndpoint(x,y,r,angle){  // in degrees
		angle = angle - 90;
		var rad_angle = (angle*Math.PI)/180;
		return [Math.floor(x+Math.cos(rad_angle)*r),Math.floor(y+Math.sin(rad_angle)*r)];
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

	var JSONError = ""; // to contain the url of the timed out request, set empty after processing

	var getJSON = function(url, callback) {
		var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.responseType='json';
			xhr.timeout = 5000;
			xhr.onload = function() {
				var status=xhr.status;
					if(status==200) callback(null, xhr.response);
						else { 
							callback(status, xhr.response);
						}
			};
			xhr.ontimeout = function () {
				console.log("JSON timeout: " + url);
				JSONError = url;
			}
			xhr.onerror = function () {
				console.log("JSON error: " + url);
				JSONError = url;
			}
			xhr.onabort = function () {
				console.log("JSON abort (not counted as error): " + url);
				// JSONError = url;
			}
			xhr.send();
	}

	function setCookie(cname, cvalue, exdays) {
		const d = new Date();
		if(!exdays)exdays=3*30;
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires=" + d.toUTCString();
		var domain = "domain=" + window.location.hostname;
		document.cookie = cname + "=" + cvalue + ";" + domain + ";path=/;" + expires + ";path=/;SameSite=Strict";  // let's keep path always "/" so assumption is that this is located in the root of the domain
	}
	function getCookie(cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(let i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1);
			if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
		}
		return "";
	}
	function delCookie(cname) {  // let's keep path always "/" so assumption is that this is located in the root of the same domain 
		if( getCookie(cname) ){ // if cookie exists, just mark it empty and expiration to past
			document.cookie = name + "=" + ";path=/;domain=" + window.location.hostname + ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
		}
	}

	function arrayToBase64(a){
		return btoa(JSON.stringify(a));
	}
	function base64ToArray(str){
		return JSON.parse(atob(str));
	}

	function dateToReadableStr(time){
		var return_str = "";
		if(!time) return "";
		var timestamp = new Date(time);
		return_str += timestamp.getFullYear() + "-";
		return_str += timestamp.getUTCMonth().toFixed(0).padStart(2,"0") + "-";
		return_str += timestamp.getUTCDate().toFixed(0).padStart(2,"0") + " ";
		return_str += timestamp.getUTCHours().toFixed(0).padStart(2,"0") + ":";
		return_str += timestamp.getUTCMinutes().toFixed(0).padStart(2,"0") + ":";
		return_str += timestamp.getUTCSeconds().toFixed(0).padStart(2,"0") + "Z";
		return return_str;
	}

	function sort_distance_to_selected(a,b){
		// icao, flight, distance, altitude difference, true_distance, bearing, lat, lon, track
		/*
		if(a[4] < b[4]) return -1;
		if(a[4] > b[4]) return 1;
		return 0;
		*/
		return (a[4] - b[4]);
	}

	function sort_circular_by_angle(a,b){
		return (a[1] - b[1]);
	}


