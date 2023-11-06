using System.Diagnostics;

namespace Stomp.Relay.Transport;

internal class TcpTransportFactory : ITransportFactory<TcpTransport>
{
    public IStompTransport CreateTransport(params object[]? arg)
    {
        Debug.Assert(arg != null);
        return new TcpTransport(host: (string)arg[0], port: (int)arg[1]);
    }

}