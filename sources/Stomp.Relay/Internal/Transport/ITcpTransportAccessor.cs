using Stomp.Relay.Transport;

namespace Stomp.Relay;

internal interface ITcpTransportAccessor
{
    IStompTransport TcpTransport { get; set; }
}