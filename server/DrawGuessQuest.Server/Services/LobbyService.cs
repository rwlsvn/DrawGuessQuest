using DrawGuessQuest.Server.Game;
using DrawGuessQuest.Server.Interfaces;
using DrawGuessQuest.Server.Models;

namespace DrawGuessQuest.Server.Services
{
    public class LobbyService : ILobbyService
    {
        IGameNotificationService _notificationService;

        public Dictionary<Guid, GameContext> Games { get; } = new();
        private Dictionary<string, Guid> _playerGames = new();

        public LobbyService(IGameNotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task JoinGame(Guid gameId, Player player)
        {
            if (!Games.TryGetValue(gameId, out GameContext? game))
            {
                game = new GameContext(gameId, player, _notificationService);
                Games.Add(gameId, game);

                /* 
                 The first painter is initialized in the constructor, 
                 so we need to notify him that he is a painter
                */
                await _notificationService.NewTurnAsync(gameId, player,
                    [new PlayerInfo { Id = player.Id, Username = player.Username, Score = 0 }]);
            }
            else
            {
                await game.AddNewPlayer(player);
            }

            _playerGames.Add(player.ConnectionId, gameId);
        }

        public async Task LeftGame(string connectionId)
        {
            if (_playerGames.TryGetValue(connectionId, out Guid gameId))
            {
                await Games[gameId].RemovePlayer(connectionId);
                _playerGames.Remove(connectionId);
                if (Games[gameId].UserCount == 0)
                {
                    Games.Remove(gameId);
                }
            }
        }
    }
}
