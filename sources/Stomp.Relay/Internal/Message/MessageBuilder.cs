namespace Stomp.Relay.Messages;

internal class StompMessageBuilder
{
    private readonly string _command;

    private readonly Dictionary<string, IHeaderValue> _headers = new();

    public StompMessageBuilder(string command) => _command = command;
    public StompMessageBuilder(IStompMessage message)
    {
        _command = message.Command;
        foreach (var h in message.Headers)
        {
            Header(h.Key, h.Value.Value!);
        }
    }

    public StompMessageBuilder Header(string key, object value)
    {
        if(_headers.ContainsKey(key))
            _headers[key] = new HeaderValue(value);
        else
            _headers.Add(key, new HeaderValue(value));
        return this;
    }

    public StompMessageBuilder Headers(IDictionary<string, object>? headers)
    {
        if (headers is not null)
        {
            foreach (var kvp in headers)
            {
                Header(kvp.Key, kvp.Value);
            }
        }
        return this;
    }

    public IStompMessage WithBody(string body) => new StompMessage(_command, GetHeaders(), body);

    public IStompMessage WithoutBody() => new StompMessage(_command, GetHeaders(), string.Empty);

    private Dictionary<string, IHeaderValue> GetHeaders()
        => _headers.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
}