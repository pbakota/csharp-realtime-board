# STOMP based websocket server implementation in C# .NET 6

The purpose of the demo project is to demonstrate how to implement a simple real-time collaboration board. This project only implements the websocket server part. There is a parent project written in Java, you can find here https://github.com/pbakota/java-realtime-board. The implemented websocket server has the all features from the Java implementation from the parent project. That means the services are interchangeable.

## Architecture

![Alt](http://127.0.0.1:8001/figures/figure-1.svg)

The websocket server in production includes Eureka discovery client and automatically register itself on Eureka server, and it is ready to be used in load balancer.

For more information about the architecture see the parent project. https://github.com/pbakota/java-realtime-board


## Implementation

## How to build

## Stomp.Relay

What is STOMP? You can read about STOMP here: https://stomp.github.io/stomp-specification-1.2.html

The project does not implement full STOMP server. 

## Docker deploy

