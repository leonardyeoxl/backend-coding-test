# Development

## Setup Container Env

### Build Image

```sh
~/backend-coding-test$ docker-compose build
```

### Run Image

```sh
~/backend-coding-test$ docker run -it -v `pwd`:/app/ -p 8010:8010 backendcodingtest_api-endpoint:latest sh
```

### Install Node Modules

```sh
/app # npm install
```

### Run Tests

```sh
/app # npm test
```

### Run Server

```sh
/app # npm start
```