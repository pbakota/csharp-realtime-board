using Microsoft.Extensions.DependencyInjection;

using Stomp.Relay.Config;
using Stomp.Relay.Transport;

namespace Stomp.Relay;

public static class RelayServiceExtension
{
    public static IServiceCollection AddStompRelay(this IServiceCollection services, Action<StompRelayConfig> configure)
    {
        services.AddSingleton<StompRelayConfig, StompRelayConfig>(sp =>
        {
            var config = new StompRelayConfig();
            configure(config);
            return config;
        });
        services.AddTransient<IStompHandler, StompHandler>();
        services.AddSingleton<IStompMethodExecutor, DefaultStompMethodExecutor>();
        services.AddSingleton<IStompMessageDispatcher, DefaultStompMessageDispatcher>();
        services.AddSingleton<IStompPublisher, DefaultStompPublisher>();
        services.AddSingleton<ITransportFactory<WebSocketTransport>, WebSocketTransportFactory>();
        services.AddSingleton<ITransportFactory<TcpTransport>, TcpTransportFactory>();
        services.AddSingleton<ITcpTransportAccessor, TcpTransportAccessor>();
        return services;
    }
}