using Microsoft.AspNetCore.Http;

using Stomp.Relay.Messages;

namespace Stomp.Relay;

public interface IStompContext
{
    HttpContext HttpContext { get; }
    IStompMessage StompMessage { get; }
    string Destination { get; }
    Dictionary<string, object?> PathParameters { get; }
}