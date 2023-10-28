
all:

copy-all:
	make copy-docker && make copy-websocket-server && make copy-app

copy-docker:
	rsync -a --info=progress2 docker/* root@playbox:~/csharp-realtime-board-docker
copy-websocket-server:
	rsync -a --info=progress2 releases/websocket-server-linux-x64.tgz root@playbox:~/csharp-realtime-board-docker
copy-app:
	rsync -a --info=progress2 releases/app.tgz root@playbox:~/csharp-realtime-board-docker

