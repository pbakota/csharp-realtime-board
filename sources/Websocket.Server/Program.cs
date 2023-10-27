using System.Reflection;

using Microsoft.Extensions.FileProviders;

using Steeltoe.Discovery.Client;

using Stomp.Relay;

using Websocket.Server.Installers;
using Websocket.Server.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDiscoveryClient();

builder.Services.AddHealthChecks();
builder.Services.AddSingleton<IBoardService, BoardService>();
builder.Services.AddMongoDB(builder.Configuration);

var relayConfig = builder.Configuration.GetSection("relay");
builder.Services.AddStompRelay(config =>
{
    config.RelayHost = relayConfig["host"];
    config.RelayPort = relayConfig.GetSection("port").Get<int>();
    config.EnableRelay = relayConfig.GetSection("enable").Get<string[]>();
    config.AppPrefixes = relayConfig.GetSection("prefix").Get<string[]>();
    config.SearchIn = new [] { Assembly.GetExecutingAssembly() };
});

var app = builder.Build();

var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromMinutes(2)
};

app.UseStompRelay("/websocket", webSocketOptions);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Environment.GetEnvironmentVariable("STATIC_FILE_LOCATION"))
});

app.Run();
