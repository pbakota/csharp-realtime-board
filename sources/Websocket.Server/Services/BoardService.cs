using System.Data;

using MongoDB.Driver;

using Websocket.Server.Interfaces;

using Websocket.Server.Models;
using Websocket.Server.Utils;

namespace Websocket.Server.Services;

public interface IBoardService
{
    Task<BoardEntity> CreateBoardAsync(string boardName);
    Task<BoardItemEntity> CreateBoardItemAsync(string boardId, string id, string type, Vector2d position, Vector2d size, string faceColor, string borderColor, int strokeWidth);
    Task<BoardEntity?> FindBoardByNameAsync(string boardName);
    Task<IEnumerable<BoardItemEntity>> GetBoardItemsByNameAsync(string boardName);
    Task MoveBoardItemAsync(string id, Vector2d position);
    Task RemoveBoardItemAsync(string id);
    Task<IEnumerable<UserMessageEntity>> GetLatestMessagesAsync(string boardName, int limit);
    Task StoreUserMessageAsync(string boardName, string user, string message);
}

public class BoardService : IBoardService
{
    private readonly IMongodbContext _dbContext;
    private readonly IMongoCollection<BoardEntity> _boardCollection;
    private readonly IMongoCollection<BoardItemEntity> _itemCollection;
    private readonly IMongoCollection<UserMessageEntity> _messageCollection;

    public BoardService(IMongodbContext dbContext)
    {
        _dbContext = dbContext;

        _boardCollection = _dbContext.GetCollection<BoardEntity>("boards");
        _itemCollection = _dbContext.GetCollection<BoardItemEntity>("board_items");
        _messageCollection = _dbContext.GetCollection<UserMessageEntity>("messages");
    }

    public async Task<BoardEntity> CreateBoardAsync(string boardName)
    {
        var exists = await _boardCollection.Find(x => x.Name == boardName).AnyAsync();
        if (exists)
        {
            throw new DuplicateNameException($"Board with name '{boardName}' already exists");
        }

        var newBoard = new BoardEntity
        {
            Name = boardName,
        };
        await _boardCollection.InsertOneAsync(newBoard);

        return newBoard;
    }

    public async Task<BoardItemEntity> CreateBoardItemAsync(string boardId, string id, string type, Vector2d position, Vector2d size,
        string faceColor, string borderColor, int strokeWidth)
    {
        var newItem = new BoardItemEntity
        {
            BoardId = boardId,
            Id = id,
            Type = Enum.Parse<BoardItemType>(type, ignoreCase: true),
            Position = position,
            Size = size,
            FaceColor = faceColor,
            BorderColor = borderColor,
            StrokeWidth = strokeWidth,
        };

        await _itemCollection.InsertOneAsync(newItem);
        return newItem;
    }

    public async Task<BoardEntity?> FindBoardByNameAsync(string boardName)
        => await _boardCollection.Find(x => x.Name == boardName).FirstOrDefaultAsync();

    public async Task<IEnumerable<BoardItemEntity>> GetBoardItemsByNameAsync(string boardName)
    {
        var board = await _boardCollection.Find(x => x.Name == boardName).FirstOrDefaultAsync();
        return board is not null
            ? await _itemCollection.Find(x => x.BoardId == board.Id).ToListAsync()
            : Array.Empty<BoardItemEntity>();
    }

    public async Task<IEnumerable<UserMessageEntity>> GetLatestMessagesAsync(string boardName, int limit)
    {
        var board = await _boardCollection.Find(x => x.Name == boardName).FirstOrDefaultAsync();
        if (board is null)
        {
            return Array.Empty<UserMessageEntity>();
        }
        var result = await _messageCollection.Find(x => x.BoardId == board.Id).SortByDescending(s => s.CreatedAt).Skip(0).Limit(limit).ToListAsync();

        // NOTE: The result will contain an ordered list of user messages, but it will be in the wrong order
        // because the first element will be the last message, however, what we need is to be naturally sorted
        // which means the last message should be the last in the list. That is why we reverse the list here.
        result.Reverse();
        return result;
    }

    public async Task MoveBoardItemAsync(string id, Vector2d position)
        => await _itemCollection.UpdateOneAsync(f => f.Id == id, Builders<BoardItemEntity>.Update.Set(s => s.Position, position));

    public async Task RemoveBoardItemAsync(string id)
        => await _itemCollection.DeleteOneAsync(f => f.Id == id);

    public async Task StoreUserMessageAsync(string boardName, string user, string message)
    {
        var board = await _boardCollection.Find(x => x.Name == boardName).FirstOrDefaultAsync();
        if (board is null)
        {
            return;
        }

        var newMessage = new UserMessageEntity
        {
            BoardId = board.Id!,
            Message = message,
            User = user,
        };

        await _messageCollection.InsertOneAsync(newMessage);
    }
}