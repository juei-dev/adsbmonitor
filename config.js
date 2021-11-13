	var receiver_domain = "192.168.11.9"; // change to primary ADS-B receiver host IP or domainname
	var receiver_lat = 61.0, receiver_lon = 26.0; // change to primary ADS-B receiver location
	var receiver_label = "W"; // change to primary ADS-B receiver label (one character works best)
	var second_receiver_enabled = true; // change this to false, if only one receiver is used
	var second_receiver_domain = "192.168.11.18"; // change to supplementary ADS-B receiver host IP or domainname
	var second_receiver_lat = 61.1, second_receiver_lon = 26.1; // change to supplementary ADS-B receiver location
	var second_receiver_label = "E"; // change to supplementary ADS-B receiver label (one character works best)
	var mapbox_accessToken = "<insert_your_mapbox_public_access_token_here>"; // open an account in Mapbox and place the access token here
	var aircraft_refresh_rate = 2000; // Aircraft json fetch frequency - 1000ms
	var stats_refresh_rate = 3000; // dump1090-fa statistics refresh rate
	var openweathermap_wind_enabled = true; // if you don't want to have openweathermap layers, set these to false 
	var openweathermap_clouds_enabled = true;
	var openweathermap_rain_enabled = true;
	var openweathermap_apikey = "<insert_your_openweathermap_org_api_key_here>"; // open an account in openweathermap.org and place your api key here
	var map_complete_refresh_rate = 15*(60*1000); // to refresh the OWM layers
	var airports_enabled = true;
	var airport_aircraft_refresh_rate = 10*1000; // refresh airport aircrafts every 10 seconds
	var receiver_details_shown = true;
	