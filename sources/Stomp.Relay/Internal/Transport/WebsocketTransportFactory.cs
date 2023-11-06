using System.Diagnostics;
using System.Net.WebSockets;

namespace Stomp.Relay.Transport;

internal class WebSocketTransportFactory : ITransportFactory<WebSocketTransport>
{
    public IStompTransport CreateTransport(params object[]? arg)
    {
        Debug.Assert(arg != null);
        return new WebSocketTransport((WebSocket)arg[0]);
    }

}