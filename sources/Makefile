all: build

build:
	dotnet build -c Debug
run:
	dotnet watch run -c Debug --project Websocket.Server/Websocket.Server.csproj

clean:
	dotnet clean

package-all:
	make package-websocket && make package-app

package-websocket:
	rm -rf ../releases/linux-x64 && dotnet publish -f "net6.0" -c Release Websocket.Server/Websocket.Server.csproj -r linux-x64 --output ../releases/linux-x64 --no-self-contained && \
	cd ../releases/linux-x64 && tar -zcf ../websocket-server-linux-x64.tgz * && cd -

package-app:
	tar -zcvf ../releases/app.tgz -C app/public/ .

