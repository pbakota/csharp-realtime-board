using Microsoft.AspNetCore.Mvc;

using Stomp.Relay;

using Websocket.Server.Dto;
using Websocket.Server.Helpers;

namespace Websocket.Server.Controllers;

[StompController]
public class WebsocketController
{
    private readonly ILogger<WebsocketController> _logger;
    private readonly IStompPublisher _stompPublisher;

    public WebsocketController(ILogger<WebsocketController> logger, IStompPublisher stompPublisher)
    {
        _logger = logger;
        _stompPublisher = stompPublisher;
    }

    [StompRoute("/incoming/{boardId}")]
    public async Task Incoming([FromRoute] string boardId, RawMessage rawMessage)
    {
        _logger.LogInformation("received message: {}", rawMessage);
        var obj = ConversionHelper.JsonToObject(rawMessage.Message);
        if (obj is CreateBoardItemMessage msg1)
        {
            CreateItem(msg1);
        }
        else if (obj is MoveBoardItemMessage msg2)
        {
            MoveItem(msg2);
        }
        else if (obj is RemoveBoardItemMessage msg3)
        {
            RemoveItem(msg3);
        }
        else if (obj is UserMessage msg4)
        {
            UserMessage(msg4);
        }

        await _stompPublisher.SendAsync($"/topic/outgoing.{boardId}", rawMessage.Message);
    }
    private void CreateItem(CreateBoardItemMessage message)
    {
        _logger.LogInformation(nameof(CreateItem));
    }

    private void UserMessage(UserMessage obj)
    {
        _logger.LogInformation(nameof(UserMessage));
    }

    private void RemoveItem(RemoveBoardItemMessage obj)
    {
        _logger.LogInformation(nameof(RemoveItem));
    }

    private void MoveItem(MoveBoardItemMessage obj)
    {
        _logger.LogInformation(nameof(MoveItem));
    }
}