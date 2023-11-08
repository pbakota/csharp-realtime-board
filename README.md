# STOMP based websocket server implementation in C# .NET 6

The purpose of the demo project is to demonstrate how to implement a simple real-time collaboration board. This project only implements the websocket server part. There is a parent project written in Java, you can find here https://github.com/pbakota/java-realtime-board. The implemented websocket server has the all features from the Java implementation from the parent project. That means the services are interchangeable.

## Architecture

![Alt](http://127.0.0.1:8001/figures/figure-1.svg)

The websocket server in production includes Eureka discovery client and automatically register itself on Eureka server, and it is ready to be used with load balancer.

For more information about the architecture see the parent project. https://github.com/pbakota/java-realtime-board


## Implementation

The project was implemented in .NET 6 with very little depenedency. It uses MongoDb for storage and Eureka client for automatic discovery. The project also has simple STOMP relay implementation which can be used as a separate 
component for other projects as well. See more information about the relay in section "Stomp.Relay".

The project was designed to be 100% compatible with the Java counterpart (see: https://github.com/pbakota/java-realtime-board), that means all data structures and communication protocols are the same. Also implements a simple
RPC api that can be used to replace regular REST end point calls (altough using REST is still possible). All client<->server communication can be done trough websocket. The project has two sub projects. 

### WebsocketServer

This is the main part of this demo project it implements Websocket communication between the STOMP client and the server, the architecture uses "StompController" to implement the logic, very similar to usual ASP.NET controllers.
The controller need to be annotated with "[StompController]" attribute. The STOMP destinations can be defined with "[StompRoute("...")]" attribute. The StompRoute supports parameter substitution as well. e.g. "/incoming/{boardId}" this means you can have parameters in the route itself just like you can have it for regular routes. Auto validation of parameters were not yet implemented. If the parameter is not annotated with an attribute, then is assuming that the parameter value is available in the STOMP message body. If the parameter is an object, it will be deserialized automatically from the body. The response can be sent by using IStompPublisher component. e.g.

```C#
[StompController]
public class WebsocketController
{

    ...
    [StompRoute("/incoming/{boardId}")]
    public async Task Incoming([FromRoute] string boardId, RawMessage rawMessage)
    {
        ...
        await _stompPublisher.SendAsync($"/topic/outgoing.{boardId}", rawMessage.Message);
    }
    ...
}
```

## Stomp.Relay

What is STOMP? You can read about STOMP here: https://stomp.github.io/stomp-specification-1.2.html

This is a very simple relay implementation. It does not implement full STOMP server. It is only capable to forward (relay) STOMP messages from client to to message broker and to accept and route direct messages to the appropriate controllers.


### The usage

The configuration for the relay

```C#
builder.Services.AddStompRelay(config =>
{
    config.BrokerHost = "localhost";
    config.BrokerPort = 61613;
    config.EnableRelay = new string[] { "/topic", "/queue"};
    config.AppPrefixes = new string[] { "/app" };
    config.SearchIn = new[] { Assembly.GetExecutingAssembly() };
});

```

**The confguration options:**

```
    Type             Name               Default value
    ----------------------------------------------------------------------
    string           BrokerHost         = "localhost";
    int              BrokerPort         = 61613;
    string           BrokerLogin        = "guest";
    string           BrokerPasscode     = "guest";
    string[]         AppPrefixes        = Array.Empty<string>();
    string[]         EnableRelay        = Array.Empty<string>();
    Assembly[]       SearchIn           = Array.Empty<Assembly>();
    JsonNamingPolicy NamingPolicy       = JsonNamingPolicy.CamelCase;
```

1. `BrokerHost`     = The host name of the message broker
1. `BrokerPort`     = The port for the message broker
1. `BrokerLogin`    = The login name for the broker
1. `BrokerPasscode` = The password for the broker login
1. `AppPrefixes`    = Application prefix for capturing direct messages
1. `EnableRelay`    = Relay prefix, messages with these prefixes will be forwarded to message broker
1. `SearchIn`       = The list of assemblies where the StompContollers resides
1. `NamingPolicy`   = Json naming policy for the message body

**To use the relay**

The usage of the relay with optional websocket options.

```C#
app.UseStompRelay("/websocket", webSocketOptions);
```

### The client side

For the client part, STOMP-js is used (https://stomp-js.github.io/). But any standard STOMP client can be used. 

The application client side is written in TypeScript with excellent `bun` JavaScript Toolkit (https://bun.sh/). Plese refere the `socket.ts` for the client side implementation of the communication.


### Supported message brokers

The **Stomp.Relay** was tested with RabbitMQ and ActiveMQ, but it could work with any other STOMP capable message broker.

## How to build

The project uses GNU makefile to execute predefined targets. To build the whole project in debug mode then execute from the "sources" folder:

`$ make`

To run the project in watch mode:

`$ make run`

To create all packages for deployment:

`$ make package-all`

To create package for the websocket server:

`$ make package-websocket`

To create package for the client side:

`$ make package-app`


All packages for the deployment will be create in the ${project.root}/releases.

## Docker deploy

The project contains "docker" folder, which contains all the necessary files for docker deployment. 

Copy the *.tgz files from ${project.root}/releases folder into the docker folder before you start the container.

The "docker" folder also contains a GNU Makefile for easier maintenance. There are couple of targets:

1. `$ make start` = To start the application with docker compose
1. `$ make stop` = To stop the docker container
1. `$ make shell` = To open an interactvice shell in the container.

Please make it sure that you have updated the config files. The docker stack does not contain any other required services (the message broker and MongoDB). They must be already installed. 

All configuration files are in the "config" folder. There are two:

1. `app.config.js`
    This file is used by the client side and it only contains the URI for the websocket endpoint

1. `appsettings.json`
    Thi config file is for the server-side websocket server

