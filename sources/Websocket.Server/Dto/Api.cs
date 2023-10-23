using System.Text.Json;

namespace Websocket.Server.Dto;

public record ApiRequest
{
    public string Method { get; set; } = null!;
    public object[] Args { get; set; } = Array.Empty<object>();

    public T? GetArg<T>(int index)
        => index >= 0 && !(index > Args?.Length)
            ? ((JsonElement)Args![index]).Deserialize<T>()
            : throw new ArgumentOutOfRangeException(nameof(index));
}

public record ApiResponse
{
    public object? Body { get; set; }
}