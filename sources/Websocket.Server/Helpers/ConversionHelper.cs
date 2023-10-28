using System.Text.Json;
using System.Text.RegularExpressions;

using Websocket.Server.Dto;

namespace Websocket.Server.Helpers;

public static class ConversionHelper
{
    private static readonly Regex RxMessageType = new Regex("^\\{\"type\"\\s*:\\s*\"(?<type>[0-9a-z_\\-]+)\"", RegexOptions.IgnoreCase | RegexOptions.Compiled | RegexOptions.Singleline);
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true, };
    public static object? JsonToObject(string json)
    {
        var m = RxMessageType.Match(json);
        var type = m.Success ? m.Groups["type"].Value : string.Empty;
        return type switch
        {
            "USER_MESSAGE" => JsonSerializer.Deserialize<UserMessage>(json,JsonOptions),
            "OBJECT_CREATED" => JsonSerializer.Deserialize<CreateBoardItemMessage>(json,JsonOptions),
            "OBJECT_MOVED" => JsonSerializer.Deserialize<MoveBoardItemMessage>(json,JsonOptions),
            "OBJECT_REMOVED" => JsonSerializer.Deserialize<RemoveBoardItemMessage>(json,JsonOptions),
            _ => throw new ArgumentException($"Not a valid message type {type}")
        };
    }
}