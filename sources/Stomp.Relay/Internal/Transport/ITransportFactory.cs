namespace Stomp.Relay.Transport;

internal interface ITransportFactory<T>
{
    T CreateTransport(params object[]? arg);
}