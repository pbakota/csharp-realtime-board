using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace Stomp.Relay;

public static class StompAppBuilderExtension
{
    private const string STOMP_SUBPROTOCOL = "v12.stomp";
    public static WebApplication UseStompRelay(this WebApplication app, string path, WebSocketOptions? webSocketOptions = default)
    {
        if (webSocketOptions is not null) app.UseWebSockets(webSocketOptions); else app.UseWebSockets();
        app.MapGet(path, async (HttpContext context, CancellationToken token) =>
        {
            if (!context.WebSockets.IsWebSocketRequest)
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
            }
            else
            {
                var ws = await context.WebSockets.AcceptWebSocketAsync(STOMP_SUBPROTOCOL);
                var relay = context.RequestServices.GetRequiredService<IStompHandler>()!;

                await relay.Handle(ws, context, token);
            }
        });

        return app;
    }
}