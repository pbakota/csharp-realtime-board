using System.Reflection;

using Stomp.Relay;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddStompRelay(config =>
{
    config.RelayHost = "playbox";
    config.RelayPort = 61613;
    config.EnableRelay = new[] { "/topic", "/queue" };
    config.AppPrefixes = new[] { "/app", "/api" };
    config.SearchIn = new [] { Assembly.GetExecutingAssembly() };
});

var app = builder.Build();

var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromMinutes(2)
};

app.UseStompRelay("/websocket", webSocketOptions);
app.UseStaticFiles();

app.Run();