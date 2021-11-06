# adsbmonitor
*Simple ADS-B monitor UI using dump1090-fa JSONs*

A very simple, quick and dirty UI using Leaftlet and Mapbox for the map and HTML5 Canvas for the Flight Level indicator and FD mock up.

---
**Quick info**

Just add your information directly to the javascript variables in the beginning of the script element.
- receiver_domain = your ADS-B receiver IP / hostname where the dump1090-fa is running (be sure that the host is accepting the requests and accepts CORS)
- receiver_lat & receiver_lon = your receiver latitude and longitude - used in map and disctance calculations
- mapbox_accessToken = your Mapbox public default accesstoken - just create an account in Mapbox and use the default token it creates for you (free-tier usage)
- aircraft_refresh_rate = timer setting for aircraft.json calls for map, FL graph and aircraft list updates
- stats_refresh_rate = timer setting for stats.json calls to refresh the receiver message rate (msgs/s), 5 minute and 15 minute statistics (noise, signal, peak, overall msgs and pos msgs)


---
**History**

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


---
**Current features:**
- OpenStreetMap (using Leaflet) displaying:
	- Aircraft position
	- Aircraft heading/track with a line which end point is in a position where the aircraft would be in one minute if the speed and and track would be the same
	- Aircraft information: 
		- 1st line: callsign and squawk code
		- 2nd line: true heading, speed, flight level / altitude and altitude change (green=up, red=down)
	- All the airports & runways at current zoom level, if enabled. To update airports after map position/zoom change, cycle airport checkbox
	- Weather information from OpenWeatherMap; selectable layers are wind, clouds and/or rain

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
	

---
Feel free to use or modify this to your own needs - there's no guarantee that this would be updated over the time.

Juho

---

Example (Nov 1st 2021) without weather:
![Example screenshot](https://github.com/juei-dev/adsbmonitor/blob/main/example_screenshot.jpg?raw=true)

Example (Nov 1st 2021) with weather:
![Example screenshot with weather](https://github.com/juei-dev/adsbmonitor/blob/main/example_screenshot_weather.jpg?raw=true)

Example (Nov 4th 2021) with FD (slightly modified overall visuals):
![Example screenshot with FD](https://github.com/juei-dev/adsbmonitor/blob/main/example_fd.jpg?raw=true)

Example (Nov 4th 2021) with runways and landing/departing note:
![Example screenshot with runways_and_landing_departing](https://github.com/juei-dev/adsbmonitor/blob/main/example_runways_and_landing_departing.jpg?raw=true)

Example (Nov 6th 2021) runway list with some commercial ACs take-off approximated capabilities in MTOW:
![Example_runway_list_and_TO_length_approximations](https://github.com/juei-dev/adsbmonitor/blob/main/example_runway_list_and_TO_length_approximations?raw=true)
