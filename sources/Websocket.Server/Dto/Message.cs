using Websocket.Server.Utils;

namespace Websocket.Server.Dto;

public abstract record MessageHeader
{
    public string Type { get; set; } = null!;
    public string? BoardName { get; set; }
}

public abstract record Message : MessageHeader
{
    public string Id { get; set; } = null!;
}

public record UserMessage : MessageHeader
{
    public string User { get; set; } = null!;
    public string Message { get; set; } = null!;
}

public record CreateBoardItemMessage : Message
{
    public string ItemType { get; set; } = null!;
    private Vector2d Position { get; set; } = null!;
    private Vector2d Size { get; set; } = null!;
    public string FaceColor { get; set; } = null!;
    public string BorderColor { get; set; } = null!;
    private int StrokeWidth { get; set; }
}

public record MoveBoardItemMessage : Message
{
    private Vector2d Position { get; set; } = null!;
}

public record RemoveBoardItemMessage : Message
{
}

public record RawMessage
{
    public string Message { get; set; } = null!;
}
