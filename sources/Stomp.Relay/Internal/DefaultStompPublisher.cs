using System.Text;
using System.Text.Json;

using Microsoft.Extensions.Logging;

using Stomp.Relay.Messages;

namespace Stomp.Relay;

internal class DefaultStompPublisher : IStompPublisher
{
    private readonly ILogger<DefaultStompPublisher> _logger;

    private readonly ITcpTransportAccessor _tcpTransportAccessor;

    public DefaultStompPublisher(ILogger<DefaultStompPublisher> logger, ITcpTransportAccessor tcpTransportAccessor)
    {
        _logger = logger;
        _tcpTransportAccessor = tcpTransportAccessor;
    }

    public async Task SendAsync<T>(string topic, T message, Dictionary<string, object>? headers = null) where T : class
    {
        string body = string.Empty;
        if (message.GetType().IsPrimitive || message is string)
        {
            // Do not serialize primitive types (int, double, etc) and strings
            body = message.ToString()!;
        }
        else
        {
            body = JsonSerializer.Serialize(message);
        }
        var contentLength = Encoding.UTF8.GetBytes(body).Length; // The content length is in octets
        var stompMessage = new StompMessageBuilder(StompCommand.Send)
            .Headers(headers)
            .Header("destination", topic)
            .Header("content-length", contentLength)
            .WithBody(body);
        var serialized = StompMessageSerializer.Serialize(stompMessage);
        _logger.LogDebug("Message: {}", serialized);
        var bytes = Encoding.UTF8.GetBytes(serialized);
        await _tcpTransportAccessor.TcpTransport.SendAsync(bytes, CancellationToken.None);
    }
}