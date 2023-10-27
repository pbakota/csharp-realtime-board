using Microsoft.AspNetCore.Mvc;

using Stomp.Relay;

using Websocket.Server.Dto;
using Websocket.Server.Services;

namespace Websocket.Server.Controllers;

[StompController]
public class WebsocketApiController
{
    private readonly ILogger<WebsocketApiController> _logger;
    private readonly IStompPublisher _stompPublisher;
    private readonly IBoardService _boardService;

    public WebsocketApiController(ILogger<WebsocketApiController> logger, IStompPublisher stompPublisher, IBoardService boardService)
    {
        _logger = logger;
        _stompPublisher = stompPublisher;
        _boardService = boardService;
    }

    [StompRoute("/api/request")]
    public async Task ApiCall([FromHeader(Name = "correlation-id")] string correlationId, [FromHeader(Name = "reply-to")] string replyTo, ApiRequest apiRequest)
    {
        _logger.LogInformation("Received: {}, correlationId={}, replyTo={}, request={}", apiRequest, correlationId, replyTo, apiRequest);

        var reply = await ApiMethodDispatcher(apiRequest);
        _logger.LogInformation("Reply: {}", reply);

        await _stompPublisher.SendAsync(replyTo, reply, new Dictionary<string, object> {
            { "correlation-id", correlationId }
        });
    }

    private async Task<ApiResponse> ApiMethodDispatcher(ApiRequest apiRequest)
    {
        ApiResponse reply;
        switch (apiRequest.Method)
        {
            case "get-board-items":
                {
                    reply = await GetBoardItems(apiRequest.GetArg<string>(0)!);
                }
                break;
            case "get-board-messages":
                {
                    reply = await GetLatestBoardMessages(apiRequest.GetArg<string>(0)!);
                }
                break;
            default:
                throw new ArgumentException("Invalid API method");
        }
        return reply;
    }

    private async Task<ApiResponse> GetLatestBoardMessages(string boardName)
    {
        _logger.LogInformation("{} BoardName={}", nameof(GetLatestBoardMessages), boardName);

        var result = await _boardService.GetLatestMessagesAsync(boardName, 20);
        return new ApiResponse
        {
            Body = result,
        };
    }

    private async Task<ApiResponse> GetBoardItems(string boardName)
    {
        _logger.LogInformation("{} BoardName={}", nameof(GetBoardItems), boardName);

        var board = await _boardService.FindBoardByNameAsync(boardName);

        // Auto create board if needed
        if (board is null)
        {
            await _boardService.CreateBoardAsync(boardName);
        }

        var result = await _boardService.GetBoardItemsByNameAsync(boardName);
        return new ApiResponse
        {
            Body = result,
        };
    }
}