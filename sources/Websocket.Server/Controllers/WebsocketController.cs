using Microsoft.AspNetCore.Mvc;

using Stomp.Relay;

using Websocket.Server.Dto;
using Websocket.Server.Helpers;
using Websocket.Server.Services;

namespace Websocket.Server.Controllers;

[StompController]
public class WebsocketController
{
    private readonly ILogger<WebsocketController> _logger;
    private readonly IStompPublisher _stompPublisher;
    private readonly IBoardService _boardService;

    public WebsocketController(ILogger<WebsocketController> logger, IStompPublisher stompPublisher, IBoardService boardService)
    {
        _logger = logger;
        _stompPublisher = stompPublisher;
        _boardService = boardService;
    }

    [StompRoute("/incoming/{boardId}")]
    public async Task Incoming([FromRoute] string boardId, RawMessage rawMessage)
    {
        _logger.LogInformation("received message: {}", rawMessage);
        var obj = ConversionHelper.JsonToObject(rawMessage.Message);
        if (obj is CreateBoardItemMessage msg1)
        {
            await CreateItemAsync(msg1);
        }
        else if (obj is MoveBoardItemMessage msg2)
        {
            await MoveItem(msg2);
        }
        else if (obj is RemoveBoardItemMessage msg3)
        {
            await RemoveItem(msg3);
        }
        else if (obj is UserMessage msg4)
        {
            await UserMessage(msg4);
        }

        await _stompPublisher.SendAsync($"/topic/outgoing.{boardId}", rawMessage.Message);
    }

    private async Task CreateItemAsync(CreateBoardItemMessage message)
    {
        var board = await _boardService.FindBoardByNameAsync(message.BoardName);
        if (board is not null)
        {
            await _boardService.CreateBoardItemAsync(
                boardId: board.Id!,
                id: message.Id,
                type: message.ItemType,
                position: message.Position,
                size: message.Size,
                faceColor: message.FaceColor,
                borderColor: message.BorderColor,
                strokeWidth: message.StrokeWidth
            );
        }
        else
        {
            _logger.LogWarning("Board {} does not exist", message.BoardName);
        }
    }

    private async Task UserMessage(UserMessage message)
        => await _boardService.StoreUserMessageAsync(message.BoardName, message.User, message.Message);

    private async Task RemoveItem(RemoveBoardItemMessage message)
        => await _boardService.RemoveBoardItemAsync(message.Id);

    private async Task MoveItem(MoveBoardItemMessage message)
        => await _boardService.MoveBoardItemAsync(message.Id, message.Position);
}