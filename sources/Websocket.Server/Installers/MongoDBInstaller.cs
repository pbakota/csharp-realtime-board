using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Driver;
using MongoDB.Driver.Core.Events;

using Websocket.Server.Configuration;
using Websocket.Server.Interfaces;
using Websocket.Server.Models;

namespace Websocket.Server.Installers;

public static class MongoDBInstaller
{
    private static readonly string[] FilteredCommands = new string[] {
        "isMaster",
        "saslContinue",
        "saslStart"
    };
    public static IServiceCollection AddMongoDB(this IServiceCollection services, IConfiguration configuration)
    {
        using var loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.SetMinimumLevel(LogLevel.Debug);
            builder.AddConsole();
            builder.AddEventSourceLogger();
        });
        var logger = loggerFactory.CreateLogger("MongoDb");
        services.Configure<MongoDbSettings>(configuration.GetSection("MongoDB"));

        MongoClientSettings settings = MongoClientSettings.FromConnectionString(configuration.GetValue<string>("MongoDB:ConnectionString"));
        settings.ClusterConfigurator = cb => cb.Subscribe<CommandStartedEvent>(e =>
        {
            if (!FilteredCommands.Contains(e.CommandName))
            {
                logger.LogDebug("{CommandName} - {Command}", e.CommandName, e.Command.ToString());
            }
        });

        services.AddSingleton<IMongoClient>(s => new MongoClient(settings));
        services.AddSingleton<IMongodbContext, MongodbContext>();

        // NOTE: Use camelCase convention for key names
        var conventionPack = new ConventionPack { new CamelCaseElementNameConvention(), new IgnoreExtraElementsConvention(true) };
        // NOTE: typeof(Models.BoardEntity).Namespace!) gives the namespace where models are reside
        ConventionRegistry.Register("camelCase", conventionPack, t => t.FullName!.StartsWith(typeof(BoardEntity).Namespace!));

        return services;
    }
}