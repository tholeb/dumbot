# Dumbot

[![CI](https://github.com/tholeb/dumbot/actions/workflows/eslint.yml/badge.svg)](https://github.com/tholeb/dumbot/actions/workflows/eslint.yml)

A bot doing some stuff

## Commands

- Weather
- ping
- ... (`src/commands`)

## Prerequisites

- [Get a discord token for your bot](https://discord.com/developers/applications)
- [Get a Open Weather Map token](https://home.openweathermap.org/api_keys)

## Installation and usage

You can install and use this bot in multiple ways.

### Basic method

```bash
npm install
npm run start:prod # or npm start

cp .env.example .env # Then fill it with the correct values
```

### PM2

```bash
npm i -g pm2

nano ecosystem.config.js # Then fill it with the correct values (env vars, host, key, ...)

pm2 start

# or (for deployment on a remote server)


pm2 deploy production setup
pm2 deploy production start
```

### Using docker (or podman)

```bash
docker build -t dumbot .
docker run -d dumbot # -d for detached mode

# Then fill the docker-compose.yml with the correct values
```

#### Manage the docker container using this commands

```bash
docker ps # List all containers
docker stop <CONTAINER ID> # Stop a container
docker restart <CONTAINER ID> # restart a container
```

### Using heroku

#### On the website

Simply create a new app and add the bot to it.
Don't forget to change the dyno to a worker formation.

Also add the needed environment variables to the app's settings (see the `.env.example` file)

#### CLI

First install the [heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

Then [create the app](https://devcenter.heroku.com/articles/creating-apps#creating-a-named-app)
