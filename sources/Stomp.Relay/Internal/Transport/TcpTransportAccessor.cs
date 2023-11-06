using Stomp.Relay.Transport;

namespace Stomp.Relay;

internal class TcpTransportAccessor : ITcpTransportAccessor
{
    private static readonly AsyncLocal<TcpTransportHolder> _tcpTransportCurrent = new();

    public IStompTransport TcpTransport
    {
        get
        {
            return _tcpTransportCurrent.Value?.TcpTransport!;
        }
        set
        {
            var holder = _tcpTransportCurrent.Value;
            if (holder != null)
            {
                // Clear current TcpTransport trapped in the AsyncLocals, as its done.
                holder.TcpTransport = null;
            }

            if (value != null)
            {
                _tcpTransportCurrent.Value = new TcpTransportHolder { TcpTransport = value };
            }
        }
    }

    private class TcpTransportHolder
    {
        public IStompTransport? TcpTransport;
    }
}