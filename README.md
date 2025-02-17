## Flight tracker app

Flight tracker app based on NestJS and MongoDB.

## Project setup

## 1. Setup config (.env) files

There are 2 config .env.local; .env.test

- .env.local currently used by the app - if you run it in docker you need to set "mongo" in the url. For local just use localhost.
- .env.test for test configs

There is an example .env file added to root.

## 2. Run in docker

Make sure Docker is available and running.

Then:
```bash
$ docker-compose up --build
```
Now the application should be up and running on port 3000.

Check status: http://localhost:3000/api/v1/status and the response should be:
```json
{ "status" : "online" }
```

OpenAPI (Swagger) documentation is available here: http://localhost:3000/api/docs

To use the OpenAPI you should first create a token at auth endpoint and paste the result token to "Authorize". Now token is used for all your queries.


## 2. Run for local development

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

