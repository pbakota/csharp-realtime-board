namespace Stomp.Relay;

public interface IStompMethodExecutor
{
    Task Execute(StompContext context);
}