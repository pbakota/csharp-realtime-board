using Microsoft.AspNetCore.Mvc;

using Stomp.Relay;

using Websocket.Server.Dto;

namespace Websocket.Server.Controllers;

[StompController]
public class WebsocketApiController
{
    private readonly ILogger<WebsocketApiController> _logger;
    private readonly IStompPublisher _stompPublisher;

    public WebsocketApiController(ILogger<WebsocketApiController> logger, IStompPublisher stompPublisher)
    {
        _logger = logger;
        _stompPublisher = stompPublisher;

    }

    [StompRoute("/api/request")]
    public async void ApiCall([FromHeader(Name = "correlation-id")] string correlationId, [FromHeader(Name = "reply-to")] string replyTo, ApiRequest apiRequest)
    {
        _logger.LogInformation("Received: {}, correlationId={}, replyTo={}, request={}", apiRequest, correlationId, replyTo, apiRequest);

        var reply = ApiMethodDispatcher(apiRequest);
        _logger.LogInformation("Reply: {}", reply);

        await _stompPublisher.SendAsync(replyTo, reply, new Dictionary<string, object> {
            { "correlation-id", correlationId }
        });
    }

    private ApiResponse ApiMethodDispatcher(ApiRequest apiRequest)
    {
        ApiResponse reply;
        switch (apiRequest.Method)
        {
            case "get-board-items":
                {
                    reply = GetBoardItems(apiRequest.GetArg<string>(0)!);
                }
                break;
            case "get-board-messages":
                {
                    reply = GetLatestBoardMessages(apiRequest.GetArg<string>(0)!);
                }
                break;
            default:
                throw new ArgumentException("Invalid API method");
        }
        return reply;
    }

    private ApiResponse GetLatestBoardMessages(string boardName)
    {
        _logger.LogInformation("{} BoardName={}", nameof(GetLatestBoardMessages), boardName);

        return new ApiResponse {
            Body = Array.Empty<object>()
        };
    }


    private ApiResponse GetBoardItems(string boardName)
    {
        _logger.LogInformation("{} BoardName={}", nameof(GetBoardItems), boardName);

        return new ApiResponse {
            Body = Array.Empty<object>()
        };
    }

}