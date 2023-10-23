using System.Net.WebSockets;

using Microsoft.AspNetCore.Http;

namespace Stomp.Relay;

public interface IStompHandler
{
    Task Handle(WebSocket socket, HttpContext context, CancellationToken token);
}