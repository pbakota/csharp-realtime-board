FROM mcr.microsoft.com/dotnet/aspnet:6.0
RUN mkdir -p /app/wwwroot
ADD websocket-server-linux-x64.tgz /app/
ADD app.tgz /app/wwwroot/
WORKDIR /app
RUN chmod +x /app/Websocket.Server
ENTRYPOINT ["/app/Websocket.Server"]
