using Stomp.Relay.Transport;

namespace Stomp.Relay;

internal interface ITcpTransportAccessor
{
    TcpTransport TcpTransport { get; set; }
}