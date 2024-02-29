using DrawGuessQuest.Server.Game;
using DrawGuessQuest.Server.Models;

namespace DrawGuessQuest.Server.Interfaces
{
    public interface ILobbyService
    {
        Dictionary<Guid, GameContext> Games { get; }
        Task JoinGame(Guid gameId, Player player);
        Task LeftGame(string connectionId);
    }
}
