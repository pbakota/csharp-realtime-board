using System.Net.WebSockets;

namespace Stomp.Relay.Transport;

internal class WebSocketTransport : IStompTransport
{
    private WebSocket? _webSocket;

    public WebSocketTransport() { }

    public WebSocketTransport(WebSocket webSocket)
    {
        _webSocket = webSocket;
    }

    public async Task<ArraySegment<byte>> ReadAsync(CancellationToken token)
    {
        WebSocketReceiveResult receiveResult;
        var buffer = new byte[1024 * 4];
        using var ms = new MemoryStream();
        do
        {
            receiveResult = await _webSocket!.ReceiveAsync(buffer, token);
            if (receiveResult.CloseStatus.HasValue)
            {
                // connection closed
                break;
            }
            await ms.WriteAsync(buffer.AsMemory(0, receiveResult.Count), token);
        } while (!receiveResult.EndOfMessage);

        return new ArraySegment<byte>(ms.GetBuffer(), 0, (int)ms.Length);
    }

    public async Task CloseAsync()
    {
        {
            if (_webSocket != null)
            {
                if (_webSocket!.State is WebSocketState.Open or WebSocketState.CloseReceived or WebSocketState.CloseSent)
                {
                    await _webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                }
                _webSocket = null;
            }
        }
    }

    public async Task SendAsync(ArraySegment<byte> bytes, CancellationToken token = default)
        => await _webSocket!.SendAsync(bytes, WebSocketMessageType.Text, true, token);

    public Task OpenAsync()
    {
        throw new NotImplementedException();
    }

    public bool IsClosed() => _webSocket?.State is not WebSocketState.Open;
}
