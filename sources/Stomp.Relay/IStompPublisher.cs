namespace Stomp.Relay;

public interface IStompPublisher
{
    Task SendAsync<T>(string topic, T message, Dictionary<string, object>? headers = default) where T: class;
}