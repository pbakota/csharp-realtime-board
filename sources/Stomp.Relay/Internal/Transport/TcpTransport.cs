
using System.Net.Sockets;

namespace Stomp.Relay.Transport;

internal class TcpTransport : IStompTransport
{
    private readonly string _host;
    private readonly int _port;
    private TcpClient? _client;
    private NetworkStream? _stream;
    private bool _closed;

    #pragma warning disable CS8618
    public TcpTransport() {}

    public TcpTransport(string host, int port)
    {
        _client = new TcpClient();
        _host = host;
        _port = port;
        _closed = false;
    }

    public async Task OpenAsync()
    {
        await _client!.ConnectAsync(_host, _port);
        _stream = _client.GetStream();
    }

    public Task CloseAsync()
    {
        if (_client != null)
        {
            _client!.Close();
            _client = null;
        }

        return Task.CompletedTask;
    }

    public async Task<ArraySegment<byte>> ReadAsync(CancellationToken token = default)
    {
        var buffer = new byte[1024 * 4];
        using var ms = new MemoryStream();

        int length = 0;
        do
        {
            int len = await _stream!.ReadAsync(buffer, cancellationToken: token);
            if(len == 0) {
                _closed = true;
                break;
            }
            await ms.WriteAsync(buffer.AsMemory(0, len), cancellationToken: token);
            length += len;
        } while (_stream.DataAvailable);
        return new ArraySegment<byte>(ms.GetBuffer(), 0, length);
    }

    public async Task SendAsync(ArraySegment<byte> bytes, CancellationToken token = default)
    {
        await _stream!.WriteAsync(bytes.ToArray(), token);
        await _stream!.FlushAsync(token);
    }

    public bool IsClosed() => _closed;
}
