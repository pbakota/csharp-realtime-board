using Microsoft.AspNetCore.Http;

namespace Stomp.Relay;

public interface IStompMessageDispatcher
{
    Task<bool> DispatchMessageAsync(HttpContext context, ArraySegment<byte> bytes, CancellationToken token);
}