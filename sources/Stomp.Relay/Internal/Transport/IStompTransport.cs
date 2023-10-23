namespace Stomp.Relay.Transport;

internal interface IStompTransport
{
    bool IsClosed();
    Task OpenAsync();
    Task CloseAsync();
    Task<ArraySegment<byte>> ReadAsync(CancellationToken token = default);
    Task SendAsync(ArraySegment<byte> bytes, CancellationToken token = default);
}