using MongoDB.Driver;

namespace Websocket.Server.Interfaces;

public interface IMongodbContext
{
    IMongoDatabase GetDb();
    IMongoClient GetClient();
    Task<IClientSessionHandle> StartSessionAsync();
    Task<TObject> UseTransactionAsync<TObject>(Func<IClientSessionHandle,Task<TObject>> func);
    Task UseTransactionAsync(Func<IClientSessionHandle,Task> func);
    IMongoCollection<TDocument> GetCollection<TDocument>(string name) where TDocument : class;
}