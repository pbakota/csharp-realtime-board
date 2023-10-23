
using MongoDB.Bson.Serialization.Attributes;

namespace Websocket.Server.Utils;

public record Vector2d
{
    [BsonElement("x")]
    public int X { get; set; }
    [BsonElement("y")]
    public int Y { get; set; }
}
