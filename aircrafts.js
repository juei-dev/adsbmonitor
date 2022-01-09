	/* handle ACs sort order change request */
	function onClickACHeader(col){
		var ah = document.getElementById("aircrafts-head");
		if(aircrafts_table_sort_col == col){
			if(aircrafts_table_sort_ascending)aircrafts_table_sort_ascending=false; else aircrafts_table_sort_ascending=true;}
		aircrafts_table_sort_col = col;
		aircrafts_table_sort_numeric = aircrafts_table_column_numerics[col];
		if(aircrafts_table_sort_ascending)
			ah.getElementsByTagName("TH")[col].style.background = "#600000";
		else
			ah.getElementsByTagName("TH")[col].style.background = "#006000";
	}
	
	var layerGroup = L.layerGroup().addTo(mymap);

	const primary_icaos = []; // primary receiver icaos
	var aircrafts_positions = ["",0,0,""]; // all visible flights with callsign, lat, lon, icao
	var second_ac_data = null; // supplementary / secondary receiver aircraft json - null if error
	var second_stat_data = null; // supplementary / secondary receiver statistics json - null if error

	var all_icao_flights = []; // icao, flight

	var ac_traces = []; // store of ac track traces for map: icao, flight, timestamp, lat, lon, altitude, gs, tas, track, rssi
	var layerGroupTraces = L.layerGroup().addTo(mymap);

	var ac_count = 0, ac_with_pos_count = 0, ac_msgs = 0, ac_max_distance = 0, ac_max_distance_all_time = 0;
	var second_ac_count = 0, second_ac_with_pos_count = 0;

	// session maximums [value, flight, timestamp, heading, bearing, distance]
	var session_max_distance = [0,"","",0,0,0], session_max_altitude = [0,"","",0,0,0], session_max_gs = [0,"","",0,0,0], session_max_tas = [0,"","",0,0,0];
	var session_max_climb_rate = [0,"","",0,0,0], session_max_descent_rate = [0,"","",0,0,0];

	// circular and altitude reception statistics
	// [receiver_label, angle (in int 0-359), min_distance, max_distance, max_distance_rssi, min_alt, max_alt, max_lat, max_lon]
	var receiver_circular_stats = [];
	for(i=0;i<360;i++)receiver_circular_stats.push([receiver_label,i,999,0,99,99999,0,0,0]);
	for(i=0;i<360;i++)receiver_circular_stats.push([second_receiver_label,i,999,0,99,99999,0,0,0]);

	// company data
	var companies = []; // company_name, last seen (not used for now), flights seen
	var company_flights = []; // company_name, flight, last seen (Date object)

	var emergency_flights = []; // company_name, flight, squawk, last seen, lat, lon, altitude, gs, tas, rssi

	// distances
	var selected_icao = "", selected_flight = "";
	var selected_lat = 0, selected_lon = 0, selected_altitude = 0;
	var distance_to_selected = []; // icao, flight, distance, altitude difference, true distance, bearing, lat, lon, track

	// selected aircraft - glide range: extremely rough approximation to map using 1:15 glide ratio, altitude and max azimuth of +-45 degrees towards heading
	var selected_glide_range_enabled = true;
	var selected_glide_range_ratio = 15; // 1:15
	var selected_glide_azimuth = 45; // +- 45 degrees towards ac heading

	// selected aircraft lock on - following the selected aircraft - double click to engage / disengage
	var selected_lock_on = false;

	// to prevent mouse click bubling effect on map
	var selected_clicked = false;

	// selected aircraft extra information on full screen map
	var selected_img_src = "";
	var selected_ac_reg = "";
	var selected_ac_manufacturer = "";
	var selected_ac_type = "";
	var selected_ac_icao_type = "";
	var selected_ac_owner = "";
	var selected_ac_route = "";

	var selected_ac_squawk = "";

	var selected_ac_tas = 0;
	var selected_ac_gs = 0;

	var selected_ac_track = 0;
	var selected_ac_rate = 0;

	var selected_ac_rssi = "";
	var selected_ac_msgs = 0;
	var selected_ac_seen = 0;

	var ac_extra_info_url_details = "https://api.joshdouch.me/api/aircraft/";
	var ac_extra_info_url_reg = "https://api.joshdouch.me/hex-reg.php?hex=";
	var ac_extra_info_url_route = "https://api.joshdouch.me/callsign-route.php?callsign=";
	var ac_extra_info_url_thumb_image = "https://api.joshdouch.me/hex-image-v2-thumb.php?hex=";


	// table sorting variables
	var aircrafts_table_sort_col = 8, aircrafts_table_sort_ascending = true, aircrafts_table_sort_numeric = true;
	const aircrafts_table_column_numerics = [false,false,true,false,true,true,true,true,true,true,true,true,false,false];

	var receiver_ok = true, second_receiver_ok = true;

	function refreshAircrafts(){
		if(JSONError=="http://" + receiver_domain + receiver_url_path){
			JSONError="";
			receiver_ok = false;
		}
		if(JSONError=="http://" + second_receiver_domain + second_receiver_url_path){
			JSONError="";
			second_receiver_ok = false;
		}
		if(receiver_ok){
//			if(document.getElementById("ecam-display").value.includes("ADSB 1 FAIL")){ 
			if(document.getElementById("ecam-display").value != ""){ 
				document.getElementById("ecam-display").readOnly=false;
				var ecam_content = document.getElementById("ecam-display").value;
				ecam_content = ecam_content.replace("  ADSB 1 FAIL","");
				document.getElementById("ecam-display").value = ecam_content; 
				document.getElementById("ecam-display").readOnly=true;
			}
		} else {
			if(!document.getElementById("ecam-display").value.includes("ADSB 1 FAIL")){ 
				document.getElementById("ecam-display").readOnly=false;
				document.getElementById("ecam-display").value += "  ADSB 1 FAIL"; 
				document.getElementById("ecam-display").readOnly=true;
			}
		}
		if(second_receiver_ok){
//			if(document.getElementById("ecam-display").value.includes("ADSB 2 FAIL")){ 
			if(document.getElementById("ecam-display").value != ""){ 
				document.getElementById("ecam-display").readOnly=false;
				var ecam_content = document.getElementById("ecam-display").value;
				ecam_content = ecam_content.replace("  ADSB 2 FAIL",""); 
				document.getElementById("ecam-display").value = ecam_content; 
				document.getElementById("ecam-display").readOnly=true;
			}
		} else {
			if(!document.getElementById("ecam-display").value.includes("ADSB 2 FAIL")){
				document.getElementById("ecam-display").readOnly=false;
				document.getElementById("ecam-display").value += "  ADSB 2 FAIL"; 
				document.getElementById("ecam-display").readOnly=true;
			}			
		}
		getJSON("http://" + receiver_domain + receiver_url_path,
			function(err,data){
				if(err==null){
					receiver_ok = true;
					// fetch secondary receiver data json, if enabled
					if( second_receiver_enabled ){
						getJSON("http://" + second_receiver_domain + second_receiver_url_path,
							function(err,data){
								second_ac_data = null;
								if(err==null){ 
									second_receiver_ok = true;
									second_ac_data = data;
				 					//document.getElementById("ecam-display").value.replace("  ADSB 2 FAIL","");
								} else {
									// document.getElementById("ecam-display").value += "  ADSB 2 FAIL";  
									second_receiver_ok = false;
									JSONError = "http://" + second_receiver_domain + second_receiver_url_path; 
				 				}
							});
					}
					// begin update by clearing all the map data and redrawing the alti-bar box
					layerGroup.clearLayers();
					drawAltiBox();
					var ah = document.getElementById("aircrafts-head");
					var headHTML = "<th style='text-align: left;' onClick='onClickACHeader(0)'>Callsign</th><th onClick='onClickACHeader(1)'>Cat</th><th onClick='onClickACHeader(2)'>Track</th><th onClick='onClickACHeader(3)'>Squawk</th><th onClick='onClickACHeader(4)'>Alt</th><th onClick='onClickACHeader(5)'>Rate</th><th onClick='onClickACHeader(6)'>GS</th><th onClick='onClickACHeader(7)'>TAS</th><th onClick='onClickACHeader(8)'>Dist</th><th onClick='onClickACHeader(9)'>RSSI</th><th onClick='onClickACHeader(10)'>Seen</th><th onClick='onClickACHeader(11)'>Msgs</th><th onClick='onClickACHeader(12)'>Recvd</th><th onClick='onClickACHeader(13)'>L/D</th>";
					ah.innerHTML = headHTML;
					var al = document.getElementById("aircrafts-body");
					//al.innerHTML = "";
					var outHTML = "";

					// calculate zoom corrections for the aircraft map marker
					var zoom_correction_lat = 0.01, zoom_correction_lon = 0.02;
					var zoom_level = mymap.getZoom();
					if(zoom_level){
						zoom_correction_lat = 0.01 * (36/Math.pow(zoom_level,2));
						zoom_correction_lon = 0.02 * (36/Math.pow(zoom_level,2));
					}					

					// grawl through the secondary receiver data for circular graphs and stats
					second_ac_count=0; second_ac_with_pos_count=0;
					if( second_ac_data )
						for( var k2 in second_ac_data.aircraft ){
							var tmp_aci = second_ac_data.aircraft[k2];
							second_ac_count++;
							if(tmp_aci){ 
								if(tmp_aci.lat && tmp_aci.lon){
									second_ac_with_pos_count++;
									var angle = Math.floor(getAngleBetweenTwoLatLon(second_receiver_lat,second_receiver_lon,tmp_aci.lat,tmp_aci.lon));
									var second_distance = getDistanceFromLatLonInKm(second_receiver_lat,second_receiver_lon,tmp_aci.lat,tmp_aci.lon,'km');								
									for(i=360;i<receiver_circular_stats.length;i++){
										if(receiver_circular_stats[i][0] == second_receiver_label && receiver_circular_stats[i][1] == angle){
											if(second_distance < receiver_circular_stats[i][2] && tmp_aci.altitude){ receiver_circular_stats[i][2]=second_distance; receiver_circular_stats[i][5]=tmp_aci.altitude; }
											if(second_distance > receiver_circular_stats[i][3]){ receiver_circular_stats[i][3]=second_distance; receiver_circular_stats[i][4]=tmp_aci.rssi; receiver_circular_stats[i][6]=tmp_aci.altitude; receiver_circular_stats[i][7]=tmp_aci.lat; receiver_circular_stats[i][8]=tmp_aci.lon; }
											break;
										} 
									}
								}
							}
						}

					ac_count = 0; ac_with_pos_count = 0; ac_msgs = 0; ac_max_distance = 0; 
					while( primary_icaos.length > 0 ) primary_icaos.pop(); // clear up primary icaos list
					while( aircrafts_positions.length > 0 ) aircrafts_positions.pop(); // clear up aircraft positions
					while( distance_to_selected.length > 0 ) distance_to_selected.pop(); // clear up the distances to selected aircraft
					// parse through all the primary receiver aircrafts
					for(var key in data.aircraft)
					{
						var aci = data.aircraft[key];
						var lat=0, lon=0, altitude=-1, rate=0, track=-1, tas=-1, gs=-1, squawk="", seen=-1, rssi=0.0, msgs=0, cat="";
						var roll = 0, nav_altitude = 0, nav_heading = 0, nav_qnh = 0, mach = 0;
						var flight="", icao="";
						var position_received = ""; // which receiver had the position
						var company_name = "";

						ac_count++;	// update all aircrafts count

						if( aci.hex ) icao = aci.hex;
						primary_icaos.push(icao);

						var second_aci = null;
						// check secondary receiver data if this ac is in there
						if( second_ac_data ){
							for( var k2 in second_ac_data.aircraft ){
								var tmp_aci = second_ac_data.aircraft[k2];
								if(tmp_aci) 
									if( tmp_aci.hex == icao ){
										second_aci = tmp_aci;
										break; 
									}
							}
						}
						if(aci.flight)flight = aci.flight; else if(second_aci) if(second_aci.flight) flight = second_aci.flight;
						if(flight)all_icao_flights.push([icao,flight]);
						if(flight)company_name = findCompany(flight);
						if(!company_name) company_name = ""; 
						if(selected_company_name!=flight && flight!=""){
							var current_date = new Date();
							var company_already_added = false;
							var company_index = 0;
							for( c=0; c<companies.length; c++ ) 
								if(companies[c][0]==selected_company_name){ company_index = c; company_already_added = true; break; }
							if(!company_already_added) companies.push([selected_company_name,current_date,1]);
							else { companies[company_index][1] = current_date; }
							var company_flight_already_added = false, company_flight_index = 0;
							for( c=0; c<company_flights.length; c++ )
								if((company_flights[c][0] == selected_company_name) && (company_flights[c][1]==flight))
								{
									company_flight_already_added=true; company_flight_index = c; break; 
								}
							//console.log("company '" + company_name + "' flight '" + flight + "'"); 
							if(!company_flight_already_added){
								var previously_seen = companies[company_index][2];
								if(flight.trim()!="" && company_already_added)companies[company_index][2] = previously_seen+1;
								company_flights.push([selected_company_name,flight,current_date]);
							} else {
								//console.log("updated cflight " + flight + " to " + current_date);
								company_flights[company_flight_index][2] = current_date;
							}
						}
						if(aci.squawk)squawk = aci.squawk; else if(second_aci) if(second_aci.squawk) squawk = second_aci.squawk;
						lat = aci.lat;
						lon = aci.lon;
						if(lat&&lon) position_received = receiver_label;
						if(!lat && second_aci) { if(second_aci.lat){ lat = second_aci.lat; position_received = second_receiver_label; } }
						if(!lon && second_aci) { if(second_aci.lon){ lon = second_aci.lon; position_received = second_receiver_label; } }
						if(position_received) ac_with_pos_count++;
						if(aci.alt_baro)altitude = aci.alt_baro; else if(second_aci) if(second_aci.alt_baro) altitude = second_aci.alt_baro;
						if(aci.baro_rate)rate = aci.baro_rate; else if(second_aci) if(second_aci.baro_rate) rate = second_aci.baro_rate;
						if(aci.track)track = Math.floor(aci.track); else if(second_aci) if(second_aci.track) track = Math.floor(second_aci.track);
						if(aci.tas)tas = aci.tas; else if(second_aci) if(second_aci.tas) tas = second_aci.tas;
						if(aci.gs)gs = aci.gs; else if(second_aci) if(second_aci.gs) gs = second_aci.gs;
						if(aci.rssi)rssi = aci.rssi;
						if(aci.seen)seen = aci.seen;
						if(aci.messages)msgs = aci.messages;
						ac_msgs+=msgs;
						if(aci.category)cat = aci.category;

						if(aci.roll)roll = aci.roll;
						if(aci.nav_altitude_mcp)nav_altitude = aci.nav_altitude_mcp;
						if(aci.nav_heading)nav_heading = aci.nav_heading;
						if(aci.nav_qnh)nav_qnh = aci.nav_qnh;
						if(aci.mach)mach = aci.mach;

						if(track<0)track="";
						if(altitude<0)altitude="";
						if(tas<0)tas="";
						if(gs<0)gs="";
						if(seen<0)seen="";
						if(seen>=100)seen = Math.floor(seen); 

						// Add distance to selected aircraft
						if(selected_icao ){ // && flight
							if(selected_icao != icao){
								if(lat && lon && altitude){ // icao, flight, distance, altitude difference, true_distance, bearing, lat, lon, track
									var lateral_distance_between = getDistanceFromLatLonInKm(selected_lat,selected_lon,lat,lon,'km');
									var true_distance_between = Math.sqrt(lateral_distance_between**2, (selected_altitude - altitude)**2);
									var bearing_to = getAngleBetweenTwoLatLon(selected_lat,selected_lon,lat,lon);
									distance_to_selected.push([icao, flight, lateral_distance_between, (selected_altitude - altitude), true_distance_between, bearing_to, lat, lon, track]);
								} else if (lat & lon){
									var lateral_distance_between = getDistanceFromLatLonInKm(selected_lat,selected_lon,lat,lon,'km');
									var true_distance_between = lateral_distance_between;
									var bearing_to = getAngleBetweenTwoLatLon(selected_lat,selected_lon,lat,lon);
									distance_to_selected.push([icao, flight, lateral_distance_between, selected_altitude, true_distance_between, bearing_to, lat, lon, track]);
								}
							} else { // if this is selected flight
								if(flight)selected_flight = flight; else { selected_flight = ""; }
								if(lat && lon){
									selected_lat = lat; selected_lon = lon;
									if(altitude)selected_altitude = altitude; else selected_altitude=0;
									distance_to_selected.push([icao, flight, 0, selected_altitude, 0, -1, lat, lon, track]);
								} else { // if selected icao doesn't have position information, remove selection completely
									selected_icao = ""; selected_flight = ""; 
								}								
							}
						}

						// Add flight to aircrafts_positions and "leave" traces
						if(lat && lon) {
							aircrafts_positions.push([flight,lat,lon,icao]);
							// var trace_timestamp_now = new Date();
							if(ac_trace_all) { 
								addTrace(icao, flight, Date.now(), lat, lon, altitude, gs, tas, track, rssi);
							}
							else if(selected_icao==icao && ac_trace_selected) {
								addTrace(icao, flight, Date.now(), lat, lon, altitude, gs, tas, track, rssi);								
							}
						}

						// Add emergency flights
						// company_name, flight, last seen, squawk, lat, lon, altitude, gs, tas, rssi
						if(squawk=="7700" || squawk=="7600" || squawk=="7500"){
							var ef_index_found = -1;
							for(ef=0; ef<emergency_flights.length; ef++){
								if(emergency_flights[ef][1] == flight){ ef_index_found = ef; break; }
							}
							var timestamp_now = new Date();
							if( ef_index_found >= 0 ){
								emergency_flights[ef_index_found][2] = timestamp_now;
								if(lat)emergency_flights[ef_index_found][4] = lat; else emergency_flights[ef_index_found][4] = "";
								if(lon)emergency_flights[ef_index_found][5] = lon; else emergency_flights[ef_index_found][5] = "";
								if(altitude)emergency_flights[ef_index_found][6] = altitude; else emergency_flights[ef_index_found][6] ="";
								if(gs)emergency_flights[ef_index_found][7] = gs; else emergency_flights[ef_index_found][7] = "";
								if(tas)emergency_flights[ef_index_found][8] = tas; else emergency_flights[ef_index_found][8] = "";
								emergency_flights[ef_index_found][9] = rssi;								
							} else
								emergency_flights.push([company_name, flight, timestamp_now, squawk, lat, lon, altitude, gs, tas, rssi]);
						}

						// FD update
						if(flight == FD_flight){
		 					FD_tas = -1; FD_gs = -1; FD_altitude = -1; FD_rate = 0; FD_track = 0; FD_roll = 0; FD_mach = -1; FD_nav_altitude = -1; FD_nav_heading = -1;
							FD_effective_flight = FD_flight;
							FD_tas = tas;
							FD_gs = gs;
							FD_altitude = altitude;
							FD_rate = rate;
							FD_roll = roll;
							FD_mach = mach;
							FD_track = track;
							FD_nav_altitude = nav_altitude;
							FD_nav_heading = nav_heading;
							FD_nav_qnh = nav_qnh;
						}

						var distance = -1;
						if( lat && lon ) 
							if( position_received == receiver_label) {
								distance = getDistanceFromLatLonInKm(receiver_lat,receiver_lon,lat,lon,'km');
							} else {
								distance = getDistanceFromLatLonInKm(second_receiver_lat,second_receiver_lon,lat,lon,'km');								
							}
						if( distance > ac_max_distance ) ac_max_distance = Math.floor(distance);
						if( ac_max_distance > ac_max_distance_all_time) ac_max_distance_all_time = ac_max_distance;

						if( filters_map_checked ){
							if( lat && lon ){
								var map_center = mymap.getCenter();
								var ac_distance_to_center = getDistanceFromLatLonInKm(map_center.lat,map_center.lng,lat,lon,'km');
								// console.log("AC distance to center [" + map_center.lat + "," + map_center.lng +"]: " + ac_distance_to_center);
								if( ac_distance_to_center > filters_map_distance ) continue;
							} else continue;
						}

						// Calculate session maximums
						// [value, flight, timestamp, heading, bearing, distance]
						if(position_received == receiver_label)
							var s_bearing = Math.floor(getAngleBetweenTwoLatLon(receiver_lat,receiver_lon,lat,lon));
						else
							var s_bearing = Math.floor(getAngleBetweenTwoLatLon(second_receiver_lat,second_receiver_lon,lat,lon));
						var s_date = new Date();
						if(session_max_distance[0] < distance)session_max_distance = [distance.toFixed(0), flight, s_date, track, s_bearing, distance.toFixed(0)]; 
						if((session_max_altitude[0] < altitude) && (altitude <= 60000))session_max_altitude = [altitude, flight, s_date, track, s_bearing, distance.toFixed(0)];
						if(session_max_gs[0] < gs)session_max_gs = [Math.floor(gs), flight, s_date, track, s_bearing, distance.toFixed(0)];
						if(session_max_tas[0] < tas)session_max_tas = [Math.floor(tas), flight, s_date, track, s_bearing, distance.toFixed(0)];
						if(session_max_climb_rate[0] < rate)session_max_climb_rate = [Math.floor(rate), flight, s_date, track, s_bearing, distance.toFixed(0)];
						if(session_max_descent_rate[0] > rate)session_max_descent_rate = [Math.floor(rate), flight, s_date, track, s_bearing, distance.toFixed(0)];

						//console.log(flight + " " + lat + "," + lon + " " + altitude);
						outHTML += "<tr>";
						var flight_style = " text-align: left;";
						var pos_style = "background: #101050;";
						if( position_received == second_receiver_label ) pos_style = "background: #101090;"; 
						if( !lat && !lon ) pos_style = "color: #8080A2;";
						var seen_style = "";
						if( seen > 15.0 ) seen_style = " color: #F07072";  
						if( seen > (1*60) ) pos_style += " text-decoration: line-through; text-decoration-color: #F00000;";
						var rssi_style = "";
						if( rssi >= -3.0 ) rssi_style = " color: #FFFFFF; background: #901010; ";
						var distance_style = "";
						if( distance < 50 ) distance_style = " color: #F07072";
						if( distance < 0 ) { distance = " "; distance_style = " color: #000000:"; }
						var squawk_style = "";
						if( squawk == "7700" || squawk == "7600" || squawk == "7500" ) squawk_style = " background: #FF0000; color: #FFFFFF; font-weight: bold;";

						if(selected_icao == icao) flight_style += " border: 1px solid #F01011; border-radius: 3px;";

						var cat_explanation = "";
						switch(cat){
							case "A1" : { cat_explanation = "Class A1: Light"; break; }
							case "A2" : { cat_explanation = "Class A2: Small"; break; }
							case "A3" : { cat_explanation = "Class A3: Large"; break; }
							case "A4" : { cat_explanation = "Class A4: High vortext"; break; }
							case "A5" : { cat_explanation = "Class A5: Heavy"; break; }
							case "A6" : { cat_explanation = "Class A6: High Performance"; break; }
							case "A7" : { cat_explanation = "Class A7: Helicopter"; break; } 
							default: { break; }
						}

						var more_info = "Roll: " + roll + "\nSet heading: " + nav_heading + "\nSet altitude: " + nav_altitude + "\nSet QNH: " + nav_qnh;

						var avail = receiver_label;
						if(position_received==receiver_label) avail = "<span style='color: #80FF81; font-weight: bold;'>" + receiver_label + "</span>";
						if(second_aci && position_received!=second_receiver_label) avail += "+" + second_receiver_label;
						else if(second_aci && position_received==second_receiver_label) avail += "+<span style='color: #50FF51; font-weight: bold;'>" + second_receiver_label + "</span>";

						var flight_title = "ICAO hex: " + icao;
						if(selected_company_name) flight_title += "\nCompany: " + selected_company_name;
						if(selected_company_phrase) flight_title += "\nATC callsign: " + selected_company_phrase + " " + flight.substring(3);

						var near_airport = "", landing_departing = "";
						var ld_style = "text-align: center;";
						var ld_title = "";
						if( altitude < 10000 ){ // determine landing and departing aircrafts
							if( cat != "" && cat != "A1" && cat != "A7" ) // forget about light aircrafts and helicopters (too vague conditions for those)
								if( rate > 500 ){ // over +500 ft/min, could be departing if near runway
									for(i=0; i<nearest_longer_runways.length; i++){
										// within 30 miles (although not nautical miles)
										if(getDistanceFromLatLonInKm(nearest_longer_runways[i][4],nearest_longer_runways[i][5],lat,lon,'m')<30){
											near_airport = nearest_longer_runways[i][0];
											landing_departing = "D";
											ld_style += " background: #FFFFFF; color: #006F00;";
											ld_title = "Most likely departing from " + near_airport;
											break;
										}
									}
								} else if( rate < -250 ){ // steeper than -250 ft/min, could be landing if near runway
									for(i=0; i<nearest_longer_runways.length; i++){
										// within 30 miles (although not nautical miles)
										if(getDistanceFromLatLonInKm(nearest_longer_runways[i][4],nearest_longer_runways[i][5],lat,lon,'m')<30){
											near_airport = nearest_longer_runways[i][0];
											landing_departing = "L";
											ld_style += " background: #FFFFFF; color: #FF0000;";
											ld_title = "Most likely landing to " + near_airport;
											break;
										}
									}
								}
						}

						// update circular and altitude statistics
						if( lat && lon ){
							if(position_received==receiver_label){ 
								var angle = Math.floor(getAngleBetweenTwoLatLon(receiver_lat,receiver_lon,lat,lon));
								// [receiver_label, angle (in int 0-359), min_distance, max_distance, max_distance_rssi, min_alt, max_alt, max_lat, max_lon]
								for(i=0;i<360;i++){
									if(receiver_circular_stats[i][0] == receiver_label && receiver_circular_stats[i][1] == angle){
										if(distance < receiver_circular_stats[i][2]){ receiver_circular_stats[i][2]=distance; receiver_circular_stats[i][5]=altitude; }
										if(distance > receiver_circular_stats[i][3]){ receiver_circular_stats[i][3]=distance; receiver_circular_stats[i][4]=rssi; receiver_circular_stats[i][6]=altitude; receiver_circular_stats[i][7]=lat; receiver_circular_stats[i][8]=lon; }
										break;
									} 
								}
							} 
						}

						outHTML += "<td style='"+ pos_style + flight_style +"' onmouseover='showFD(\"" + flight + "\")' onmouseout='hideFD()'  onclick='clickOpenFD(\"" + flight + "\")' title='" + flight_title + "'>" + flight + "</td><td style='"+ pos_style +"' title='" + cat_explanation +"'>" + cat + "</td><td style='"+ pos_style +"' title='" + more_info + "'>" + track + "</td><td style='"+ pos_style + squawk_style +"' title='" + flight_title + "'>" + squawk + "</td><td style='"+ pos_style +"'>" + altitude + "</td><td style='"+ pos_style +"'>" + rate + "</td><td style='"+ pos_style +"'>" + Math.floor(gs) + "</td><td style='"+ pos_style +"'>" + Math.floor(tas) + "</td><td style='" + pos_style + distance_style + "'>" + Math.floor(distance) + "</td><td style='"+ pos_style + rssi_style + "'>" + rssi + "</td><td style='"+ pos_style + seen_style + "'>" + seen + "</td><td style='"+ pos_style + "'>" + msgs + "</td><td style='"+ pos_style + "'>" + avail + "</td><td style='"+ pos_style + ld_style + "' title='"+ ld_title +"'><a href='#" + near_airport + "'>" + landing_departing + "</a></td>"; 

						outHTML += "</tr>";
						//console.log( "|" + al.innerHTML + "|" );

						// refresh altimeter graph
						if( altitude > 0 ){
							if(canvas.getContext){
								const ctx = canvas.getContext("2d");
								if(flight)
									drawLine(ctx,[56,500-(altitude/100)],[69,500-(altitude/100)],'red',1);
								else
									drawLine(ctx,[56,500-(altitude/100)],[69,500-(altitude/100)],'darkyellow',1);
								var rate_prefix = " ";
								if(rate>70) {
									rate_prefix = "↑";
									ctx.fillStyle = "#10FF11";
								} else if (rate<-70) {
									rate_prefix = "↓";
									ctx.fillStyle = "#FF2021";
								} else { 
									ctx.fillStyle = "#8080FF";
								}
								if(selected_icao == icao)
									ctx.fillStyle = "magenta";
								ctx.font = "small-caps normal 9px sans-serif";
								if( seen < 20 ){
									ctx.fillText(rate_prefix + " " + flight,74,500-(altitude/100)+4);
									ctx.fillText((Math.floor(altitude/100)),31,500-(altitude/100)+4);
								}	
							}
						}

						// update map
						if( lat!=null && lon!=null ) 
						{
							// add position marker
							if(cat=="A4" || cat == "A5" || cat == "A6"){ // High vortex, heavy and high performance/super heavy
								var ac = L.rectangle([[lat-(zoom_correction_lat*1.5), lon-(zoom_correction_lon*1.5)], [lat+(zoom_correction_lat*1.5),lon+(zoom_correction_lon*1.5)]], {
									color: '#00FF00',
									fillColor: '#000',
									fillOpacity: 0.9,
									radius: 2300
								}).addTo(layerGroup).on('click', function(e){ selectAircraft(this.icaoHex, this.flight); });
								var ac_inner = L.rectangle([[lat-zoom_correction_lat, lon-zoom_correction_lon], [lat+zoom_correction_lat,lon+zoom_correction_lon]], {
									color: '#F09F00',
									fillColor: '#000',
									fillOpacity: 0.9,
									radius: 2300
								}).addTo(layerGroup).on('click', function(e){ selectAircraft(this.icaoHex, this.flight); });
								ac.on('dblclick', function(e){ selectAndLockAircraft(this.icaoHex, this.flight); });
								ac_inner.on('dblclick', function(e){ selectAndLockAircraft(this.icaoHex, this.flight); });
								ac.icaoHex = icao; ac_inner.icaoHex = icao;
								ac.flight = flight; ac_inner.flight = flight;
							}
							else if(cat=="A7"){  // Helicopter
								var ac = L.circle([lat, lon], {
									color: '#00F0FF',
									fillColor: '#000',
									fillOpacity: 0.7,
									radius: 1500
								}).addTo(layerGroup).on('click', function(e){ selectAircraft(this.icaoHex, this.flight); });
								var ac_inner = L.rectangle([[lat-zoom_correction_lat, lon-zoom_correction_lon], [lat+zoom_correction_lat,lon+zoom_correction_lon]], {
									color: '#00FF00',
									fillColor: '#000',
									fillOpacity: 0.9,
									radius: 2300
								}).addTo(layerGroup).on('click', function(e){ selectAircraft(this.icaoHex, this.flight); });
								ac.on('dblclick', function(e){ selectAndLockAircraft(this.icaoHex, this.flight); });
								ac_inner.on('dblclick', function(e){ selectAndLockAircraft(this.icaoHex, this.flight); });
								ac.icaoHex = icao;
								ac.flight = flight;
							}
							else if(cat.substring(0,1)=="A" || cat.substring(0,1) == ""){ // small, medium, large
								var ac = L.rectangle([[lat-zoom_correction_lat, lon-zoom_correction_lon], [lat+zoom_correction_lat,lon+zoom_correction_lon]], {
									color: '#00FF00',
									fillColor: '#000',
									fillOpacity: 0.9,
									radius: 2300
								}).addTo(layerGroup).on('click', function(e){ selectAircraft(this.icaoHex, this.flight); });
								ac.on('dblclick', function(e){ selectAndLockAircraft(this.icaoHex, this.flight); });
								ac.icaoHex = icao;
								ac.flight = flight;
							} 
							else { // other (should not be availble, but for failsafe)
								var ac = L.rectangle([[lat-0.00001, lon-0.00002], [lat+0.0001,lon+0.00002]], {
									color: '#FF00FF',
									fillColor: '#000',
									fillOpacity: 0.9,
									radius: 100
								}).addTo(layerGroup).on('click', function(e){ selectAircraft(this.icaoHex, this.flight); });
								ac.on('dblclick', function(e){ selectAndLockAircraft(this.icaoHex, this.flight); });
								ac.icaoHex = icao;
								ac.flight = flight;
							}
							// add heading line, variable by ground speed - indicating the ac position in the next 1 min if speed and heading are preserved
							var speed_km = gs *1.852;
							var headline_len = speed_km / 60;                           
							nextpoint_lat = 0; nextpoint_lon = 0;
							if( track ) calcNextPoint(lat,lon,track,headline_len); // indicator with km distance calculated from gs
							if( nextpoint_lat != 0 && nextpoint_lon != 0 ) {
								var headline = L.polyline([ [lat,lon],[nextpoint_lat,nextpoint_lon] ], { color: 'yellow', weight: 2, opacity: 0.5, smoothfactor: 1 }).addTo(layerGroup);
							}
							// add selected circle and update additional information if selected aircraft
							if(selected_icao==icao){
								if(!selected_lock_on){
									var selected_circle = L.circle([lat,lon], { radius: 1500, color: '#FF0002', weight: 2 }).addTo(layerGroup).on('click', function(e) { selected_icao = ""; selected_flight = ""; });; // add 1.5km radius circle to selected aircraft, click to remove the selection
									selected_circle.on('dblclick', function(e){ selectAndLockAircraft(this.icaoHex, this.flight); });
									selected_circle.icaoHex = icao;
									selected_circle.flight = flight;
								} else {
									var selected_circle = L.circle([lat,lon], { radius: 1500, color: '#FF00F2', weight: 2 }).addTo(layerGroup).on('click', function(e) { selected_icao = ""; selected_flight = ""; });; // add 1.5km radius circle to selected aircraft, click to remove the selection									
									selected_circle.on('dblclick', function(e){ selectAndLockAircraft(this.icaoHex, this.flight); });
									selected_circle.icaoHex = icao;
									selected_circle.flight = flight;
								}
								selected_ac_squawk = squawk;
								selected_ac_tas = tas;
								selected_ac_gs = gs;
								selected_ac_track = track;
								selected_ac_rate = rate;
								selected_ac_rssi = rssi;
								selected_ac_msgs = msgs;
								selected_ac_seen = seen;								
							}
							// add glide range, if showing enabled and selected
							if(selected_icao==icao && selected_glide_range_enabled && altitude && track){
								var glide_range = ((altitude*0.3048)/1000) * selected_glide_range_ratio;
								var azimuth1 = track - selected_glide_azimuth;
								if(azimuth1<0)azimuth1=360+azimuth1;
								var azimuth2 = track + selected_glide_azimuth;
								if(azimuth2>360)azimuth2 = azimuth2-360;
								// console.log(azimuth1 + " - " + azimuth2 + " : " + glide_range);
								nextpoint_lat = 0; nextpoint_lon = 0;
								if( track ) calcNextPoint(lat,lon,azimuth1,glide_range);
								var gr_a1 = L.polyline([ [lat,lon],[nextpoint_lat,nextpoint_lon] ], { color: '#8080F1', weight: 1, opacity: 0.5, smoothfactor: 1 }).addTo(layerGroup);
								nextpoint_lat = 0; nextpoint_lon = 0;
								if( track ) calcNextPoint(lat,lon,azimuth2,glide_range);
								var gr_a2 = L.polyline([ [lat,lon],[nextpoint_lat,nextpoint_lon] ], { color: '#8080F1', weight: 1, opacity: 0.5, smoothfactor: 1 }).addTo(layerGroup);
							}
							// add tooltip text
							var st_track = "-";
							if( track )st_track = Math.floor(track);
							var	st_alt = "FL" + Math.floor(altitude/100),
								st_rate = "-",
								st_squawk = "[<span style='color: #9092e0;'>" + squawk + "</span>]";
							if( !aci.squawk )st_squawk = ""; 
							if( (squawk == "7700") || (squawk == "7600") || (squawk == "7500") )
								st_squawk = "<span style='background-color: #ff0000; color: #ffffff; font-size: 1.1em; animation: blinker 1s linear infinite;'><b> EM </b> [" + squawk + "]</span>";
							if( altitude < 5000 ) st_alt = altitude;
							if( rate > 0 ) st_rate = "&uarr;<span style='color:#40c041;'>" + rate + "</span>";
							if( rate < 0 ) st_rate = "&darr;<span style='color:#c04041;'>" + (-rate) + "</span>";
							if( cat == "A7" )
								st_squawk += "<i> helo </i>";
							var tt_offset = [40,13];
							if( mymap.getZoom() == 9 ) tt_offset = [40,17];
							if( mymap.getZoom() == 10 ) tt_offset = [40,20];
							if( mymap.getZoom() == 11 ) tt_offset = [40,23];
							if( mymap.getZoom() == 12 ) tt_offset = [40,29];
							if( mymap.getZoom() == 13 ) tt_offset = [40,34];
							if( mymap.getZoom() >= 14 ) tt_offset = [40,52];
							if( !flight && !squawk )
								ac.bindTooltip(" " + st_track + "&deg; " + Math.floor(gs) + " " + st_alt + " " + st_rate, { permanent: true, direction: 'center', offset: tt_offset });
							else
								ac.bindTooltip("<span style='color: #70f072;'><b>" + flight + "</b></span> " + st_squawk + "<br/>" + st_track + "&deg; " + Math.floor(gs) + " " + st_alt + " " + st_rate, { permanent: true, direction: 'center', offset: tt_offset });
							// if selected lock on, follow aircraft
							if( selected_icao == icao && selected_lock_on && lat && lon){
								mymap.flyTo(new L.LatLng(lat,lon));
							}
						}
					}

					// sort by the true distance, column 4 [icao, flight, distance, altitude difference, true_distance, bearing, lat, lon, track]
					distance_to_selected.sort(sort_distance_to_selected);

					// Add distance line to (nearest) other aircraft
					if(selected_icao){
						if(distance_to_selected.length > 1){
							// [icao, flight, distance, altitude difference, true_distance, bearing, lat, lon, track]
							var closest_selected_lat = distance_to_selected[0][6];
							var closest_selected_lon = distance_to_selected[0][7];
							var closest_lat = distance_to_selected[1][6];
							var closest_lon = distance_to_selected[1][7];
							var closest_true_distance = distance_to_selected[1][4]; // in km
							var closest_true_distance_nm = closest_true_distance * 0.539957 // in nautical miles
							var closest_line = L.polyline([ [closest_selected_lat,closest_selected_lon],[closest_lat,closest_lon] ], { color: 'red', weight: 1, opacity: 0.5, smoothfactor: 1 }).addTo(layerGroup);
							closest_line.bindTooltip(closest_true_distance.toFixed(1) + " km<br>" + closest_true_distance_nm.toFixed(1) + " nm", { permanent: true, direction: 'center', offset: [0,0] });
						}
					}

					// Add distance line to selected runway threshold
					if(selectedAirportRunway_lat && selectedAirportRunway_lon && selected_lat && selected_lon && selected_icao){
						var selected_runway_line = L.polyline([ [selected_lat,selected_lon],[selectedAirportRunway_lat,selectedAirportRunway_lon] ], { color: '#20F12F', weight: 1, opacity: 0.5, smoothfactor: 1 }).addTo(layerGroup);
						var distance_to_runway = getDistanceFromLatLonInKm(selected_lat,selected_lon,selectedAirportRunway_lat,selectedAirportRunway_lon,'km');
					 	var distance_to_runway_nm = distance_to_runway * 0.539957; // in nautical miles
						selected_runway_line.bindTooltip(distance_to_runway.toFixed(1) + " km<br>" + distance_to_runway_nm.toFixed(1) + " nm", { permanent: true, direction: 'center', offset: [0,0] });
					} 

					al.innerHTML = outHTML; // populate aircraft table
					sortTable("aircrafts",aircrafts_table_sort_col,aircrafts_table_sort_ascending,aircrafts_table_sort_numeric); // sort by column 8 = distance, ascending, numeric information
					//debugTable();
					// insert footer with total counts to stats
					var footHTML = "";
					footHTML = "<tr>";
					footHTML += "<td style='text-align: right; font-size: 0.9em; font-weight: bold;'>" + ac_count + "</td>";
					footHTML += "<td colspan='2'>aircrafts in total</td>";					
					footHTML += "<td style='text-align: right; font-size: 0.9em; font-weight: bold;'>" + ac_with_pos_count + "</td>";
					footHTML += "<td colspan='2'>with positions</td>";
					footHTML += "<td style='text-align: right; font-size: 0.9em; font-weight: bold;'>" + ac_max_distance + "</td>";
					footHTML += "<td colspan='2'>km max dist.now</td>";
					/*					
					footHTML += "<td style='text-align: right; font-size: 0.9em; font-weight: bold;'>" + ac_msgs + "</td>";					
					footHTML += "<td colspan='2'>msgs</td>";					
					*/
					footHTML += "<td style='text-align: right; font-size: 0.9em; font-weight: bold;'>" + ac_max_distance_all_time + "</td>";
					footHTML += "<td colspan='2'>km this session</td>";					
					footHTML += "</tr>";
					document.getElementById("stats-footer").innerHTML = footHTML;					

				} else {
					JSONError=="http://" + receiver_domain + receiver_url_path; 
					receiver_ok = false;
					// document.getElementById("ecam-display").value += "  ADSB 1 FAIL"; 
				}
			}
		);
	}

	function selectAircraft(icao, flight){
		mymap.doubleClickZoom.disable();
		selected_clicked = true;
		if(icao!=selected_icao){
			selected_icao = icao; selected_flight = flight;
		}
		else{
			selected_icao = ""; selected_flight = "";
		}
		updateSelectedACInfo(true);
		setTimeout(function(){ mymap.doubleClickZoom.enable();}, 1000);
	}

	function selectAndLockAircraft(icao, flight){
		selectAircraft(icao,flight);
		if(!selected_icao){ selected_lock_on = false; return; }
		if(!selected_lock_on) selected_lock_on = true;
		else selected_lock_on = false;
	}
	
	function updateSelectedACInfo(init = false){
		if(selected_icao && (document.getElementById("map-ac-info"))) document.getElementById("map-ac-info").style.display = "table";
		else {
			document.getElementById("map-ac-info").style.display = "none";
			selected_ac_tas = 0;
			selected_ac_gs = 0;
			selected_ac_track = 0;
			selected_ac_rate = 0;
			selected_ac_rssi = 0;
			selected_ac_msgs = 0;
			selected_ac_seen = 0;		
			selected_ac_squawk = "";
		} 
		if(init){
			document.getElementById("map-ac-info-flight").innerHTML = selected_flight;
			document.getElementById("map-ac-info-hex").innerHTML = selected_icao;
			if(selected_ac_extra_info){
				document.getElementById("map-ac-info-img").style.display = "table-cell";				
				document.getElementById("map-ac-info-reg").style.display = "table-cell";				
				document.getElementById("map-ac-info-route").style.display = "table-cell";				
				document.getElementById("map-ac-info-manufacturer").style.display = "table-cell";				
				document.getElementById("map-ac-info-type").style.display = "table-cell";				
				document.getElementById("map-ac-info-owner").style.display = "table-cell";				
				fetchACExtraInfo();
			} else {
				document.getElementById("map-ac-info-img").style.display = "none";				
				document.getElementById("map-ac-info-reg").style.display = "none";				
				document.getElementById("map-ac-info-route").style.display = "none";				
				document.getElementById("map-ac-info-manufacturer").style.display = "none";				
				document.getElementById("map-ac-info-type").style.display = "none";				
				document.getElementById("map-ac-info-owner").style.display = "none";				
			}
		}
		if(selected_lat)document.getElementById("map-ac-info-lat").innerHTML = selected_lat.toFixed(4);
		if(selected_lon)document.getElementById("map-ac-info-lon").innerHTML = selected_lon.toFixed(4);
		if(selected_ac_track)document.getElementById("map-ac-info-track").innerHTML = selected_ac_track.toFixed(0) + "&#176;";
		if(selected_ac_squawk)document.getElementById("map-ac-info-squawk").innerHTML = "[ " + selected_ac_squawk + " ]";
		if(selected_altitude)document.getElementById("map-ac-info-altitude").innerHTML = selected_altitude.toFixed(0) + " ft";
		if(selected_ac_rate)document.getElementById("map-ac-info-rate").innerHTML = selected_ac_rate.toFixed(0) + " ft/min";
		if(selected_ac_tas)document.getElementById("map-ac-info-tas").innerHTML = "TAS: " + selected_ac_tas.toFixed(0) + " kn";
		if(selected_ac_gs)document.getElementById("map-ac-info-gs").innerHTML = "GS: " + selected_ac_gs.toFixed(0) + " kn";
		if(selected_ac_rssi)document.getElementById("map-ac-info-rssi").innerHTML = selected_ac_rssi + " dBi";
		if(selected_ac_msgs)document.getElementById("map-ac-info-msgs").innerHTML = selected_ac_msgs.toFixed(0) + " msgs";
		if(selected_ac_seen)document.getElementById("map-ac-info-seen").innerHTML = selected_ac_seen.toFixed(0) + " s ago";
	}

	function clearACExtraInfo(){
		selected_img_src = "";
		selected_ac_reg = "-";
		selected_ac_manufacturer = "-";
		selected_ac_type = "-";
		selected_ac_icao_type = "";
		selected_ac_owner = "-";
		selected_ac_route = "-";

		selected_ac_squawk = "-";
		selected_ac_tas = 0;
		selected_ac_gs = 0;
		selected_ac_track = 0;
		selected_ac_rate = 0;

		selected_ac_rssi = "";
		selected_ac_msgs = 0;
		selected_ac_seen = 0;

		document.getElementById("map-ac-info-img-src").src = selected_img_src;
		document.getElementById("map-ac-info-img-attr").innerHTML = "";
		document.getElementById("map-ac-info-reg").innerHTML = "-";				
		document.getElementById("map-ac-info-route").innerHTML = "-";				

		document.getElementById("map-ac-info-manufacturer").innerHTML = selected_ac_manufacturer;
		document.getElementById("map-ac-info-type").innerHTML = selected_ac_type;
		document.getElementById("map-ac-info-owner").innerHTML = selected_ac_owner;		
	}

	function fetchACExtraInfo(){
		clearACExtraInfo();

		// Image thumbnail from api.joshdouch.me
		fetch(ac_extra_info_url_thumb_image + selected_icao)
		.then(function(resp) { 
			if(resp.ok){
				return resp.text();
			} else {
				document.getElementById("map-ac-info-img").style.display = "none";								
			}
		})
		.then(function(data) {
			if(data){
				selected_img_src = data;
				document.getElementById("map-ac-info-img-src").src = selected_img_src;
				var domain = (new URL(selected_img_src));
				document.getElementById("map-ac-info-img-attr").innerHTML = "&copy; " + domain.hostname;
				document.getElementById("map-ac-info-img").style.display = "table-cell";								
			} else {
				document.getElementById("map-ac-info-img").style.display = "none";								
			}
		})
		.catch(function(error) {
			console.error("Couldn't fetch selected ac thumb image: " + error);
		});

		// Extra information from api.joshdouch.me
		fetch(ac_extra_info_url_details + selected_icao)
		.then(function(resp) { return resp.json(); })
		.then(function(data) {
			if(data.Manufacturer)selected_ac_manufacturer = data.Manufacturer; 
			if(data.Type)selected_ac_type = data.Type; 
			if(data.ICAOTypeCode)selected_ac_icao_type = data.ICAOTypeCode; 
			if(data.RegisteredOwners)selected_ac_owner = data.RegisteredOwners; 

			if(selected_ac_manufacturer)document.getElementById("map-ac-info-manufacturer").innerHTML = selected_ac_manufacturer;
			if(selected_ac_type)document.getElementById("map-ac-info-type").innerHTML = selected_ac_type;
			if(selected_ac_owner)document.getElementById("map-ac-info-owner").innerHTML = selected_ac_owner;
			// console.log("Selected aircraft extra data fetched.");
		})
		.catch(function(error) {
			console.error("Couldn't fetch selected ac extra information: " + error);
		});

		fetch(ac_extra_info_url_reg + selected_icao)
		.then(function(resp) { 
			if(resp.ok){
				return resp.text();
			} else {
				document.getElementById("map-ac-info-reg").innerHTML = "-";				
			}
		})
		.then(function(data) {
			if(data){
				selected_ac_reg = data;
			} else {
				selected_ac_reg = "-";
			}
			document.getElementById("map-ac-info-reg").innerHTML = selected_ac_reg;
		})
		.catch(function(error) {
			console.error("Couldn't fetch selected ac registration: " + error);
		});

		fetch(ac_extra_info_url_route + selected_flight)
		.then(function(resp) { 
			if(resp.ok){
				return resp.text();
			} else {
				document.getElementById("map-ac-info-route").innerHTML = "-";				
			}
		})
		.then(function(data) {
				if(data){
					selected_ac_route = data;
				} else {
					selected_ac_route = "-";
				}
				document.getElementById("map-ac-info-route").innerHTML = selected_ac_route;
		})
		.catch(function(error) {
			console.error("Couldn't fetch selected ac route: " + error);
		});

	}

	var refreshACInfoInterval = setInterval(updateSelectedACInfo, aircraft_refresh_rate);	

	refreshAircrafts();
	var refreshACInterval = setInterval(refreshAircrafts, aircraft_refresh_rate);

	function addTrace(icao, flight, timestamp, lat, lon, altitude, gs, tas, track, rssi){
		cleanTraces(icao);
		var position = 0, found_pos = false;
		for(i=ac_traces.length-1; i>=0; i--){
			if(ac_traces[i][0]!=icao && found_pos) break;
			if(ac_traces[i][0]==icao) { position = i; found_pos = true; }
		}
		if(position==0){
			ac_traces.push([icao,flight,timestamp,lat,lon,altitude,gs,tas,track,rssi]);
		} else {
			ac_traces.splice(position,0,[icao,flight,timestamp,lat,lon,altitude,gs,tas,track,rssi]);			
		}
	}

	function cleanTraces(icao){ // use icao as empty to handle all the traces for those aircraft which doesn't show up anymore
		var position = -1;
		for(i=0; i<ac_traces.length; i++){
			if(icao){
				if(ac_traces[i][0]==icao && ac_traces[i][2]<=(Date.now()-(ac_traces_max_time*1000*ac_traces_time_multiplier))){
					ac_traces.splice(i,1);
					if(position==-1)position=i;
				}
			} else { // clean all the aircrafts
				if(ac_traces[i][2]<=(Date.now()-(ac_traces_max_time*1000*ac_traces_time_multiplier))){
					ac_traces.splice(i,1);				
				}
			}
		}
		return position;
	}

	function showTraces(){
		const color_sooner = "#50A0FF";
		const color_later = "#2070CF";
		var trace_color = color_sooner;
		var current_icao = "";
		var currentpoint_lat = 0, currentpoint_lon = 0;	
		var prevpoint_lat = 0, prevpoint_lon = 0;

		cleanTraces(""); // clean all old before showing
		layerGroupTraces.clearLayers();

		for(i=0; i<ac_traces.length; i++){
			currentpoint_lat = ac_traces[i][3]; currentpoint_lon = ac_traces[i][4];
			if(ac_traces[i][0]!=current_icao){
				current_icao = ac_traces[i][0]; 
				prevpoint_lat = 0; prevpoint_lon = 0;
			}
			if(prevpoint_lat != 0 && prevpoint_lon != 0){
				if((Date.now()-ac_traces[i][2])>(ac_traces_decay_time*1000*ac_traces_time_multiplier)) trace_color = color_later; else trace_color = color_sooner;
				var traceline = L.polyline([ [currentpoint_lat,currentpoint_lon],[prevpoint_lat,prevpoint_lon] ], { color: trace_color, weight: 2, opacity: 0.5, smoothfactor: 1 }).addTo(layerGroupTraces);		
			}
			prevpoint_lat = currentpoint_lat; prevpoint_lon = currentpoint_lon;
		}
	}

	var refreshACTraceInterval = setInterval(showTraces, aircraft_refresh_rate);



	// Since there's no answer from OpenSky Network (question sent Sep 23rd 2021), it's assumed that it's ok to use.
	//
	// Predictive map entries to be fetched from OpenSky public API
	// Fetching every 15 seconds - there's an internal limit in their API of 10 seconds, but
	// limiting the call frequency won't hurt this and definitely will be better for OpenSky Network point of view.
	//
	// ATTN! This is sort of a silent feature since OpenSky prohibits all the commerical usage of their API usage
	// so please do not enable this for other than just own personal / research use!
	//
	// It can be enabled by adding the OpenSky REST API url to config.js
	// var openSkyRestAPIUrl = "https://opensky-network.org/api/states/all";
	//
	// Please read more from The OpenSky Network, https://www.opensky-network.org
	// and https://opensky-network.org/about/terms-of-use
	/*
		Bringing up OpenSky: A large-scale ADS-B sensor network for research
		Matthias Schäfer, Martin Strohmeier, Vincent Lenders, Ivan Martinovic, Matthias Wilhelm
		ACM/IEEE International Conference on Information Processing in Sensor Networks, April 2014
	*/

	var openSkyRestAPIUrl = "https://opensky-network.org/api/states/all";
	var OS_fetch_rate = 15 * 1000; // refresh from OS in 15 seconds = 30000 milliseconds

	var OS_aircrafts = []; // icao, flight, timestamp, squawk, lat, lon, (true) track, gs, (baro) altitude, rate, to_be_shown
	var OS_last_fetch = 0;

	var layerGroupOS = L.layerGroup().addTo(mymap);

	function getOSData(){
		if(!show_open_sky){
			layerGroupOS.clearLayers();
			return;
		}
		if(openSkyRestAPIUrl && (OS_last_fetch < (Date.now() - OS_fetch_rate))){
			var map_bounds = mymap.getBounds();
			var map_bounds_sw = map_bounds.getSouthWest();
			var map_bounds_ne = map_bounds.getNorthEast();

			var openSkyRestAPIRequest = openSkyRestAPIUrl + "?"; 
			openSkyRestAPIRequest += "lamin=" + map_bounds_sw.lat;
			openSkyRestAPIRequest += "&lomin=" + map_bounds_sw.lng;
			openSkyRestAPIRequest += "&lamax=" + map_bounds_ne.lat;
			openSkyRestAPIRequest += "&lomax=" + map_bounds_ne.lng;
			fetch(openSkyRestAPIRequest)
			.then(function(resp) { 
				if(resp.ok){
					return resp.json();
				} else {
				}
			})
			.then(function(data) {
				if(data){
					OS_last_fetch = Date.now();
					if(!data.states)return;
					var oss = data.states;
					var aci = [];
					//console.log(aci);
					// clear the OS_aircrafts first
					while( OS_aircrafts.length > 0 ) OS_aircrafts.pop();

					// populate OS_aircrafts
					for(i=0; i<oss.length; i++) {
						aci = oss[i];
						if(!aci)continue;
						var os_icao = "", os_flight = "", os_timestamp = 0, os_squawk = "", os_lat = 0, os_lon = 0;
						var os_track = 0, os_gs = 0, os_altitude = 0, os_rate = 0;
						var os_on_ground = false;
						os_icao = aci[0];
						os_flight = aci[1]; 
						os_timestamp = aci[3]; // time position
						os_squawk = aci[14];
						os_lat = aci[6];
						os_lon = aci[5];
						os_track = aci[10]; // true track
						os_gs = aci[9]; // originally in m/s
						os_altitude = aci[7]; // baro altitude, originally in meters
						os_rate = aci[11]; // vertical rate, originally in meters per second
						os_on_ground = aci[8];

						if(os_gs) os_gs *= 1.94384; // convert to knots
						if(os_altitude) os_altitude *= 3.28084; // convert to feet
						if(os_rate) os_rate *= 196.85; // convert from m/s to feet per minute

						OS_aircrafts.push([os_icao, os_flight, os_timestamp, os_squawk, os_lat, os_lon, os_track, os_gs, os_altitude, os_rate, true, os_on_ground]);	

					}
					console.log("Fetched " + aci.length + " ac information from OpenSky Network");
				} else {
				}
			})
			.catch(function(error) {
				console.error("Couldn't fetch OpenSky Network predicted aircraft locations: " + error);
			});
		}
		// draw the OpenSky Network flights on the map,
		// do not show the already seen aircraft by the receivers
		layerGroupOS.clearLayers();
		var zoom_correction_lat = 0.01, zoom_correction_lon = 0.02;
		var zoom_level = mymap.getZoom();
		if(zoom_level){
			zoom_correction_lat = 0.01 * (36/Math.pow(zoom_level,2));
			zoom_correction_lon = 0.02 * (36/Math.pow(zoom_level,2));
		}					
		for(i=0; i<OS_aircrafts.length; i++){
			// all_icao_flights[] = icao, flight
			var icao_found_with_pos = false;
			for(ap=0; ap < aircrafts_positions.length; ap++){
				if(aircrafts_positions[ap][3]==OS_aircrafts[i][0]){ // if icao found
					icao_found_with_pos = true; break;
				}
			}
/*
			if(primary_icaos.includes(OS_aircrafts[i][0])){
				OS_aircrafts[i][10] = false;
			} 
*/
			if(!icao_found_with_pos)
			{
				var lat = OS_aircrafts[i][4], lon = OS_aircrafts[i][5];
				var flight = OS_aircrafts[i][1];
				var track = OS_aircrafts[i][6];
				var altitude = OS_aircrafts[i][8];
				var gs = OS_aircrafts[i][7];
				var on_ground = OS_aircrafts[i][11];
				var ac_color = "#808080";
				if(primary_icaos.includes(OS_aircrafts[i][0])) ac_color = "#70B070"; // if icao has been received, but no position, color the marker a bit more
				//console.log(i + " : " + lat + "," + lon + " | " + OS_aircrafts[i]); 
				if(lat && lon){
					if(!on_ground)
						var ac = L.rectangle([[lat-(zoom_correction_lat*1.5), lon-(zoom_correction_lon*1.5)], [lat+(zoom_correction_lat*1.5),lon+(zoom_correction_lon*1.5)]], {
							color: ac_color,
							fillColor: '#000',
							fillOpacity: 0.9,
							radius: 2300
						}).addTo(layerGroupOS).on('click', function(e){  });
					else
						var ac = L.rectangle([[lat-(zoom_correction_lat*0.2), lon-(zoom_correction_lon*0.2)], [lat+(zoom_correction_lat*0.2),lon+(zoom_correction_lon*0.2)]], {
							color: ac_color,
							fillColor: '#000',
							fillOpacity: 0.9,
							radius: 300
						}).addTo(layerGroupOS).on('click', function(e){  });
						
					if(track){ 
						nextpoint_lat = 0; nextpoint_lon = 0;
						var speed_km = gs *1.852;
						var headline_len = speed_km / 60;                           
						calcNextPoint(lat,lon,track,headline_len); // indicator with km distance calculated from gs
						if( nextpoint_lat != 0 && nextpoint_lon != 0 ) {
							var headline = L.polyline([ [lat,lon],[nextpoint_lat,nextpoint_lon] ], { color: "#808020", weight: 2, opacity: 0.5, smoothfactor: 1 }).addTo(layerGroupOS);
							}
					}
					if(flight){
						
						var tt_offset = [10,-13];
						var ground_offset_correction = 0; // if on ground
						if(on_ground) ground_offset_correction = -17;
						if( mymap.getZoom() == 9 ) tt_offset = [10,-17-ground_offset_correction];
						if( mymap.getZoom() == 10 ) tt_offset = [10,-20-ground_offset_correction];
						if( mymap.getZoom() == 11 ) tt_offset = [10,-23-ground_offset_correction];
						if( mymap.getZoom() == 12 ) tt_offset = [10,-29-ground_offset_correction];
						if( mymap.getZoom() == 13 ) tt_offset = [10,-34-ground_offset_correction];
						if( mymap.getZoom() >= 14 ) tt_offset = [10,-52-ground_offset_correction];
						
						//var tt_offset = [0,10];
						var details = "<br/>"
						if(gs) details += "<span style='color: #909092;'>" + gs.toFixed(0) + "</span>";
						if(altitude){
							if(altitude > 3000)
								details += " <span style='color: #909092;'>FL" + (altitude/100).toFixed(0) + "</span>";
							else
								details += " <span style='color: #909092;'>" + (altitude).toFixed(0) + "</span>";
						}						 
						ac.bindTooltip("<span style='color: #90A092;'><b>" + flight + "</b></span>" + details, { permanent: false, direction: 'center', offset: tt_offset });
					}
				}
			}
		}

	}
	var refreshOSInterval = setInterval(getOSData, stats_refresh_rate);
	getOSData();

