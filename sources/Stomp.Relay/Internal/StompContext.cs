using Microsoft.AspNetCore.Http;

namespace Stomp.Relay;

internal class StompContext : IStompContext
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