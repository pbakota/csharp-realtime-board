using Microsoft.Extensions.Options;

using MongoDB.Driver;

using Websocket.Server.Configuration;

using Websocket.Server.Interfaces;

namespace Websocket.Server.Models;

public class MongodbContext : IMongodbContext
{
    private readonly IMongoClient _client = null!;
    private readonly MongoDbSettings _mongoOptions = null!;
    public MongodbContext(IMongoClient client, IOptions<MongoDbSettings> options)
    {
        _client = client;
        _mongoOptions = options.Value;
    }
    public IMongoDatabase GetDb() => _client.GetDatabase(_mongoOptions.Database);
    public IMongoClient GetClient() => _client;
    public async Task<IClientSessionHandle> StartSessionAsync() => await _client.StartSessionAsync();
    public IMongoCollection<TDocument> GetCollection<TDocument>(string collectionName) where TDocument : class
        => GetDb().GetCollection<TDocument>(collectionName);

    public async Task<TObject> UseTransactionAsync<TObject>(Func<IClientSessionHandle, Task<TObject>> func)
    {
        using var session = await _client.StartSessionAsync();
        session.StartTransaction(new TransactionOptions(readConcern: ReadConcern.Snapshot, writeConcern: WriteConcern.WMajority));
        try
        {
            var result = await func(session).ConfigureAwait(false);
            await session.CommitTransactionAsync();

            return result;
        }
        catch
        {
            await session.AbortTransactionAsync();
            throw;
        }
    }

    public async Task UseTransactionAsync(Func<IClientSessionHandle, Task> func)
    {
        using var session = await _client.StartSessionAsync();
        session.StartTransaction(new TransactionOptions(readConcern: ReadConcern.Snapshot, writeConcern: WriteConcern.WMajority));
        try
        {
            await func(session).ConfigureAwait(false);
            await session.CommitTransactionAsync();
        }
        catch
        {
            await session.AbortTransactionAsync();
            throw;
        }
    }
}