# adsbmonitor
Simple ADS-B monitor UI using dump1090-fa JSONs

A very simple, quick and dirty UI using Leaftlet and Mapbox for the map and HTML5 Canvas for the Flight Level indicator and FD mock up.

---
Just add your information directly to the javascript variables in the beginning of the script element.
- receiver_domain = your ADS-B receiver IP / hostname where the dump1090-fa is running (be sure that the host is accepting the requests and accepts CORS)
- receiver_lat & receiver_lon = your receiver latitude and longitude - used in map and disctance calculations
- mapbox_accessToken = your Mapbox public default accesstoken - just create an account in Mapbox and use the default token it creates for you (free-tier usage)
- aircraft_refresh_rate = timer setting for aircraft.json calls for map, FL graph and aircraft list updates
- stats_refresh_rate = timer setting for stats.json calls to refresh the receiver message rate (msgs/s), 5 minute and 15 minute statistics (noise, signal, peak, overall msgs and pos msgs)


---
History

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

---
Feel free to use or modify this to your own needs - there's no guarantee that this would be updated over the time ;-)

Juho

Example (Nov 1st 2021) without weather:
![Example screenshot](https://github.com/juei-dev/adsbmonitor/blob/main/example_screenshot.jpg?raw=true)

Example (Nov 1st 2021) with weather:
![Example screenshot with weather](https://github.com/juei-dev/adsbmonitor/blob/main/example_screenshot_weather.jpg?raw=true)
