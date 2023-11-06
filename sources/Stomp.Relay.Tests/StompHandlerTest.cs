using System.Net.WebSockets;

using FluentAssertions;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

using Moq;

using Stomp.Relay.Config;
using Stomp.Relay.Transport;

namespace Stomp.Relay.Tests;

public class StompHandlerTest
{
    [Fact]
    public async Task HandlerTest()
    {
        var logger = new Mock<ILogger<StompHandler>>();
        var config = new StompRelayConfig {
            BrokerHost = "fakebroker",
            BrokerLogin = "foo",
            BrokerPasscode = "bar"
        };

        var dispatcher = new Mock<IStompMessageDispatcher>();
        var wsTransportFactory = new Mock<ITransportFactory<WebSocketTransport>>();
        var tcpTransportFactory = new Mock<ITransportFactory<TcpTransport>>();
        var tcpTransportAccessor = new Mock<ITcpTransportAccessor>();

        var context = new Mock<HttpContext>();
        var websocket = new Mock<WebSocket>();

        // Mock websocket transport
        var wsTransport = new Mock<IStompTransport>();
        wsTransportFactory.Setup(x => x.CreateTransport(It.IsAny<WebSocket>())).Returns(wsTransport.Object);

        // Mock tcp transport
        var tcpTransport = new Mock<IStompTransport>();
        tcpTransportFactory.Setup(x => x.CreateTransport(It.IsAny<string>(), It.IsAny<int>())).Returns(tcpTransport.Object);

        var bytes = new ArraySegment<byte>(new byte[] { 
            (byte)'C', 
            (byte)'O', 
            (byte)'N', 
            (byte)'N', 
            (byte)'E', 
            (byte)'C', 
            (byte)'T' 
        });

        var handler = new StompHandler(logger.Object,
            config,
            dispatcher.Object,
            wsTransportFactory.Object,
            tcpTransportFactory.Object,
            tcpTransportAccessor.Object);
        
        {
            tcpTransport.Setup(x => x.ReadAsync(It.IsAny<CancellationToken>())).Returns(() => Task.FromResult(bytes));
            tcpTransport.SetupSequence(x => x.IsClosed())
                .Returns(false)
                .Returns(true);
            wsTransport.SetupSequence(x => x.IsClosed())
                .Returns(false)
                .Returns(true);

            dispatcher.Setup(x => x.DispatchMessageAsync(It.IsAny<HttpContext>(), It.IsAny<ArraySegment<byte>>(), It.IsAny<CancellationToken>()))
                .Returns(Task.FromResult(false));

            var action = () => handler.Handle(websocket.Object, context.Object, CancellationToken.None);

            await action.Should().NotThrowAsync();
        }
    }
}