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

Oct 31, 2021: Added feature: support for supplementary / secondary receiver. If primary receiver lacks some information, the supplementary receiver data is used if available. Also applies to the position. Additionally, the stats of the supplementary receiver are displayed. And added total row to stats for number of aircrafts, aircrafts with position, max. distance at the time and max. distance of the session (resets on refresh).  

---
Feel free to use or modify this to your own needs - there's no guarantee that this would be updated over the time ;-)


Juho
