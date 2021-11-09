var eastXmlhttp = new XMLHttpRequest();
eastXmlhttp.onreadystatechange = function () {
	if (this.readyState == 4 && this.status == 200) {
		var eastAnt = JSON.parse(this.responseText);
		document.getElementById("eastAircrafts").innerHTML = eastAnt.last1min.local.accepted;
		document.getElementById("eastNoiseLevel").innerHTML = eastAnt.last1min.local.noise;
		document.getElementById("eastSignal").innerHTML = eastAnt.last1min.local.signal;
	}
}
eastXmlhttp.open("GET","http://192.168.11.18/dump1090/stats.json", true);
eastXmlhttp.send();
