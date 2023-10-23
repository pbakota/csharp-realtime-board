using System.Text;

using Stomp.Relay.Messages;

namespace Stomp.Relay;

internal class StompMessageSerializer
{
    public static string Serialize(IStompMessage message)
        => new StringBuilder()
            .Append(message.Command).Append('\n')
            .Append(string.Join('\n', message.Headers.Select(kvp => $"{kvp.Key}:{kvp.Value.Value}"))).Append('\n')
            .Append('\n')
            .Append(message.Body).Append('\0')
            .ToString();

    public static IStompMessage Deserialize(ArraySegment<byte> bytes)
        => Deserialize(Encoding.UTF8.GetString(bytes));

    public static IStompMessage Deserialize(string message)
    {
        using var reader = new StringReader(message);
        var command = reader.ReadLine() ?? throw new ArgumentException("Expected command");

        var stompMessage = new StompMessageBuilder(command);

        var header = reader.ReadLine();
        while (!string.IsNullOrEmpty(header))
        {
            var split = header.Split(':');
            if (split.Length != 2)
                throw new ArgumentException("Malformed header");

            stompMessage.Header(split[0].Trim(), split[1].Trim());
            header = reader.ReadLine() ?? string.Empty;
        }

        var body = string.Empty;
        if (!string.IsNullOrEmpty(command))
        {
            body = reader.ReadToEnd();
            body = body.TrimEnd('\r', '\n', '\0');
        }

        return stompMessage.WithBody(body);
    }
}