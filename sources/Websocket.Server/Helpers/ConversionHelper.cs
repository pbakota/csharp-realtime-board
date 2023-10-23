using System.Text.Json;

using Websocket.Server.Dto;

namespace Websocket.Server.Helpers;

public static class ConversionHelper
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true, };
    private static Dictionary<string, object>? JsonToDictionary(string json) => JsonSerializer.Deserialize<Dictionary<string, object>>(json);

    public static object? JsonToObject(string json)
    {
        var obj = JsonToDictionary(json);
        return obj?["type"].ToString() switch
        {
            "USER_MESSAGE" => JsonSerializer.Deserialize<UserMessage>(json,JsonOptions),
            "OBJECT_CREATED" => JsonSerializer.Deserialize<CreateBoardItemMessage>(json,JsonOptions),
            "OBJECT_MOVED" => JsonSerializer.Deserialize<MoveBoardItemMessage>(json,JsonOptions),
            "OBJECT_REMOVED" => JsonSerializer.Deserialize<RemoveBoardItemMessage>(json,JsonOptions),
            _ => throw new ArgumentException($"Not a valid message type {obj?["type"]}")
        };
    }
}