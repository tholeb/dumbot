module.exports = {
		type: 'png',
		options: {
			chart: {
				backgroundColor: '#2F3136',
				type: 'spline',
				style: {
					fontFamily: '\'Unica One\', sans-serif',
				},
				plotBorderColor: '#FFFFFF',
				plotOptions: {
					line: {
						marker: {
							lineColor: '#2C2F33',
						},
					},
				},
			},
			subtitle: {
				text: 'Source: Open Weather Map',
			},
			legend: {
				enabled: true,
				layout: 'vertical',
				floating: true,
				align: 'left',
				verticalAlign: 'top',
				itemStyle: {
					color: '#FFFFFF',
				},
			},
			xAxis: {
				labels: {
					style: {
						color: '#FFFFFF',
					},
				},
				title: {
					text: '',
				},
				type: 'datetime',
			},
			yAxis: {
				title: {
					text: 'Température',
				},
				gridLineColor: '#40444B',
				lineColor: '#40444B',
				minorGridLineColor: '#40444B',
				tickColor: '#40444B',
			},
			plotOptions: {
				series: {
					dataLabels: {
						color: '#FFFFFF',
						style: {
							fontSize: '13px',
						},
					},
					marker: {
						enabled: false,
					},
				},
			},
			labels: {
				style: {
					color: '#FFFFFF',
				},
			},
			series: [],
		},
	};