
function refreshCompanyList(){
	var ch = document.getElementById("company-head");
	var headHTML = "<th style='text-align: left;' class='company-header'>Company/Flight</th><th style='text-align: center' class='company-header'>Seen</th>";
	ch.innerHTML = headHTML;
	var cl = document.getElementById("company-body");
	var outHTML = "";

	console.log(company_flights);

	for(i=0; i<companies.length; i++){
		var current_company = companies[i][0];
		// first the title of the company as one line
		if(current_company)
			outHTML += "<tr><td colspan='2' class='company-list-name'>" + current_company + "</td></tr>";
		else 
			outHTML += "<tr><td colspan='2' class='company-list-name'>* Unknown *</td></tr>";
		for(c=0; c<company_flights.length; c++){
			if(company_flights[c][0]!=current_company)continue;
			var current_date = new Date();
			var flight_seen_date = new Date();
			var seen_milliseconds = 0;
			flight_seen_date = company_flights[c][2];
			seen_milliseconds = current_date - flight_seen_date;
			var seen_date = new Date(seen_milliseconds);
			if( seen_date.getUTCDate() > 14 )continue; // cut out over 2 weeks old sights of flights (to even somehow prevent too long list)
			outHTML += "<tr>";
			outHTML += "<td><a href='https://flightaware.com/live/flight/" + company_flights[c][1].trim() + "' target='_blank'>" + company_flights[c][1] + "</td>";
			if(seen_date.getUTCDate()>1)
				outHTML += "<td>" + (seen_date.getUTCDate()-1).toFixed(0).padStart(2) + "d " + seen_date.getUTCHours().toFixed(0).padStart(2,"0") + ":" + seen_date.getUTCMinutes().toFixed(0).padStart(2,"0") + ":" + seen_date.getUTCSeconds().toFixed(0).padStart(2,"0") + "</td>";
			else
				outHTML += "<td> &nbsp;&nbsp;&nbsp; " + seen_date.getUTCHours().toFixed(0).padStart(2,"0") + ":" + seen_date.getUTCMinutes().toFixed(0).padStart(2,"0") + ":" + seen_date.getUTCSeconds().toFixed(0).padStart(2,"0") + "</td>";
			outHTML += "</tr>";
		}
	}
	cl.innerHTML = outHTML;
}
var refreshCompaniesInterval = setInterval(refreshCompanyList, airport_aircraft_refresh_rate); // use same refresh interval as the runways
