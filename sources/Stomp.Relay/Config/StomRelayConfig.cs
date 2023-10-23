using System.Reflection;

namespace Stomp.Relay.Config;

public record StompRelayConfig
{
    public string RelayHost { get; set; } = "localhost";
    public int RelayPort { get; set; } = 61613;
    public string[] AppPrefixes { get; set; } = Array.Empty<string>();
    public string[] EnableRelay { get; set; } = Array.Empty<string>();
    public Assembly[] SearchIn { get; set; } = Array.Empty<Assembly>();
}