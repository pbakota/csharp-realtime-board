using System.Text.Json;

namespace Stomp.Relay.Messages;

public interface IHeaderValue {
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

internal class HeaderValue : IHeaderValue
{
    private object? _value;
    public object? Value { get => _value; set => _value = value; }

    public int? AsInt() => (int?)_value;

    public string? AsString() => (string?)_value;
    public HeaderValue(object? value)
    {
        _value = value;
    }
}

internal class StompMessage : IStompMessage
{
    private readonly string _command;
    private readonly Dictionary<string, IHeaderValue> _headers;
    private readonly string _body;
    public StompMessage(string command, Dictionary<string, IHeaderValue> headers, string body)
    {
        _command = command;
        _headers = headers;
        _body = body;
    }
    public string Command => _command;
    public IDictionary<string, IHeaderValue> Headers => _headers;
    public string Body => _body;
    public override string ToString()
        => JsonSerializer.Serialize(this);
}
