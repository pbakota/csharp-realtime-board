using System.Text.RegularExpressions;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

using Stomp.Relay.Config;

namespace Stomp.Relay;

internal class DefaultStompMessageDispatcher : IStompMessageDispatcher
{
    private static readonly Regex RxReplacePrefix = new("^/[a-z0-9]+/", RegexOptions.IgnoreCase | RegexOptions.Compiled | RegexOptions.Singleline);
    private readonly ILogger<DefaultStompMessageDispatcher> _logger;
    private readonly StompRelayConfig _config;
    private readonly IStompMethodExecutor _stompMethodExecutor;

    public DefaultStompMessageDispatcher(ILogger<DefaultStompMessageDispatcher> logger, StompRelayConfig config, IStompMethodExecutor stompMethodExecutor)
    {
        _logger = logger;
        _config = config;
        _stompMethodExecutor = stompMethodExecutor;
    }

    public async Task<bool> DispatchMessageAsync(HttpContext context, ArraySegment<byte> bytes, CancellationToken token)
    {
        var message = StompMessageSerializer.Deserialize(bytes);
        _logger.LogInformation("Message: {}", message);

        if (message.Command is StompCommand.Send)
        {
            var destination = message.Headers["destination"].AsString() ?? string.Empty;
            if (_config.AppPrefixes.Any(p => destination.StartsWith(p, StringComparison.InvariantCultureIgnoreCase)))
            {
                destination = RxReplacePrefix.Replace(destination, "/");
                var stompContext = new StompContext(context, message, destination);

                await _stompMethodExecutor.Execute(stompContext);
                return true;
            }
        }

        return false;
    }
}