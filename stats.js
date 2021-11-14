	var receiver_noise = 0, receiver_signal = 0;

	function refreshStats(){
		getJSON("http://" + receiver_domain + receiver_stats_url_path,
			function(err,data){
				if(err==null){
					var sh = document.getElementById("stats-head");
					var label_style = "background: #80F081; text-align: center;";
					var hrate_style = "background: #F0F081; text-align: center;";
					var h5_style = "background: #80F081; text-align: center;";
					var h15_style = " text-align: center;";
					sh.innerHTML="<th style='"+label_style+"; width: 30px;'><br/>#</th><th style='"+hrate_style+"'>Msg<br/>Rate</th><th style='"+h5_style+"'>5 min<br/>Peak</th><th style='"+h5_style+"'><br/>Sig</th><th style='"+h5_style+"'><br/>Noise</th><th style='"+h5_style+"'><br/>Msgs</th><th style='"+h5_style+"'><br/>Pos</th><th style='"+h15_style+"'>15 min<br/>Peak</th><th style='"+h15_style+"'><br/>Sig</th><th style='"+h15_style+"'><br/>Noise</th><th style='"+h15_style+"'><br/>Msgs</th><th style='"+h15_style+"'><br/>Pos</th>";
					var st = document.getElementById("stats-body");
					var outHTML = "";
					//for(var key in data)
					{
						var msgs = 0.0, msgrate = 0.0; 
						var noise5 = 0.0, peak5 = 0.0, sig5 = 0.0, msgs5 = 0, pos5 = 0, ok5 = 0;
						var noise15 = 0.0, peak15 = 0.0, sig15 = 0.0, msgs15 = 0, pos15 = 0, ok15 = 0;

						if(data.last1min.messages) msgs = data.last1min.messages;
						if(data.last1min.local.noise) receiver_noise = data.last1min.local.noise;
						if(data.last1min.local.signal) receiver_signal = data.last1min.local.signal;
						msgrate = (msgs / 60).toFixed(1);

						if(data.last5min.local.noise) noise5 = data.last5min.local.noise;
						if(data.last5min.local.signal) sig5 = data.last5min.local.signal;
						if(data.last5min.local.peak_signal) peak5 = data.last5min.local.peak_signal;
						if(data.last5min.cpr.local_ok) ok5 = data.last5min.cpr.local_ok;									
						if(data.last5min.cpr.airborne) pos5 = data.last5min.cpr.airborne;
						if(data.last5min.messages) msgs5 = data.last5min.messages;

						if(data.last15min.local.noise) noise15 = data.last15min.local.noise;
						if(data.last15min.local.signal) sig15 = data.last15min.local.signal;
						if(data.last15min.local.peak_signal) peak15 = data.last15min.local.peak_signal;
						if(data.last15min.cpr.local_ok) ok15 = data.last15min.cpr.local_ok;
						if(data.last15min.cpr.airborne) pos15 = data.last15min.cpr.airborne;
						if(data.last15min.messages) msgs15 = data.last15min.messages;

						var stat_style = " text-align: center;";

						var rate_style = " color: #B0B0FF;";
						if(msgrate < 2) rate_style = " color: #FF1011;";
						if(msgrate > 50) rate_style = " color: #80FF81;";

						var sig5_style = "";
						if(sig5 > -3.0) sig5_style = " color: #FF1011;";

						var sig15_style = "";
						if(sig15 > -3.0) sig15_style = " color: #FF1011;";

						outHTML += "<tr>";

						outHTML += "<td style='" + stat_style + "'>" + receiver_label + "</td>" + "<td style='" + stat_style + rate_style + "'>" + msgrate + "</td>" + "<td style='" + stat_style + "'>" + peak5 + "</td>" + "<td style='" + stat_style + sig5_style + "'>" + sig5 + "</td>" + "<td style='" + stat_style + "'>" + noise5 + "</td>" + "<td style='" + stat_style + "'>" + msgs5 + "</td>" + "<td style='" + stat_style + "'>" + pos5 + "</td>" + "<td style='" + stat_style + "'>" + peak15 + "</td>" + "<td style='" + stat_style + sig15_style + "'>" + sig15 + "</td>" + "<td style='" + stat_style + "'>" + noise15 + "</td>" + "<td style='" + stat_style + "'>" + msgs15 + "</td>" + "<td style='" + stat_style + "'>" + pos15 + "</td>";

						outHTML += "</tr>";
					}
					// fetch secondary receiver data json, if enabled
					if( second_receiver_enabled ){
						getJSON("http://" + second_receiver_domain + second_receiver_stats_url_path,
								function(err,data){
									second_stat_data = null;
									if(err==null) second_stat_data = data;
								});
					}
					if( second_stat_data )
					{
						msgs = 0.0; msgrate = 0.0; 
						noise5 = 0.0; peak5 = 0.0; sig5 = 0.0; msgs5 = 0; pos5 = 0; ok5 = 0;
						noise15 = 0.0; peak15 = 0.0; sig15 = 0.0; msgs15 = 0; pos15 = 0; ok15 = 0;

						if(second_stat_data.last1min.messages) msgs = second_stat_data.last1min.messages;
						msgrate = (msgs / 60).toFixed(1);

						if(second_stat_data.last5min.local.noise) noise5 = second_stat_data.last5min.local.noise;
						if(second_stat_data.last5min.local.signal) sig5 = second_stat_data.last5min.local.signal;
						if(second_stat_data.last5min.local.peak_signal) peak5 = second_stat_data.last5min.local.peak_signal;
						if(second_stat_data.last5min.cpr.local_ok) ok5 = second_stat_data.last5min.cpr.local_ok;									
						if(second_stat_data.last5min.cpr.airborne) pos5 = second_stat_data.last5min.cpr.airborne;
						if(second_stat_data.last5min.messages) msgs5 = second_stat_data.last5min.messages;

						if(second_stat_data.last15min.local.noise) noise15 = second_stat_data.last15min.local.noise;
						if(second_stat_data.last15min.local.signal) sig15 = second_stat_data.last15min.local.signal;
						if(second_stat_data.last15min.local.peak_signal) peak15 = second_stat_data.last15min.local.peak_signal;
						if(second_stat_data.last15min.cpr.local_ok) ok15 = second_stat_data.last15min.cpr.local_ok;
						if(second_stat_data.last15min.cpr.airborne) pos15 = second_stat_data.last15min.cpr.airborne;
						if(second_stat_data.last15min.messages) msgs15 = second_stat_data.last15min.messages;

						stat_style = " text-align: center; background: #202021;";

						rate_style = " color: #B0B0FF;";
						if(msgrate < 10) rate_style = " color: #FF1011;";
						if(msgrate > 50) rate_style = " color: #80FF81;";

						var sig5_style = "";
						if(sig5 > -3.0) sig5_style = " color: #FF1011;";

						var sig15_style = "";
						if(sig15 > -3.0) sig15_style = " color: #FF1011;";

						outHTML += "<tr>";

						outHTML += "<td style='" + stat_style + "'>" + second_receiver_label + "</td>" + "<td style='" + stat_style + rate_style + "'>" + msgrate + "</td>" + "<td style='" + stat_style + "'>" + peak5 + "</td>" + "<td style='" + stat_style + sig5_style + "'>" + sig5 + "</td>" + "<td style='" + stat_style + "'>" + noise5 + "</td>" + "<td style='" + stat_style + "'>" + msgs5 + "</td>" + "<td style='" + stat_style + "'>" + pos5 + "</td>" + "<td style='" + stat_style + "'>" + peak15 + "</td>" + "<td style='" + stat_style + sig15_style + "'>" + sig15 + "</td>" + "<td style='" + stat_style + "'>" + noise15 + "</td>" + "<td style='" + stat_style + "'>" + msgs15 + "</td>" + "<td style='" + stat_style + "'>" + pos15 + "</td>";

						outHTML += "</tr>";
					}
					st.innerHTML = outHTML;
				}
			}
		);
    }

	refreshStats();
	var refreshStatsInterval = setInterval(refreshStats, stats_refresh_rate);
