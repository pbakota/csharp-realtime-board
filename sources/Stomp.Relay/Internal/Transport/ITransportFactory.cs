namespace Stomp.Relay.Transport;

internal interface ITransportFactory<T>
{
    IStompTransport CreateTransport(params object[]? arg);
}