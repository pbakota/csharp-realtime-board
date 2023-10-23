namespace Websocket.Server.Configuration;

public record MongoDbSettings
{
    public string ConnectionString { get; set; } = null!;
    public string Database { get; set; } = null!;
}