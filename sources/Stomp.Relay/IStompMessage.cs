namespace Stomp.Relay;

public interface IHeaderValue
{
    string? AsString();
    int? AsInt();
    object? Value { get; set; }
}

public interface IStompMessage
{
    string Command { get; }
    IDictionary<string, IHeaderValue> Headers { get; }
    string Body { get; }
}
