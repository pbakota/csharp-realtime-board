namespace Stomp.Relay;

public interface IStompMethodExecutor
{
    Task Execute(IStompContext context);
}