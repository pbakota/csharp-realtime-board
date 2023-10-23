using Microsoft.AspNetCore.Http;

using Stomp.Relay.Messages;

namespace Stomp.Relay;

public class StompContext : IStompContext
{
    public HttpContext HttpContext { get; private set; }
    public IStompMessage StompMessage { get; private set; }
    public string Destination { get; private set; }
    public Dictionary<string, object?> PathParameters { get; } = new();

    public StompContext(HttpContext httpContext, IStompMessage message, string destination)
    {
        HttpContext = httpContext;
        StompMessage = message;
        Destination = destination;
    }
}