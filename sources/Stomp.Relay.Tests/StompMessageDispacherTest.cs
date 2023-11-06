using System.Text;

using FluentAssertions;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

using Moq;

using Stomp.Relay.Config;

namespace Stomp.Relay;

public class DefaultStompMessageDispatcherTest
{
    [Fact]
    public async Task DispatcherTest()
    {
        var logger = new Mock<ILogger<DefaultStompMessageDispatcher>>();
        var methodExecutor = new Mock<IStompMethodExecutor>();

        var config = new StompRelayConfig {
            AppPrefixes = new [] { "/app", }
        };

        var dispatcher = new DefaultStompMessageDispatcher(logger.Object, config, methodExecutor.Object);

        var context = new Mock<HttpContext>();

        {
            var bytes = Encoding.UTF8.GetBytes("CONNECT\naccept-version:1.2,1.1,1.0\nheart-beat:10000,10000\n\n\0");
            var result = await dispatcher.DispatchMessageAsync(context.Object, bytes, CancellationToken.None);
            result.Should().BeFalse();
        }

        {
            var bytes = Encoding.UTF8.GetBytes("SEND\ndestination:/app/api/request\nreply-to:/queue/replies-fed3f8fc-a920-44d4-84e9-993f825424c4\ncorrelation-id:8f1d07f7-e00e-4e34-a956-448750c3beef\ncontent-length:50\n\n{}\0");
            var result = await dispatcher.DispatchMessageAsync(context.Object, bytes, CancellationToken.None);
            result.Should().BeTrue();
        }

    }
}
