using DrawGuessQuest.Server.Interfaces;
using DrawGuessQuest.Server.Models;
using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace DrawGuessQuest.Server.Hubs
{
    public class GameHub : Hub<IGameClient>
    {
        private readonly ILobbyService _lobbyService;

        public GameHub(ILobbyService lobbyService)
        {
            _lobbyService = lobbyService;
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"Connection {Context.ConnectionId} connected");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var connectionId = Context.ConnectionId;
            Console.WriteLine($"Connection {connectionId} disconnected.");
            await _lobbyService.LeftGame(Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinGroup(Guid gameId, string username)
        {
            var user = new Player
            {
                Id = Guid.NewGuid(),
                ConnectionId = Context.ConnectionId,
                Username = username,
                Score = 0
            };
            await Groups.AddToGroupAsync(Context.ConnectionId, gameId.ToString());
            await _lobbyService.JoinGame(gameId, user);

        }

        public async Task DrawLine(Guid gameId, DrawnLine drawModel)
        {
            await _lobbyService.Games[gameId].DrawLine(Context.ConnectionId, drawModel);
        }

        public async Task ClearPainting(Guid gameId)
        {
            await _lobbyService.Games[gameId].ClearPainting(Context.ConnectionId);
        }

        public async Task SendMessage(Guid gameId, string message)
        {
            await _lobbyService.Games[gameId].CheckMessage(Context.ConnectionId, message);
        }

        public async Task StartRound(Guid gameId, string newWord)
        {
            await _lobbyService.Games[gameId].StartRound(Context.ConnectionId, newWord);
        }
    }
}
