# Generic NestJs Backend

This is a generic nestjs backend that can be used to create a backend for any project. It can be deployed anywhere that you can deploy a docker container, and hooked up to any postgres database provider. It also includes instructions and configuration for easy local debugging. You can 1-click deploy on railway using the link below (you'll need to create a railway account first).

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/5eHaqw?referralCode=gPQRvt)

## Features

* User authentication (using JWTs, refresh tokens, etc.)
* Creating users and organizations (i.e. multi tenant support)
* Creating and issuing API keys with attached scopes
* Transactional email using resend

## Tools used

* Nest.js as the server framework (using fastify under the hood)
* prisma + postgres as the database
* docker for local development
* passport.js for authentication
* jest for testing
* eslint for linting
* prettier for formatting

## Contributing

1. Branch all PRs from the `main` branch using the branch name from Linear (cmd+shift+. on mac).
2. Do your work.
3. Push upstream and open a PR to merge into `main`.
4. Once the PR is approved, merge it into `main`. This will push the changes to the prod environment.

## How to work on the API locally

If you're using vscode, you can use the `Start Debug Server` config, which will:

1. spin up the database and adminer containers
2. Start the API in dev mode (i.e. hot reload)
3. Spin down the containers when you kill the debugger

Otherwise, just run `docker compose up db adminer` to spin up the database and adminer containers, and then run `npm run start:dev` to start the API in dev mode (and `docker compose down` to spin down the containers when you're done).

## Running the local postgres docker container

These instructions are [cribbed from here](https://www.docker.com/blog/how-to-use-the-postgres-docker-official-image).

1. Download the latest [docker desktop release](https://www.docker.com/products/docker-desktop/).
2. Run the following command to pull the latest images and then start the container:

```bash
docker compose up db
```

To build everything, omit `db`, which will spin up the server and adminer db UI, all in the docker container. To include adminer but not turn on the server in the container, add `adminer` (i.e. `docker compose up db adminer`).

If you need to rebuild a container, run the following command:

```bash
docker compose up --build # omit container name to rebuild all
```

To remove old containers:

```bash
docker compose down # removes all containers
docker compose down --volumes # Remove containers and volumes
```

## Updating the prisma database schema

See [best practices from prisma here](https://www.prisma.io/docs/guides/migrate/prototyping-schema-db-push).

Overview:

1. Make changes to the schema in `prisma/schema.prisma`.
2. Start the local database container (see above).
3. run `npm run prisma:debug` to test the change on the local database (or run `npx prisma db push`).
4. Keep making changes until you're happy with them, using the `prisma:debug` command to test them.
5. Once you're happy with them, you can `git stash` to stash the changes you made to the schema and run `prisma:debug` once more go go back to what you had. Then `git stash pop` to get the changes back (which you know work, due to your prototyping in steps 1-4).
6. Finally, run `npm run prisma:dev <name>` (or `npx prisma migrate --name <name>`) create a migration that creates the changes. You can skip step 5, but that will create drift in the database that will force you to reset it completely.

## How to run the server outside the container

### Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

### Installation

```bash
npm install
```

### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Authors

* [Allen](https://github.com/allen-n)
