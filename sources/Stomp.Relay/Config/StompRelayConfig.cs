using System.Reflection;
using System.Text.Json;

namespace Stomp.Relay.Config;

public record StompRelayConfig
{
    public string BrokerHost { get; set; } = "localhost";
    public int BrokerPort { get; set; } = 61613;
    public string BrokerLogin { get;set;} = "guest";
    public string BrokerPasscode { get;set;} = "guest";
    public string[] AppPrefixes { get; set; } = Array.Empty<string>();
    public string[] EnableRelay { get; set; } = Array.Empty<string>();
    public Assembly[] SearchIn { get; set; } = Array.Empty<Assembly>();
    public JsonNamingPolicy NamingPolicy  { get;set;} = JsonNamingPolicy.CamelCase;
}