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
		},
	],
	deploy : {
		production : {
			'user' : 'pi',
			'host' : '192.168.1.11',
			'ref'  : 'origin/master',
			'repo' : 'git@github.com:tholeb/dumbot.git',
			'path' : '.',
			'post-deploy' : 'npm install',
		},
	},
};
