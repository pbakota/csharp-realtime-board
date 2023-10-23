using System.Text.Json;

using Websocket.Server.Dto;

namespace Websocket.Server.Helpers;

public static class ConversionHelper
{
    private static Dictionary<string, object>? JsonToDictionary(string json) => JsonSerializer.Deserialize<Dictionary<string,object>>(json);

    public static object? JsonToObject(string json)
    {
        var obj = JsonToDictionary(json);
        return obj?["type"].ToString() switch
        {
            "USER_MESSAGE" => JsonSerializer.Deserialize<UserMessage>(json),
            "OBJECT_CREATED" => JsonSerializer.Deserialize<CreateBoardItemMessage>(json),
            "OBJECT_MOVED" => JsonSerializer.Deserialize<MoveBoardItemMessage>(json),
            "OBJECT_REMOVED" => JsonSerializer.Deserialize<RemoveBoardItemMessage>(json),
            _ => throw new ArgumentException($"Not a valid message type {obj?["type"]}")
        };
    }
}