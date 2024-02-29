using DrawGuessQuest.Server.Hubs;
using DrawGuessQuest.Server.Interfaces;
using DrawGuessQuest.Server.Models;
using Microsoft.AspNetCore.SignalR;

namespace DrawGuessQuest.Server.Services
{
    public class GameNotificationService : IGameNotificationService
    {
        IHubContext<GameHub, IGameClient> _hubContext;

        public GameNotificationService
            (IHubContext<GameHub, IGameClient> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task PlayerJoinGameAsync(Player joinedPlayer, GameInfo gameInfo)
        {
            var playerInfo = new PlayerInfo()
            {
                Id = joinedPlayer.Id,
                Username = joinedPlayer.Username,
                Score = joinedPlayer.Score,
            };
            await _hubContext.Clients.GroupExcept(gameInfo.Id.ToString(), joinedPlayer.ConnectionId)
                .PlayerJoinGame(playerInfo);
            await _hubContext.Clients.Client(joinedPlayer.ConnectionId)
                .ClearPainting();
            await _hubContext.Clients.Client(joinedPlayer.ConnectionId)
                .DrawPainting(gameInfo.DrawnLines);
            await _hubContext.Clients.Client(joinedPlayer.ConnectionId)
                .PlayersInfo(gameInfo.Players);
            await _hubContext.Clients.Client(joinedPlayer.ConnectionId)
                .NewPainter(gameInfo.Painter.Username);
            await _hubContext.Clients.Client(joinedPlayer.ConnectionId)
                .SetWord(gameInfo.WordLength);
            await _hubContext.Clients.Client(joinedPlayer.ConnectionId)
                .RemainingTimeMilliseconds(gameInfo.RemainingTimeMilliseconds);
        }

        public async Task PlayerLeftGameAsync(Guid gameId, Guid userId)
        {
            await _hubContext.Clients.Group(gameId.ToString()).PlayerLeftGame(userId);
        }
        public async Task DrawLineAsync(Guid gameId, string painterId,
            DrawnLine drawModel)
        {
            await _hubContext.Clients.GroupExcept(gameId.ToString(), painterId)
                .DrawLine(drawModel);
        }
        public async Task ClearPainting(Guid gameId)
        {
            await _hubContext.Clients.Group(gameId.ToString()).ClearPainting();
        }

        public async Task NotifyWinAsync(Guid gameId, string winnerName,
            string word)
        {
            await _hubContext.Clients.Group(gameId.ToString())
                .NotifyWin(winnerName, word);
        }

        public async Task NewTurnAsync(Guid gameId, Player painter,
            List<PlayerInfo> players)
        {
            await _hubContext.Clients.Client(painter.ConnectionId).NotifyPainter();
            await _hubContext.Clients.GroupExcept(gameId.ToString(), painter.ConnectionId)
                .NewPainter(painter.Username);
            await _hubContext.Clients.Group(gameId.ToString()).PlayersInfo(players);
            await _hubContext.Clients.Group(gameId.ToString()).NewTurn();
            await _hubContext.Clients.Group(gameId.ToString()).ClearPainting();
        }

        public async Task ReceiveMessageAsync(Guid gameId, string message, string username)
        {
            await _hubContext.Clients.Group(gameId.ToString())
                .ReceiveMessage(message, username);
        }

        public async Task RoundStartAsync(Guid gameId, int wordLength)
        {
            await _hubContext.Clients.Group(gameId.ToString())
               .RoundStarted();
            await _hubContext.Clients.Group(gameId.ToString())
               .SetWord(wordLength);
        }
    }
}
