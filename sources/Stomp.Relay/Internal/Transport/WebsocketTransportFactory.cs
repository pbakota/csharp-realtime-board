using System.Diagnostics;
using System.Net.WebSockets;

namespace Stomp.Relay.Transport;

internal class WebSocketTransportFactory : ITransportFactory<WebSocketTransport>
{
    public WebSocketTransport CreateTransport(params object[]? arg)
    {
        Debug.Assert(arg != null);
        return new WebSocketTransport((WebSocket)arg[0]);
    }

}