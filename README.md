# adsbmonitor
*Simple ADS-B monitor UI using dump1090-fa JSONs*

A ~~very~~ quite simple, quick and dirty UI using Leaftlet and Mapbox for the map and HTML5 Canvas for the Flight Level indicator, FD mock up and Receiver Detailed information (distance/direction circle and altitude graph).
All run in client browser, no server-side services / APIs included in this project. But in order to get e.g. runways/airports working, it's recommended to place this to web server and access it from there. 

Beofre updating your environment, please backup your config.js and, providing that there has not been any changes in the new version to the config.js, copy that config.js of yours over the default one after the update. If there's been some changes/additions to config.js in the updated version, modify manually your config.js accordingly.



## Quick info

Just add your information to config.js -file:
- receiver_domain = your ADS-B receiver IP / hostname where the dump1090-fa is running (be sure that the host is accepting the requests and accepts CORS)
- receiver_lat & receiver_lon = your receiver latitude and longitude - used in map and disctance calculations - this is not using dump1090-fa receiver.json just yet
- second_receiver_* -settings as in primary receiver_* -settings for the supplementary receiver information
- mapbox_accessToken = your Mapbox public default accesstoken - just create an account in Mapbox and use the default token it creates for you (free-tier usage)
- aircraft_refresh_rate = timer setting for aircraft.json calls for map, FL graph and aircraft list updates - decrease this if you experience performance issues (default every 2 sec) - I don't recommend go below 1 second, you might experience some "jumping" because previous refresh is not completed before the next one starts
- stats_refresh_rate = timer setting for stats.json calls to refresh the receiver message rate (msgs/s), 5 minute and 15 minute statistics (noise, signal, peak, overall msgs and pos msgs) - decrease this if you experience performance issues (default every 3 secs)
- openweathermap_wind_enabled = enable OpenWeatherMap wind layer feature (requires OpenWeatherMap API key to be in place)
- openweathermap_clouds_enabled = enable OpenWeatherMap clouds layer feature (requires OpenWeatherMap API key to be in place)
- openweathermap_rain_enabled = enable OpenWeatherMap rain layer feature (requires OpenWeatherMap API key to be in place)
- openweathermap_apikey = place your OpenWeatherMap API key here, you can obtain one by creating an account at OpenWeatherMap.org - free plan should be enough providing that you're not manually refreshing the page constantly
- map_complete_refresh_rate = timer setting to force refresh the OpenWeatherMap layers (just to be sure the layers are up-to-date - default every 15 minutes)
- airport_aircraft_refresh_rate = how often the airport list's aircrafts nearby -field is updated - decrease this if you experience performance issues (default every 10 secs)
- receiver_details_shown = enable the distance / direction and alitude graphs

*Please note, that after creating an account at OpenWeatherMap, the API key might take over an hour to be in effect / enabled there.*



## History

Oct 28, 2021: The initial version containing quite lot of bugs and unfinished features. E.g. scrolling / refresh of the aircrafts tends to be very irritating when the list of aircrafts is long. Also FD mock up (hover the mouse over the aircraft callsign to display) has unfinished stuff like pitch calculation and altitude "roller". Additionally, the code is just in one html and requires cleaning up & breaking into several .js -files (preferrably minified). But that comes later. Hopefully.

Oct 30, 2021: Rewrote part of the table code & bug fixes. Added a feature which allows filter/limit infomation on the alti-bar and aircraft table to the visible on the map only 

Oct 31, 2021: Added features: 
  - support for supplementary / secondary receiver. If primary receiver lacks some information, the supplementary receiver data is used if available. Also applies to the position.
  - the stats of the supplementary receiver are displayed
  - total row to stats for number of aircrafts, aircrafts with position, max. distance at the time and max. distance of the session (resets on refresh) 
  - secondary receiver red circle and ac seen older than 1 min with red overstrike

Nov 1, 2021:
  - Enable / disable checkbox for FD display added
  - Added ATC call phrase to the callsign and squawk code list item titles and extended the list of the callsigns (extracted from Wikipedia https://en.wikipedia.org/wiki/List_of_airline_codes)
  - Added openweathermap.org (https://openweathermap.org) layers for wind, clouds and rain. Also added slider for common opacity for those layers. If you don't want to have openweathermap layers, set openweathermap enabled variables to false. 
 
Nov 2, 2021:
  - Added nearest runways to the map using over 42k runway definitions in the csv. Credits to ourairports.com, see ourairports.com/data for more lists.

Nov 3, 2021:
  - Added list of nearest runways under the map. Over 8000 ft long runways are marked with blue background.
  - Added column to aircraft list L/D (Landing / Departing) and populating that with a title and link to bigger airport to which or from which the aircraft is probably landing or departing. Very simple rules, so it's definitely not always right.

Nov 4-5, 2021:
  - Visual changes, made things a bit more "round"
  - Click to aircraft callsign in the aircraft list now flies the map to that particular aircraft
  - Click to airport runway now flies the map to that runway (and scrolls to top)
  - Added Reset map -button
  - Fixed FD display "locking" (if FD display is enabled and mouse click is made to the callsign, the FD stays on)
  - Airports/runways have now near-by aircrafts listed

Nov 6, 2021:
  - Added several commercial AC approximated required runway lengths for takeoff (in MTOW) to runway list
  - Added sorting functionality to aircrafts table (just click the header column)

Nov 7, 2021:
  - New button / checkbox styles in filtering
  - New virtual ECAM to display if weather or airpots are not enabled ("INOP") 

Nov 8, 2021:
  - Layout changes for buttons

Nov 9, 2021:
  - Added receiver reach graph - still not finished yet though
  - Receiver details (main receiver reach circle) is now hidden and can be enabled using RcvDet -button
  - Added receiver minimum altitude / distance graph
  - Finally made even some cleanup and separated all the scripts to distinct js -files and the styles to the own CSS-file

Nov 10, 2021:
  - Added some minor details to main receiver distance / direction circle (RSSI on each 18 degrees recorded and red quadrant lines for max distances in the quadrant)

Nov 11, 2021:
  - Added Leaflet plugin for fullscreen mode via mapbox api, so the map has now full screen -button under the zoom buttons
  - Added noise figures (current, min, max) to the receiver under the distance / direction circle

Nov 13, 2021:
  - Added company flights list under the altimeter graph. All flights are recorded there grouped by the company. Over 14 days old flights are not displayed

Nov 14, 2021:
  - Changes to style (map width scales hopefully now better with bigger monitors), companies flight lists are now collapsed and expandable by company and receiver url paths (for aircrafts and stats) are now able to be changed from config.js. There is still some known issues with company/flight list with unknown companies/call signs.

Nov 15, 2021:
  - Added a button for downloading the receiver circular chart and a toggle for RSSI values to be shown

Nov 16, 2021:
  - Added the supplementary receiver to the receiver details in Receiver Distances / Direction and also added toggle buttons for the main and supplementary receiver
  - Added session timer to distance / direction chart in receiver details 

Nov 18, 2021:
  - The map position and zoom level is set to cookies every time the map is scrolled or zoomed. These values are fetched when the page is loaded or refreshed. This doesn't work without running this on web server since the cookies cannot be set to file -resources.

Nov 21, 2021:
  - Added an Airbus ECAM / Engine parameter -styled receiver statistics gauge display for both receivers having 3 gauges: messages / minute percentage from maximum detected, SNR and PSNR. Also some minor fixes at receiver details have been made.

Nov 22, 2021:
  - Added paging to stats display part and a new page with maximum values of distance, altitude, gs, tas, climb and descent during the session instead of just stats gauges. Also some bugfixes.
  - Added new page to stats display with top 10 companies and number of their flights during the session.
  - Modified stats display company top to top 12 instead of just 10. Also added download -button to stats display.

Nov 25th, 2021:
  - Added 4th screen to stats display for the first 6 emergency aircraft (squawk 7700, 7600, 7500) seen during the session.

Dec 10th, 2021:
  - Added selection feature for the aircrafts. Aircraft can be selected from the list or clicking icon on the map. Map will then show the true distance (altitude difference taken into account - straight vector distance) to the nearest aircraft.

Dec 11th, 2021:
  - Added orange extra rectangle for heavy aircraft and light blue circle for helicopters to map markers. Also changed blinking EM to map marker for the emergency squawks. Fine tuned the location of information tooltip of map marker to adapt to the zoom level.    

Dec 12th, 2021:
  - Added list of 5 closest aircrafts of selected aircraft to the stats display page 5

Dec 14th, 2021:
  - Added an option to change between 4 different Mapbox map styles (dark, satellite, satellite with streets and dark navigation). On the map there is now a small preview icon at the top right corner of the next style and by clicking that the map style changes. It also sets the selection to the cookies, so the setting will be remembered.  

Dec 15th, 2021:
  - Added glide range marker lines to the map for selected aircraft in assumption of 1:15 glide-ratio and using ac current altitude. Range marker angle is +-45 degrees from the ac current track. So a very rough estimate of all-engine failure absolute maximum glide range for bigger commercial aircraft (having glide ratios of 1:15 - 1:20). Also fixed bug with A4-A6 category aircraft selection from the map (mouse click should select those a bit better now).

Dec 16th, 2021:
  - Added fifth "map" as blank map. When displaying the blank map, the distance circles are added per each 100km up to 400km.

Dec 17th, 2021:
  - Airport runways / runway thresholds are now able to be selected. Click the airport's runway and the closest threshold will be selected. If an aircraft is also selected, a green direct line is drawn to this selected runway threshold and distance is shown (currently it's not actual, but lateral distance). 

Dec 18th, 2021:
  - Added weather information to the runway selected. Selecting runway is delayed for 1 sec to allow weather data fetch to be completed.

Dec 25th, 2021:
  - Added double click feature to the map which is locking on to the selected aircraft and keeps it always in the center ("travels" with the aircraft). Double click again to disable lock on.

Dec 26th, 2021:
  - Added information table to map, which is displaying the selected aircraft image (if found), type, airliner etc. Thanks to api.joshdouch.me to provide this information!

Dec 27th, 2021:
  - Added the alti-bar and receiver status information to map when displayed in full screen. Also made some modifications to the styles.

Dec 28th, 2021:
  - Added map click event, which will select the closest aircraft to the point of click providing it's within 10 km radius of clicked position. This fixes the previous difficulty of selecting aircraft by clicking on the map.

Dec 29th, 2021:
  - Bugfix: deselecting aircraft didn't work correctly if clicked nearby in the map. Now, if the same aircraft is selected, selection will be removed if clicked close by of the selected aircraft. 
  - Added strong signal percentage (during last 1 minute) to full screen map statistics box.

Dec 30th, 2021:
  - Bugfix: full screen map receiver stats strong signals didn't count all the accepted messages. Now the strong signal percentage is calculated against all the accepted messages.
  - Added count of aircraft with and without position to the full screen map statistics.
  - Selected aircraft now leaves a blue trace (1min ago bright blue, 1-2min ago darker blue).

Dec 31st, 2021:
  - Added buttons to map bottom right to toggle trace all aircraft, trace selected aircraft and fetch extra information for selected aircraft.

Jan 1st, 2022:
  - Added a button to the bottom left of map which is toggling the distance radius circles from the main receiver (each circle 100km away).

Jan 3rd, 2022:
  - Changed button positions a bit on the map.
  - Added also a COVR button to the map (bottom left) which will toggle receiver coverage lines on and off. This differes slightly to the receivers / antenna circular distance / direction graph, because that is on a flat plane base and the map coverage is in spheroid base.

Jan 6th, 2022:
  - Slight change to presentation of receiver coverage on the map.

Jan 8th, 2022:
  - Since there was no answer from the OpenSky Network (question if this is ok to be done sent on September), I'll take that as usage approved. Please note that any kind of commercial usage of OpenSky Network data cannot be done. That is only for personal and research purposes.
  - So added OpenSky Network call to fetch ALL the other aircraft than the dump1090-fa received and a button called SOSN, which will toggle showing those aircraft on the map. The data fetch is done every 15 seconds in order to throttle the API calls to OSN.


## Current features

- OpenStreetMap (using Leaflet) displaying:
	- Aircraft position
	- Aircraft heading/track with a line which end point is in a position where the aircraft would be in one minute if the speed and and track would be the same
	- Aircraft information: 
		- 1st line: callsign and squawk code
		- 2nd line: true heading, speed, flight level / altitude and altitude change (green=up, red=down)
	- All the airports & runways at current zoom level, if enabled. To update airports after map position/zoom change, cycle airport checkbox
	- Weather information from OpenWeatherMap; selectable layers are wind, clouds and/or rain
	- Full screen possibility via Mapbox plugin

- Mockup FD (not completed though) - can be displayed by hovering mouse over the aircraft callsign

- Altitude / Flight Level Indicator of all the aircrafts visible on the map / on the table (if altitude information received)

- Receiver status information:
	- Supports primary receiver and a supplementary receiver
	- Displays:
		- Current message rate (msgs / second)
		- Last 5 min and 15 min peak, signal and noiselevels, messages and position messages in respective timeframe
		- Aircrafts in total received and aircrafts with position messages received
		- Maximum distance in currently shown aircrafts and in total in session (refresh will reset the max distance)

- Filtering options:
	- Filter aircrafts visible on the map 
		- When zooming in, the list of the aircrafts and Flight Level Indicator will display only those aircrafts which are visible on the map
		- Also limits the aircrafts to those which have position information
	- Enable / disable FD mockup display
	- Weather information:
		- Winds, Clouds and Rain map overlays
		- Range slider for the overlays opacity
	- Airports toggle
		- List of over 42000 runways is used to draw all the runways in visible map
		- Overall list credits to ourairports.com, see ourairports.com/data for more lists.
		- Toggle on & off to refresh the runways displayed (dragging the map or zooming out won't refresh automatically those yet)
		- Bigger (over 8000ft) runways are drawn with magenta color in the map and highlighted in blue background in the runway list under the map
		- Also the bigger airports (with over 8000ft runways) are used to detect if and aircraft is landing or departing to or from it. Must be within 30 miles of the airport, under 1000ft of alitude and descenting or climbing in certain rate
	
- List of the aircraft information from primary receiver added by the information for supplementary receiver
	- Columns:
		- Callsign - hover mouse over to either display FD mockup and/or extra information:
			- ICAO hex number
			- Aircraft company name
			- ATC resolved call sign (used in radio communications)
		- Cat - A category of the aircraft, hover mouse to check explanation
		- Track - a heading of the aircraft, hover mouse to check aircraft's current Roll, A/P set heading, altitude and QNH
		- Squawk code - hover over for the same information as in callsign (useful when FD display enabled)
		- Alt - an altitude of an aircraft in feet
		- Rate - Climb/descent rate in feet/min
		- GS - Ground speed
		- TAS - True air speed
		- Dist - Distance from the primary (or supplementary, if no primary position information available) receiver in kilometers
		- RSSI - signal level of last message (not only position messages), if over -3 dBi, background will be red (a bit too strong signal)
		- Seen - seconds from the last message received, if over 15s, the data will be in red, if over 60, the data will have red strike through line
		- Msgs - number of all the messages received for this aircraft
		- Recvd - Primary + Supplementary label shown respectively which has information of this aircraft, greened label for which has the position information
		- L/D - Possibly landing or departing aircraft detected - hover to check which airport and click to scroll to runway description of given bigger airport
	- In general, if primary receiver information lacks of some information, the supplementary information will be used
	- If position is not known by the primary receiver, the possible supplementary receiver position information is used
	
- Receiver detailed information (per session)
	- Distances / direction circle (like an antenna radiation pattern) with RSSI information for each 18 degree increment (if that exact degree has been recorded) and red line per each quadrant for maximum distances
	- Distances / direction circle has following capabilities:
		- Displaying main receiver SNR and Noise
		- Download JPG -button
		- Switch RSSI for main receiver on/off
		- Switch main receiver pattern on/off
		- Switch supplementary receiver pattern on/off
		- If both patterns are on, main receiver pattern is displayed over supplementary receiver pattern, but with small transparency.
		- Session timer showing time from last page refresh or initial load of the page
	- Minimum altitude / distance graph

- Statistics display
	- Page 1: Gauges for both receivers - M1% (messages/min % from maximum this session), SNR and PSVR
	- Page 2: Maximum values during session - Distance, altitude, GS, TAS, Climb rate and Descent rate
	- Page 3: Top 12 companies during the session and number of flights
	- Page 4: Emergency flights recorded during the session
	- Page 5: 5 nearest aircrafts to the selected aircraft
	- Download option for all of the displays

- Selectable aircraft and runway
	- If aircraft is selected, the true distance (vector distance) to closest aircraft is shown. Also +-45 degree gray guidelines are shown to approximate the glide distance of the aircraft (just 15:1 glide ratio and ac altitude used, so only as a reference)  
	- If runway (threshold) is selected, weather information is fethced from OpenWeatherMap
	- If both aircraft and runway is selected, the lateral distance is shown from the runway threshold to the selected aircraft

- Open Sky Network data for other aircraft than received ones
	Bringing up OpenSky: A large-scale ADS-B sensor network for research
	Matthias Schäfer, Martin Strohmeier, Vincent Lenders, Ivan Martinovic, Matthias Wilhelm
	ACM/IEEE International Conference on Information Processing in Sensor Networks, April 2014
	The OpenSky Network, http://www.opensky-network.org



---

Feel free to use or modify this to your own needs - there's no guarantee that this would be updated over the time.

Juho

---

### Examples

Example (Nov 18th 2021):
![Example screenshot](https://github.com/juei-dev/adsbmonitor/blob/main/screenshots/example_screenshot.jpg?raw=true)

Example (Nov 18th 2021) with FD (slightly modified overall visuals):
![Example screenshot with FD](https://github.com/juei-dev/adsbmonitor/blob/main/screenshots/example_fd.jpg?raw=true)

Example (Nov 18th 2021) runway list with some commercial ACs take-off approximated capabilities in MTOW:
![Example_runway_list_and_TO_length_approximations](https://github.com/juei-dev/adsbmonitor/blob/main/screenshots/example_runway_list_and_TO_length_approximations.jpg?raw=true)

Example (Nov 18th 2021) receiver reach:
![Example_receiver_reach](https://github.com/juei-dev/adsbmonitor/blob/main/screenshots/example_receiver_reach.jpg?raw=true)

Example (Nov 18th 2021) downloadable receiver distance / direction JPG image:

![Example_circular_chart](https://github.com/juei-dev/adsbmonitor/blob/main/screenshots/example_circular_chart.jpg?raw=true)

Example (Nov 21th 2021) statistics gauge display:
![Example_stats_display](https://github.com/juei-dev/adsbmonitor/blob/main/screenshots/example_stats_display.jpg?raw=true)

Example (Dec 11th 2021) selected aircraft with true distance to closest aircraft:
![Example_distance](https://github.com/juei-dev/adsbmonitor/blob/main/screenshots/Example_distance.JPG?raw=true)

Example (Dec 12th 2021) selected aircraft 5 closest aircrafts list in stats display:
![Example_distance_list](https://github.com/juei-dev/adsbmonitor/blob/main/screenshots/Example_distance_list.JPG?raw=true)

Example (Dec 18th 2021) selected runway threshold and selected aircraft:
![Example_runway_info_distance_to_aircraft](https://github.com/juei-dev/adsbmonitor/blob/main/screenshots/example_runway_info_distance_to_aircraft.jpg?raw=true)

Example (Dec 18th 2021) selected runway threshold and selected aircraft:
![Example_runway_info_distance_to_aircraft_fullscreen](https://github.com/juei-dev/adsbmonitor/blob/main/screenshots/example_runway_info_distance_to_aircraft_fullscreen.jpg?raw=true)

Example (Dec 26th 2021) selected aircraft extra information:
![Example_extra_selected_ac_informationn](https://github.com/juei-dev/adsbmonitor/blob/main/screenshots/example_extra_selected_ac_information.jpg?raw=true)

Example (Dec 27th 2021) full screen map alti-bar and receiver status information:
![Example_fullscreen_altibar_and_receiver_stats](https://github.com/juei-dev/adsbmonitor/blob/main/screenshots/example_fullscreen_altibar_and_receiver_stats.jpg?raw=true)

Example (Dec 31st 2021) full screen map trace aircraft and new toggle buttons at bottom right:
![Example_map_traces_and_buttons](https://github.com/juei-dev/adsbmonitor/blob/main/screenshots/example_map_traces_and_buttons.jpg?raw=true)
