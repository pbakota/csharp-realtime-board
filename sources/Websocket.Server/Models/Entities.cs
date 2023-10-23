
using System.Text.Json.Serialization;

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

using Websocket.Server.Utils;

namespace Websocket.Server.Models;

public enum BoardItemType
{
    CIRCLE,
    RECT,
    TRIANGLE,
}

public record BoardItemEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string? Id { get; set; }
    public string BoardId { get; set; } = null!;
    [JsonConverter(typeof(JsonStringEnumConverter))]
    [BsonRepresentation(BsonType.String)]
    public BoardItemType Type { get; set; }
    public Vector2d Position { get; set; } = null!;
    public Vector2d Size { get; set; } = null!;
    public string? FaceColor { get; set; }
    public string? BorderColor { get; set; }
    public int StrokeWidth { get; set; }
}

public record BoardEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public string Name { get; set; } = null!;
}

public class UserMessageEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string BoardId { get; set; } = null!;
    public string User { get; set; } = null!;
    public string Message { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
