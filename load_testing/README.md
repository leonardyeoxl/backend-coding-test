# README

## Setup

Open the `load-tester.yaml` file.

```yaml
config:
  target: "https://<ip_addr>:8010"
  tls:
    rejectUnauthorized: false
  phases:
    - duration: 30
      arrivalRate: 3.4
  ensure:
    p99: 50
```

Please specify the `ip_addr` from the linux command: `$(ip -o route get to 8.8.8.8 | sed -n 's/.*src \([0-9.]\+\).*/\1/p')` in the `load-tester.yaml` file.

## Run load testing

```sh
~/backend-coding-test/load_testing$ docker run -it -v `pwd`:/app/  -e HOST_IP=$(ip -o route get to 8.8.8.8 | sed -n 's/.*src \([0-9.]\+\).*/\1/p') backendcodingtest_api-endpoint:latest sh
/app # npm install
/app # npm run test:load
```