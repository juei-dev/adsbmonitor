var opened_company = "-";

function openCompany(company){
	if(company!=opened_company.replace(" ","_")){
		//console.log("this: '" + company + "'");
		if(opened_company){
			var rows = document.getElementsByClassName("flt_"+opened_company.replace(" ","_"));
			//console.log("previous: '" + opened_company + "'");
			if(opened_company!="-"){
				document.getElementById("hdr_" + opened_company.replace(" ","_")).innerHTML = " + "; 
				for(i=0; i<rows.length; i++){
					rows[i].style.display = "none";
				}
			}
		}
		opened_company = company.replace("_", " ");
		var rows = document.getElementsByClassName("flt_"+company);
		document.getElementById("hdr_" + company).innerHTML = "&nbsp;- "; 
		for(i=0; i<rows.length; i++){
			rows[i].style.display = "";
		}
	} else {
		opened_company = "-";
		var rows = document.getElementsByClassName("flt_"+company);
		document.getElementById("hdr_" + company).innerHTML = " + "; 
		for(i=0; i<rows.length; i++){
			rows[i].style.display = "none";
		}
		//document.getElementsByClassName(company).style.display = "none";		
	}
}

function refreshCompanyList(){
	var ch = document.getElementById("company-head");
	var headHTML = "<th class='company-header' style='width: 15px;'>&nbsp;</th><th style='text-align: left;' class='company-header'>Company/Flt</th><th style='text-align: center' class='company-header'>Seen</th>";
	ch.innerHTML = headHTML;
	var cl = document.getElementById("company-body");
	var outHTML = "";

	//console.log(company_flights);

	for(i=0; i<companies.length; i++){
		var current_company = companies[i][0];
		//if(!current_company)current_company = "unknown";
		// first the title of the company as one line
		if(current_company){
			if(opened_company==current_company){
				outHTML += "<tr><td id='hdr_" + current_company.replace(' ','_') + "' onClick='openCompany(\"" + current_company.replace(' ','_') + "\")' class='company-list-name' style='cursor: pointer;'>&nbsp;- </td><td colspan='2' class='company-list-name'>" + current_company + "</td></tr>";
			}
			else if((opened_company=="unknown") && (current_company=="")){
				outHTML += "<tr><td id='hdr_unknown' onClick='openCompany(\"unknown\")' class='company-list-name' style='cursor: pointer;'> - </td><td colspan='2' class='company-list-name'>* Unknown *</td></tr>";
			}
			else if(current_company!="-") {
				outHTML += "<tr><td id='hdr_" + current_company.replace(' ','_') + "' onClick='openCompany(\"" + current_company.replace(' ','_') + "\")' class='company-list-name' style='cursor: pointer;'> + </td><td colspan='2' class='company-list-name'>" + current_company + "</td></tr>";
			}
		}
		else 
			outHTML += "<tr><td id='hdr_unknown' onClick='openCompany(\"unknown\")' class='company-list-name' style='cursor: pointer;'> + </td><td colspan='2' class='company-list-name'>* Unknown *</td></tr>";
		for(c=0; c<company_flights.length; c++){
			if(company_flights[c][0]!=current_company)continue;
			var current_date = new Date();
			var flight_seen_date = new Date();
			var seen_milliseconds = 0;
			flight_seen_date = company_flights[c][2];
			seen_milliseconds = current_date - flight_seen_date;
			var seen_date = new Date(seen_milliseconds);
			if( seen_date.getUTCDate() > 14 )continue; // cut out over 2 weeks old sights of flights (to even somehow prevent too long list)
			if( opened_company == current_company) // also if company is not opened, do not show the flights
				outHTML += "<tr class='flt_" + current_company.replace(" ","_") + "'>";
			else {
				if (current_company == ""){
					if(opened_company == "unknown") 
						outHTML += "<tr class='flt_unknown'>";
					else
						outHTML += "<tr class='flt_unknown' style='display: none'>";
				} else
					outHTML += "<tr class='flt_" + current_company.replace(" ","_") + "' style='display: none'>";
			}
			outHTML += "<td colspan='2' style='padding-left: 5px;'><a href='https://flightaware.com/live/flight/" + company_flights[c][1].trim() + "' target='_blank'>" + company_flights[c][1].trim() + "</td>";
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
