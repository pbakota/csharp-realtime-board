using System.Net.Sockets;
using System.Net.WebSockets;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

using Stomp.Relay.Config;

using Stomp.Relay.Transport;

namespace Stomp.Relay;

internal class StompHandler : IStompHandler
{
    private readonly ILogger<StompHandler> _logger;
    private readonly StompRelayConfig _config;
    private readonly IStompMessageDispatcher _dispatcher;
    private readonly ITransportFactory<WebSocketTransport> _wsTransportFactory = null!;
    private readonly ITransportFactory<TcpTransport> _tcpTransportFactory = null!;
    private readonly ITcpTransportAccessor _tcpTransportAccessor;

    private WebSocketTransport _webSocketTransport = null!;
    private TcpTransport _tcpTransport = null!;

    public StompHandler(ILogger<StompHandler> logger, StompRelayConfig config, IStompMessageDispatcher dispatcher,
        ITransportFactory<WebSocketTransport> wsTransportFactory,
        ITransportFactory<TcpTransport> tcpTransportFactory,
        ITcpTransportAccessor tcpTransportAccessor)
    {
        _logger = logger;
        _config = config;
        _dispatcher = dispatcher;

        _wsTransportFactory = wsTransportFactory;
        _tcpTransportFactory = tcpTransportFactory;
        _tcpTransportAccessor = tcpTransportAccessor;
    }

    public async Task Handle(WebSocket socket, HttpContext context, CancellationToken token)
    {
        _webSocketTransport = _wsTransportFactory.CreateTransport(socket);
        _tcpTransport = _tcpTransportFactory.CreateTransport(_config.RelayHost, _config.RelayPort);

        // Make it available as a standalone service
        _tcpTransportAccessor.TcpTransport = _tcpTransport;

        try
        {
            await _tcpTransport.OpenAsync();

            var relay = DoRelay(token);
            var dispatch = DoDispatcher(context, token);

            _logger.LogInformation("Connected to broker relay {}:{}", _config.RelayHost, _config.RelayPort);

            Task.WaitAll(new Task[] { relay, dispatch }, cancellationToken: token);
        }
        // Ignore cancelled exception and take it as a normal exit
        catch (OperationCanceledException) { }
        catch (SocketException)
        {
            _logger.LogWarning("Broker disconnected");
        }
        catch (WebSocketException)
        {
            _logger.LogWarning("Websocket client disconnected");
        }
        finally
        {
            await _webSocketTransport.CloseAsync();
        }
    }

    private async Task DoDispatcher(HttpContext context, CancellationToken token)
    {
        while (!token.IsCancellationRequested)
        {
            var request = await _webSocketTransport.ReadAsync(token);
            if (_webSocketTransport.IsClosed())
            {
                break;
            }

            if (IsPing(request) || !await _dispatcher.DispatchMessageAsync(context, request, token))
            {
                // If the request was not handled then forward it to broker
                await _tcpTransport.SendAsync(request, token);
            }
        }
    }

    private static bool IsPing(ArraySegment<byte> request)
        => request[0] == '\n' || request[0] == '\r';

    private async Task DoRelay(CancellationToken token)
    {
        while (true)
        {
            var message = await _tcpTransport.ReadAsync(token);
            if (_tcpTransport.IsClosed())
            {
                break;
            }
            await _webSocketTransport.SendAsync(message, token);
            if (_webSocketTransport.IsClosed())
            {
                break;
            }
        }
    }
}