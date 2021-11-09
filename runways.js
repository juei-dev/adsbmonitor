
	var layerGroupRunways = new L.layerGroup().addTo(mymap);

	function addRunwayToMap(airport,num1,lat1,lon1,num2,lat2,lon2,len){
		var point1 = new L.LatLng(lat1,lon1);
		var point2 = new L.LatLng(lat2,lon2);
		var pointlist = [point1,point2];
		if(len<8000) // smaller runways
			var runway_line = new L.polyline(pointlist, {
				color: '#1010C1',
				weight: 4,
				opacity: 0.4,
				smoothFactor: 1
			});
		else // major runways
			var runway_line = new L.polyline(pointlist, {
				color: '#F030F1',
				weight: 4,
				opacity: 0.4,
				smoothFactor: 1
			});
		runway_line.addTo(layerGroupRunways);
		runway_line.bindTooltip(airport + " " + num1 + " / " + num2, { permanent: false, direction: 'center', offset: [0,0], opacity: 1 });
	}

	function parseRunwayData(text, delimeter = ","){
		text = text.replace(/["']/g,""); // remove double quotes
		const headers = text.slice(0,text.indexOf("\n")).split(delimeter);
		const rows = text.slice(text.indexOf("\n")+1).split("\n");
		const runways = rows.map(function (row) {
			const values = row.split(delimeter);
			const runway = headers.reduce(function (object, header, index){
				if(values[index]) object[header] = values[index]; else object[header] = "";
				return object;
			}, {});
			return runway;
		});
		return runways;
	}
	var raw_runway_data = "";
	var nearest_runways = [["","","","","","","","","","",""]]; // airport code (airport_ident), runway start number (le_ident), runway end number (he_ident), elevation (le_elevation_ft), start lat (le_latitude_deg), start lon (le_longitude_deg), end lat (he_latitude_deg), end lon (he_longitude_deg), surface, length (length_ft), width (width_ft)
	var nearest_longer_runways = [["","","","","","","","","","",""]];
	function refreshAirportdata(){
		if(!airports_enabled){
			document.getElementById("airports-cb").innerHTML += " <label class='form-control'><input type='checkbox' id='airports-enabled' onclick='airportsEnabledChange()' class='runways-cb' disabled> Runways</label>";		
			document.getElementById("ecam-display").value += "  RUNWAYS INOP"; 
			return;
		}
		// load csv of runway data (credits to ourairports.com) - fetch only once
		if(!raw_runway_data) {
			console.log("Loading runways");
			fetch("runways.csv")
				.then(response => { if(response.ok)return response.text();else throw new Error("Fetching runways failed"); })
				.then(data => {
					raw_runway_data = parseRunwayData(data,",");
					console.log("Runways loaded");
					findNearestRunways();
					var rwh = document.getElementById("runways-head");
					var outHTML = "";
					// TO DO: get weather information for those airports
					rwh.innerHTML = "<th style='width: 45px;'>Airport</th><th style='width: 60px;'>Runway</th><th>Elev.</th><th style='width: 50px;'>Length</th><th>Width</th><th style='width: 80px;'>Surface</th><th style='background:#40C0FF;'>A72</th><th>E17</th><th style='background:#40C0FF;'>737</th><th>747</th><th style='background:#40C0FF;'>767</th><th>777</th><th style='background:#40C0FF;'>787</th><th>319</th><th style='background:#40C0FF;'>320</th><th>321</th><th style='background:#40C0FF;'>330</th><th>350</th><th style='background:#40C0FF;'>380</th><th style='width: 100px;'>Aircrafts</th>";
					refreshAirportAircraftdata();
				})
				.catch((error) => {
					document.getElementById("ecam-display").value += "  RUNWAYS FAIL"; 
					console.error;
				});
		} 
		document.getElementById("airports-cb").innerHTML += " <label class='form-control'><input type='checkbox' id='airports-enabled' onclick='airportsEnabledChange()' class='runways-cb' checked> Runways</label>";		
	}
	function airportsEnabledChange(){
		if(document.getElementById("airports-enabled").checked){
			findNearestRunways();
		} else {
			layerGroupRunways.clearLayers();
		}
	}

	// process data into array of nearest runways
	function findNearestRunways(){
		for(c=0; c<nearest_runways.length; c++)nearest_runways.pop(); // empty the nearest runways array first before repopulating it
		{
			var min_lat, max_lat, min_lon, max_lon;
			var map_bounds = mymap.getBounds();
			min_lon = map_bounds.getWest(); max_lon = map_bounds.getEast();
			min_lat = map_bounds.getSouth(); max_lat = map_bounds.getNorth();
			console.log("Detecting nearest runways from " + raw_runway_data.length + " runways (" + min_lat + "-" + max_lat + "," + min_lon + "-" + max_lon);
			//console.log(raw_runway_data);
			for(i=0; i<raw_runway_data.length; i++){
				// ditch all the 0 lat and/or lon value runways (error data)
				if(raw_runway_data[i].le_latitude_deg==0 || raw_runway_data[i].le_longitude_deg == 0 || raw_runway_data[i].he_latitude_deg==0 || raw_runway_data[i].he_longitude_deg==0) continue;
				// fetch using only start of the runways (might cut some of the runways at the sides of the map)
				if(raw_runway_data[i].le_latitude_deg >= min_lat && raw_runway_data[i].le_latitude_deg <= max_lat && raw_runway_data[i].le_longitude_deg >= min_lon && raw_runway_data[i].le_longitude_deg <= max_lon){
					var airport_code = "", r_start_number = "", r_end_number = "", r_elevation = "";
					var r_start_lat = "", r_start_lon = "", r_end_lat = "", r_end_lon = "";
					var r_surface = "", r_length = "";
					airport_code = raw_runway_data[i].airport_ident;
					r_start_number = raw_runway_data[i].le_ident;
					r_end_number = raw_runway_data[i].he_ident;
					r_elevation = raw_runway_data[i].le_elevation_ft;
					r_start_lat = raw_runway_data[i].le_latitude_deg; 
					r_start_lon = raw_runway_data[i].le_longitude_deg; 
					r_end_lat = raw_runway_data[i].he_latitude_deg; 
					r_end_lon = raw_runway_data[i].he_longitude_deg;
					r_surface = raw_runway_data[i].surface;
					r_length = raw_runway_data[i].length_ft;
					r_width = raw_runway_data[i].width_ft;
					nearest_runways.push([airport_code, r_start_number, r_end_number, r_elevation, r_start_lat, r_start_lon, r_end_lat, r_end_lon,r_surface,r_length,r_width]);
					if(r_length>8000)
						nearest_longer_runways.push([airport_code, r_start_number, r_end_number, r_elevation, r_start_lat, r_start_lon, r_end_lat, r_end_lon,r_surface,r_length,r_width]);
					addRunwayToMap(airport_code,r_start_number,r_start_lat,r_start_lon,r_end_number,r_end_lat,r_end_lon,r_length); 
					//console.log(raw_runway_data[i]);
				}				
			}
			console.log("Nearest runways determined");
		}
		//console.log(nearest_runways);
	}
	refreshAirportdata();

	function refreshAirportAircraftdata(){
		var rwd = document.getElementById("runways-body");
		var num_of_runways = 0;
		var outHTML = "";
		for( i=0; i<nearest_runways.length; i++ ){
			var style_common = " cursor: pointer;";
			var a_no = "background: #400000;", a_maybe = "background: #404000", a_yes = "background: #004000";
			if(nearest_runways[i][9]<5000) style_common += " background: #000000; color: #707071;"; // smaller runways
			if(nearest_runways[i][9]>=7000 && nearest_runways[i][9]<8000) style_common += " background: #000141";
			if(nearest_runways[i][9]>=8000 && nearest_runways[i][9]<9000) style_common += " background: #102151";
			if(nearest_runways[i][9]>=9000 && nearest_runways[i][9]<10000) style_common += " background: #302171";
			if(nearest_runways[i][9]>=10000) style_common += " background: #502191";
			outHTML += "<tr onClick='goToMapPoint(" + nearest_runways[i][4] + "," + nearest_runways[i][5] + ",8)'>";
			outHTML += "<td style='"+ style_common + "'><a name='" + nearest_runways[i][0] + "'>" + nearest_runways[i][0] + "</a></td>";
			outHTML += "<td style='"+ style_common + "'>" + nearest_runways[i][1] + " / " + nearest_runways[i][2] + "</td>";
			outHTML += "<td style='"+ style_common + "'>" + nearest_runways[i][3] + "</td>"; // elevation
			outHTML += "<td style='"+ style_common + "'>" + nearest_runways[i][9] + "</td>"; // length
			outHTML += "<td style='"+ style_common + "'>" + nearest_runways[i][10] + "</td>"; // width
			outHTML += "<td style='"+ style_common + "'>" + nearest_runways[i][8] + "</td>"; // surface
			// <th>AT72</th><th>E170</th><th>737</th><th>747</th><th>757</th><th>767</th><th>777</th><th>787</th><th>319</th><th>320</th><th>321</th><th>330</th><th>340</th><th>350</th><th>380</th>
			// Take-off capabilities of some commercial aircrafts with MTOW
			if(nearest_runways[i][9]<4500)
			{
				outHTML += "<td style='"+ a_no +"'>-</td>"; // ATR 72
				outHTML += "<td style='"+ a_no +"'>-</td>"; // E170
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B737
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B747
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B767
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B777
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B787
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A319
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A320
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A321
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A330
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A350
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A380
			}
			if(nearest_runways[i][9]>=4500 && nearest_runways[i][9]<5500)
			{
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // ATR 72
				outHTML += "<td style='"+ a_no +"'>-</td>"; // E170
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B737
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B747
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B767
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B777
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B787
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A319
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A320
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A321
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A330
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A350
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A380
			}
			if(nearest_runways[i][9]>=5500 && nearest_runways[i][9]<6000)
			{
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // ATR 72
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // E170
				outHTML += "<td style='"+ a_maybe +"'>o</td>"; // B737
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B747
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B767
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B777
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B787
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A319
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A320
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A321
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A330
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A350
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A380
			}
			if(nearest_runways[i][9]>=6000 && nearest_runways[i][9]<6500)
			{
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // ATR 72
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // E170
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B737
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B747
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B767
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B777
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B787
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A319
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A320
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A321
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A330
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A350
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A380
			}
			if(nearest_runways[i][9]>=6500 && nearest_runways[i][9]<7000)
			{
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // ATR 72
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // E170
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B737
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B747
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B767
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B777
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B787
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A319
				outHTML += "<td style='"+ a_maybe +"'>o</td>"; // A320
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A321
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A330
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A350
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A380
			}
			if(nearest_runways[i][9]>=7000 && nearest_runways[i][9]<7500)
			{
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // ATR 72
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // E170
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B737
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B747
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B767
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B777
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B787
				outHTML += "<td style='"+ a_maybe +"'>o</td>"; // A319
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A320
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A321
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A330
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A350
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A380
			}
			if(nearest_runways[i][9]>=7500 && nearest_runways[i][9]<8000)
			{
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // ATR 72
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // E170
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B737
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B747
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B767
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B777
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B787
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A319
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A320
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A321
				outHTML += "<td style='"+ a_maybe +"'>o</td>"; // A330
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A350
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A380
			}
			if(nearest_runways[i][9]>=8000 && nearest_runways[i][9]<8500)
			{
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // ATR 72
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // E170
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B737
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B747
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B767
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B777
				outHTML += "<td style='"+ a_maybe +"'>o</td>"; // B787
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A319
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A320
				outHTML += "<td style='"+ a_maybe +"'>o</td>"; // A321
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A330
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A350
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A380
			}
			if(nearest_runways[i][9]>=8500 && nearest_runways[i][9]<9500)
			{
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // ATR 72
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // E170
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B737
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B747
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B767
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B777
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B787
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A319
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A320
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A321
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A330
				outHTML += "<td style='"+ a_maybe +"'>o</td>"; // A350
				outHTML += "<td style='"+ a_no +"'>-</td>"; // A380
			}
			if(nearest_runways[i][9]>=9500 && nearest_runways[i][9]<10000)
			{
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // ATR 72
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // E170
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B737
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B747
				outHTML += "<td style='"+ a_maybe +"'>o</td>"; // B767
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B777
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B787
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A319
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A320
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A321
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A330
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A350
				outHTML += "<td style='"+ a_maybe +"'>o</td>"; // A380
			}
			if(nearest_runways[i][9]>=10000 && nearest_runways[i][9]<10500)
			{
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // ATR 72
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // E170
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B737
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B747
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B767
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B777
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B787
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A319
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A320
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A321
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A330
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A350
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A380
			}
			if(nearest_runways[i][9]>=10500 && nearest_runways[i][9]<11000)
			{
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // ATR 72
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // E170
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B737
				outHTML += "<td style='"+ a_maybe +"'>o</td>"; // B747
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B767
				outHTML += "<td style='"+ a_no +"'>-</td>"; // B777
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B787
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A319
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A320
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A321
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A330
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A350
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A380
			}
			if(nearest_runways[i][9]>=11000 && nearest_runways[i][9]<11500)
			{
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // ATR 72
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // E170
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B737
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B747
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B767
				outHTML += "<td style='"+ a_maybe +"'>o</td>"; // B777
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B787
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A319
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A320
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A321
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A330
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A350
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A380
			}
			if(nearest_runways[i][9]>=11500)
			{
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // ATR 72
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // E170
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B737
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B747
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B767
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B777
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // B787
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A319
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A320
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A321
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A330
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A350
				outHTML += "<td style='"+ a_yes +"'>x</td>"; // A380
			}
			outHTML += "<td style='"+ style_common + "'>"; // near-by aircrafts
			var acs = 0;
			for( a=0; a<aircrafts_positions.length; a++){
				if(!aircrafts_positions[a][0])continue; // do not try to show empty flight name string
				if(nearest_runways[i][9]>=5000) // do not display aircrafts if runway is less than 5000ft (clearing things)
					if( getDistanceFromLatLonInKm(nearest_runways[i][4],nearest_runways[i][5],aircrafts_positions[a][1],aircrafts_positions[a][2],'km') <= 88 ) { // 88 km is the zoom level 9
						if(acs>0) outHTML += ", ";
						outHTML += "<span onClick='goToMapPoint(" + aircrafts_positions[a][1] + "," + aircrafts_positions[a][2] + ",9)'>" + aircrafts_positions[a][0].trim() + "</span>"; 
						acs++;
					} 
			}
			outHTML += "</td>";
			outHTML += "</tr>";
			num_of_runways++;
		}
		rwd.innerHTML = outHTML;
		//console.log("Airport aircrafts updated (" + num_of_runways + " runways checked)");
	}
	var refreshAirportAircraftsInterval = setInterval(refreshAirportAircraftdata, airport_aircraft_refresh_rate);
