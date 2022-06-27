module.exports = {
	apps: [
		{
			name: 'Dumbot',
			script: 'npm',
			args: 'start:prod',
			watch: [
				'src/**/*.js',
				'main.js',
			],
			autorestart: true,
			restart_delay: 3000,
			env_production: {
				TOKEN: '',
				OWM_API_KEY: '',

				ACCEPT_HIGHCHARTS_LICENSE: 'YES',
				HIGHCHARTS_VERSION: '4.2.2',
			},
		},
	],
	deploy : {
		production: {
			key: '~/.ssh/id_pm2.pub',
			user: 'pi',
			host: '192.168.1.11',
			ref: 'origin/master',
			repo: 'git@github.com:tholeb/dumbot.git',
			path: '/home/pi/dumbot',
			'post-deploy': 'npm install',
		},
	},
};
